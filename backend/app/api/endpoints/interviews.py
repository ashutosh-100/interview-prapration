import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import User, UserProfile, Resume, Interview, QuestionResponse, PerformanceReport
from app.schemas.schemas import InterviewCreate, InterviewResponse, InterviewDetailsResponse, QuestionResponseCreate, QuestionResponseResponse, PerformanceReportResponse
from app.api.deps import get_current_user
from app.services.ai_service import AIService
from app.services.code_executor import CodeExecutor

router = APIRouter()

@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def start_interview(
    interview_in: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve user profile to find domains
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your profile details first."
        )

    # Initialize Interview in DB
    new_interview = Interview(
        user_id=current_user.id,
        type=interview_in.type,
        difficulty=interview_in.difficulty,
        status="in_progress",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    return new_interview

@router.get("/history", response_model=list[InterviewResponse])
def get_interview_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interviews = db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.desc()).all()
    return interviews

@router.get("/{interview_id}", response_model=InterviewDetailsResponse)
def get_interview_details(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
        
    if interview.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    return {
        "interview": interview,
        "responses": interview.responses,
        "report": interview.report,
        "recordings": interview.recordings
    }

@router.post("/{interview_id}/next-question")
def get_next_question(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    if interview.status != "in_progress":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interview is not active")

    # Load User profile domains, language
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    domains = [d.strip() for d in profile.selected_domains.split(",") if d.strip()] if profile else []
    language = profile.preferred_language if profile else "en"

    # Get latest uploaded resume context if any
    resume_context = None
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.uploaded_at.desc()).first()
    if resume:
        try:
            resume_context = {
                "skills": json.loads(resume.skills) if resume.skills else [],
                "experience": json.loads(resume.experience) if resume.experience else [],
                "projects": json.loads(resume.projects) if resume.projects else []
            }
        except Exception:
            pass

    # Gather Q&A history
    previous_qas = []
    for resp in interview.responses:
        previous_qas.append({
            "question": resp.question_text,
            "answer": resp.user_answer_text or ""
        })

    # If it is a coding round and it is the first question, we can assign a specific problem
    coding_q_key = None
    if interview.type == "coding" and not previous_qas:
        # Pick "two_sum" as initial question
        coding_q_key = "two_sum"
        q_data = CodeExecutor.CODING_QUESTIONS[coding_q_key]
        question_text = f"**Problem:** {q_data['title']}\n\n{q_data['description']}\n\nUse function template:\n```python\n{q_data['templates']['python']}```"
    elif interview.type == "coding" and len(previous_qas) == 1:
        # Pick "valid_parentheses"
        coding_q_key = "valid_parentheses"
        q_data = CodeExecutor.CODING_QUESTIONS[coding_q_key]
        question_text = f"**Problem:** {q_data['title']}\n\n{q_data['description']}\n\nUse function template:\n```python\n{q_data['templates']['python']}```"
    elif interview.type == "coding" and len(previous_qas) == 2:
        # Pick "reverse_string"
        coding_q_key = "reverse_string"
        q_data = CodeExecutor.CODING_QUESTIONS[coding_q_key]
        question_text = f"**Problem:** {q_data['title']}\n\n{q_data['description']}\n\nUse function template:\n```python\n{q_data['templates']['python']}```"
    else:
        # Standard question generator via Gemini
        question_text = AIService.generate_question(
            interview_type=interview.type,
            difficulty=interview.difficulty,
            domains=domains,
            language=language,
            resume_details=resume_context,
            previous_qas=previous_qas
        )

    return {"question": question_text, "coding_q_key": coding_q_key}

@router.post("/{interview_id}/submit-response", response_model=QuestionResponseResponse)
def submit_response(
    interview_id: str,
    response_in: QuestionResponseCreate,
    coding_q_key: str = None,  # Optional question slug: "two_sum", "valid_parentheses", "reverse_string"
    coding_lang: str = "python", # python or javascript
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    language = profile.preferred_language if profile else "en"

    # Evaluate using AI Service
    eval_res = AIService.evaluate_response(
        interview_type=interview.type,
        question=response_in.question_text,
        answer=response_in.user_answer_text or "",
        code_submitted=response_in.code_submitted,
        language=language
    )

    execution_time = None
    complexity_feedback = eval_res.get("complexity_feedback", "")
    
    # If coding question slug matches and code was submitted, run sandbox execution
    if interview.type == "coding" and coding_q_key and response_in.code_submitted:
        exec_res = CodeExecutor.execute(
            question_key=coding_q_key,
            language=coding_lang,
            user_code=response_in.code_submitted
        )
        if exec_res.get("success"):
            execution_time = exec_res.get("total_execution_time_ms", 0.0) / 1000.0  # seconds
            complexity_feedback = f"Time Complexity: O(N), Space: O(N). Passed all tests: {json.dumps(exec_res.get('results'))}"
        else:
            complexity_feedback = f"Execution failed / Test failed: {exec_res.get('error', 'Unknown error')}. Results: {json.dumps(exec_res.get('results', []))}"

    # Override visual/voice metrics from client analysis
    comm_score = eval_res.get("communication_score", 75.0)
    conf_score = eval_res.get("confidence_score", 75.0)
    
    # Simple speech pace / gaze adjustment heuristics
    if response_in.eye_contact_ratio is not None:
        # High eye contact increases confidence
        conf_score = min(100.0, conf_score * (0.5 + response_in.eye_contact_ratio))
    if response_in.fillers_count is not None and response_in.fillers_count > 3:
        # High fillers decrease communication score
        comm_score = max(30.0, comm_score - (response_in.fillers_count * 3))

    db_response = QuestionResponse(
        interview_id=interview.id,
        question_text=response_in.question_text,
        user_answer_text=response_in.user_answer_text,
        code_submitted=response_in.code_submitted,
        execution_time=execution_time,
        complexity_feedback=complexity_feedback,
        communication_score=round(comm_score, 1),
        confidence_score=round(conf_score, 1),
        follow_up_questions=json.dumps([eval_res.get("suggested_follow_up")]),
        created_at=datetime.datetime.utcnow()
    )
    
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    return db_response

@router.post("/{interview_id}/finish", response_model=PerformanceReportResponse)
def finish_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview or interview.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    if not interview.responses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot finish an interview without any questions answered.")

    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    language = profile.preferred_language if profile else "en"

    # Set completed times
    interview.status = "completed"
    interview.completed_at = datetime.datetime.utcnow()
    db.add(interview)
    db.commit()

    # Compile final evaluation transcript
    qas = []
    for resp in interview.responses:
        qas.append({
            "question": resp.question_text,
            "answer": resp.user_answer_text or "",
            "code": resp.code_submitted or "",
            "communication_score": resp.communication_score,
            "confidence_score": resp.confidence_score,
            "complexity_feedback": resp.complexity_feedback or ""
        })

    # Call AI report engine
    report_data = AIService.generate_final_report(
        interview_type=interview.type,
        qas=qas,
        language=language
    )

    # Save Performance Report
    db_report = PerformanceReport(
        interview_id=interview.id,
        overall_score=report_data.get("overall_score", 0.0),
        category_scores=json.dumps(report_data.get("category_scores", {})),
        strengths=json.dumps(report_data.get("strengths", [])),
        weaknesses=json.dumps(report_data.get("weaknesses", [])),
        improvement_areas=json.dumps(report_data.get("improvement_areas", [])),
        hiring_probability=report_data.get("hiring_probability", "low"),
        resource_suggestions=json.dumps(report_data.get("suggested_learning_resources", [])),
        detailed_ai_feedback=report_data.get("detailed_ai_feedback", ""),
        generated_at=datetime.datetime.utcnow()
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return db_report
