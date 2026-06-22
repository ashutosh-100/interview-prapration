type Props = {
  id: string;
};

export default function InterviewRoom({ id }: Props) {
  return <div>Interview ID: {id}</div>;
}
// "use client";
// import Link from "next/link";
// import React, { useEffect, useState, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { useLanguage } from "@/context/LanguageContext";
// import { api } from "@/lib/api";
// import { ShieldCheck, Video, Monitor, Mic, MicOff, RefreshCw, Send, AlertTriangle, Play, Sparkles, Check, CheckCircle2, XCircle } from "lucide-react";



// export async function generateStaticParams() {
//   return [
//     { id: "1" },
//     { id: "2" },
//     { id: "3" },
//   ];
// }



// export default function InterviewRoom() {
//   const { id } = useParams() as { id: string };
//   const { token, profile } = useAuth();
//   const { t } = useLanguage();
//   const router = useRouter();

//   // Setup/Consent
//   const [consentGranted, setConsentGranted] = useState(false);
//   const [loadingSetup, setLoadingSetup] = useState(false);

//   // Streams
//   const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
//   const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
//   const cameraVideoRef = useRef<HTMLVideoElement>(null);
//   const screenVideoRef = useRef<HTMLVideoElement>(null);

//   // Interview state
//   const [interviewType, setInterviewType] = useState("");
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [isAiThinking, setIsAiThinking] = useState(false);
//   const [questionIndex, setQuestionIndex] = useState(1);
//   const [codingQKey, setCodingQKey] = useState<string | null>(null);
//   const [codingLang, setCodingLang] = useState("python");
//   const [codeContent, setCodeContent] = useState("");
//   const [codeRunnerOutput, setCodeRunnerOutput] = useState<any>(null);
//   const [runningCode, setRunningCode] = useState(false);

//   // Speech Recognition
//   const [isRecordingVoice, setIsRecordingVoice] = useState(false);
//   const recognitionRef = useRef<any>(null);

//   // Live Metrics (simulated via gaze and voice hooks)
//   const [eyeContact, setEyeContact] = useState(95);
//   const [attention, setAttention] = useState(98);
//   const [fillers, setFillers] = useState(0);
//   const [wpm, setWpm] = useState(120);

//   // Recording arrays for E2E upload
//   const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);

//   useEffect(() => {
//     if (!token) {
//       router.push("/login");
//       return;
//     }
//     loadInterviewRound();
//     setupSpeechRecognition();
    
//     // Gaze and attention fluctuation simulation
//     const interval = setInterval(() => {
//       if (consentGranted) {
//         setEyeContact(prev => {
//           const delta = (Math.random() - 0.5) * 6;
//           const val = Math.round(prev + delta);
//           return val > 100 ? 100 : val < 60 ? 60 : val;
//         });
//         setAttention(prev => {
//           const delta = (Math.random() - 0.5) * 4;
//           const val = Math.round(prev + delta);
//           return val > 100 ? 100 : val < 70 ? 70 : val;
//         });
//       }
//     }, 3000);

//     return () => {
//       clearInterval(interval);
//       stopMediaStreams();
//     };
//   }, [token, consentGranted]);

//   const loadInterviewRound = async () => {
//     try {
//       const details = await api.getInterviewDetails(id, token!);
//       setInterviewType(details.interview.type);
      
//       // Load first question
//       fetchNextQuestion();
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const setupSpeechRecognition = () => {
//     if (typeof window !== "undefined") {
//       const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//       if (SpeechRecognition) {
//         const rec = new SpeechRecognition();
//         rec.continuous = true;
//         rec.interimResults = true;
//         rec.lang = profile?.preferred_language === "hi" ? "hi-IN" : "en-US";
        
//         rec.onresult = (event: any) => {
//           let interimTranscript = "";
//           let finalTranscript = "";
//           for (let i = event.resultIndex; i < event.results.length; ++i) {
//             if (event.results[i].isFinal) {
//               finalTranscript += event.results[i][0].transcript;
//             } else {
//               interimTranscript += event.results[i][0].transcript;
//             }
//           }
//           if (finalTranscript) {
//             setAnswer(prev => prev + " " + finalTranscript);
//             // Count fillers count
//             const fillersList = ["umm", "umm", "like", "you know", "अह", "मतलब"];
//             let count = fillers;
//             fillersList.forEach(f => {
//               const occurrences = (finalTranscript.toLowerCase().match(new RegExp(f, "g")) || []).length;
//               count += occurrences;
//             });
//             setFillers(count);
//           }
//         };
//         recognitionRef.current = rec;
//       }
//     }
//   };

//   const toggleVoiceRecording = () => {
//     if (!recognitionRef.current) {
//       alert("Speech recognition not supported in this browser. Please use Chrome or Safari.");
//       return;
//     }

//     if (isRecordingVoice) {
//       recognitionRef.current.stop();
//       setIsRecordingVoice(false);
//     } else {
//       recognitionRef.current.start();
//       setIsRecordingVoice(true);
//     }
//   };

//   const fetchNextQuestion = async () => {
//     setIsAiThinking(true);
//     try {
//       const res = await api.getNextQuestion(id, token!);
//       setQuestion(res.question);
//       setCodingQKey(res.coding_q_key);
//       setAnswer("");
//       setCodeRunnerOutput(null);

//       // Prepopulate code template if coding round
//       if (res.coding_q_key) {
//         const templates: Record<string, string> = {
//           two_sum: `def two_sum(nums, target):
//     # Write your solution here
//     pass`,
//           valid_parentheses: `def is_valid(s):
//     # Write your solution here
//     pass`,
//           reverse_string: `def reverse_string(s):
//     # Write your solution here in-place
//     s.reverse()
//     return s`
//         };
//         const jsTemplates: Record<string, string> = {
//           two_sum: `function twoSum(nums, target) {
//     // Write your solution here
//     return [];
// }`,
//           valid_parentheses: `function isValid(s) {
//     // Write your solution here
//     return false;
// }`,
//           reverse_string: `function reverseString(s) {
//     // Write your solution here
//     s.reverse();
//     return s;
// }`
//         };
        
//         setCodeContent(codingLang === "javascript" ? jsTemplates[res.coding_q_key] : templates[res.coding_q_key] || "");
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setIsAiThinking(false);
//     }
//   };

//   const startMediaStreams = async () => {
//     setLoadingSetup(true);
//     setError("");
//     try {
//       // 1. Camera Stream
//       const cam = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480 },
//         audio: true
//       });
//       setCameraStream(cam);
//       if (cameraVideoRef.current) {
//         cameraVideoRef.current.srcObject = cam;
//       }

//       // 2. Screen Stream (required for coding compiler rounds)
//       if (interviewType === "coding" || interviewType === "technical") {
//         const scr = await navigator.mediaDevices.getDisplayMedia({
//           video: true
//         });
//         setScreenStream(scr);
//         if (screenVideoRef.current) {
//           screenVideoRef.current.srcObject = scr;
//         }
//       }

//       // Start Recording camera stream blob
//       const recorder = new MediaRecorder(cam, { mimeType: "video/webm" });
//       recorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           setRecordedChunks((prev) => [...prev, event.data]);
//         }
//       };
//       recorder.start(1000);
//       mediaRecorderRef.current = recorder;

//       setConsentGranted(true);
//     } catch (err: any) {
//       console.error(err);
//       setError("Please grant access to Camera, Mic, and Screen Sharing to start simulation.");
//     } finally {
//       setLoadingSetup(false);
//     }
//   };

//   const stopMediaStreams = () => {
//     if (cameraStream) {
//       cameraStream.getTracks().forEach(track => track.stop());
//     }
//     if (screenStream) {
//       screenStream.getTracks().forEach(track => track.stop());
//     }
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
//       mediaRecorderRef.current.stop();
//     }
//   };

//   const [error, setError] = useState("");

//   const handleRunCode = async () => {
//     if (!codingQKey) return;
//     setRunningCode(true);
//     setCodeRunnerOutput(null);
//     try {
//       // Post code for compiler check
//       const res = await fetch(`http://localhost:8000/api/v1/interviews/${id}/submit-response?coding_q_key=${codingQKey}&coding_lang=${codingLang}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           question_text: question,
//           user_answer_text: "Running code compile",
//           code_submitted: codeContent
//         })
//       });
      
//       const data = await res.json();
//       setCodeRunnerOutput(data);
//     } catch (err: any) {
//       console.error(err);
//       setError("Execution execution failed");
//     } finally {
//       setRunningCode(false);
//     }
//   };

//   const handleSubmitResponse = async () => {
//     setIsAiThinking(true);
//     try {
//       // Compile response metadata
//       const payload = {
//         question_text: question,
//         user_answer_text: answer || (interviewType === "coding" ? "Code response submitted" : "No speech text input"),
//         code_submitted: interviewType === "coding" ? codeContent : null,
//         eye_contact_ratio: eyeContact / 100,
//         attention_level: attention / 100,
//         fillers_count: fillers,
//         speaking_speed_wpm: wpm
//       };

//       await api.submitResponse(id, payload, token!, codingQKey || undefined, codingLang);

//       setQuestionIndex(prev => prev + 1);
      
//       // Fetch next question or prompt complete
//       fetchNextQuestion();
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleFinishInterview = async () => {
//     setIsAiThinking(true);
//     try {
//       // 1. Finish interview session
//       await api.finishInterview(id, token!);

//       // 2. Upload recording blob
//       if (recordedChunks.length > 0) {
//         const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
//         const formData = new FormData();
//         formData.append("video_file", videoBlob, "interview_recording.webm");
//         await api.uploadRecording(id, formData, token!);
//       }

//       router.push(`/report/${id}`);
//     } catch (e) {
//       console.error(e);
//       // Fallback redirection
//       router.push(`/report/${id}`);
//     }
//   };

//   // Render consent form if not granted
//   if (!consentGranted) {
//     return (
//       <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 items-center justify-center p-4 transition-colors">
//         <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
//           <div className="text-center space-y-3 mb-6">
//             <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto border border-indigo-200 dark:border-indigo-900">
//               <ShieldCheck className="w-6 h-6" />
//             </div>
//             <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
//               {t("consentTitle")}
//             </h2>
//             <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
//               {t("consentDesc")}
//             </p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2">
//               <AlertTriangle className="w-4 h-4 shrink-0" />
//               <span>{error}</span>
//             </div>
//           )}

//           <div className="space-y-4">
//             <button
//               onClick={startMediaStreams}
//               disabled={loadingSetup}
//               className="w-full py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-xl shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
//             >
//               {loadingSetup ? (
//                 <>
//                   <RefreshCw className="w-4 h-4 animate-spin" />
//                   <span>Requesting System Feeds...</span>
//                 </>
//               ) : (
//                 <>
//                   <Video className="w-4 h-4" />
//                   <span>{t("grantPermissions")}</span>
//                 </>
//               )}
//             </button>
//             <Link
//               href="/dashboard"
//               className="block w-full py-3 text-center text-sm font-bold text-slate-600 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
//             >
//               Cancel Setup
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
//       {/* Top Banner Navigation */}
//       <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
//         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <span className="font-extrabold text-sm uppercase text-slate-400 tracking-widest">
//               Live AI Interview Simulator
//             </span>
//             <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></div>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="text-xs font-bold text-slate-500 flex items-center gap-2 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/50">
//               <span className="h-2 w-2 bg-rose-500 rounded-full"></span>
//               <span>SECURED WEBCAM FEED</span>
//             </div>
//             <button
//               onClick={handleFinishInterview}
//               className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 active:scale-95 transition-all shadow-md"
//             >
//               Force End Session
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Grid Workspace */}
//       <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl w-full mx-auto">
//         {/* Left Side: Video feeds & Metrics (4 Columns) */}
//         <div className="lg:col-span-4 space-y-6 flex flex-col">
//           {/* Gaze Monitoring feeds */}
//           <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm relative overflow-hidden flex-1 flex flex-col justify-between">
//             <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
//               <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
//               Webcam Feed
//             </span>

//             <video
//               ref={cameraVideoRef}
//               autoPlay
//               playsInline
//               muted
//               className="w-full aspect-video md:aspect-auto md:flex-1 rounded-2xl bg-black object-cover transform -scale-x-100"
//             ></video>

//             {/* Simulated overlay mapping gaze bounding box */}
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-indigo-400/50 rounded-full pointer-events-none animate-pulse"></div>
//           </div>

//           {/* Screen Share Preview if coding */}
//           {(interviewType === "coding" || interviewType === "technical") && (
//             <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm relative overflow-hidden aspect-video">
//               <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
//                 <Monitor className="w-3 h-3 text-indigo-400" />
//                 Screen Feed
//               </span>
//               <video
//                 ref={screenVideoRef}
//                 autoPlay
//                 playsInline
//                 className="w-full h-full rounded-2xl bg-black object-contain"
//               ></video>
//             </div>
//           )}

//           {/* Realtime eye contact and attention scoring dashboard */}
//           <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
//             <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Live Attention Metrics</h4>
            
//             <div className="grid grid-cols-2 gap-4">
//               <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
//                 <p className="text-[10px] font-bold text-slate-400 uppercase">Eye Contact</p>
//                 <h3 className={`text-2xl font-extrabold mt-1 ${eyeContact < 80 ? "text-amber-500 animate-pulse" : "text-emerald-500"}`}>{eyeContact}%</h3>
//               </div>

//               <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
//                 <p className="text-[10px] font-bold text-slate-400 uppercase">Attention Level</p>
//                 <h3 className="text-2xl font-extrabold mt-1 text-emerald-500">{attention}%</h3>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <div className="flex justify-between text-xs font-bold">
//                 <span>Filler words count:</span>
//                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${fillers > 3 ? "bg-rose-100 text-rose-800 dark:bg-rose-950/20" : "bg-indigo-100 text-indigo-800"}`}>{fillers} detected</span>
//               </div>
//               <div className="flex justify-between text-xs font-bold">
//                 <span>Speaking speed:</span>
//                 <span>{wpm} WPM</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side: Chat & Code editor (8 Columns) */}
//         <div className="lg:col-span-8 flex flex-col gap-6">
//           {/* AI Interview Question panel */}
//           <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
//             <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
//               <div className="flex items-center gap-2">
//                 <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950 rounded-lg text-indigo-600 dark:text-indigo-400">
//                   <Sparkles className="w-4 h-4" />
//                 </div>
//                 <span className="font-bold text-sm">AI Interviewer</span>
//               </div>
//               <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md uppercase">
//                 Question #{questionIndex}
//               </span>
//             </div>

//             <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 min-h-[100px] flex items-center">
//               {isAiThinking ? (
//                 <div className="flex items-center gap-2.5 text-slate-400">
//                   <RefreshCw className="w-4 h-4 animate-spin" />
//                   <span className="text-sm font-bold animate-pulse">{t("aiThinking")}</span>
//                 </div>
//               ) : (
//                 <p className="text-sm md:text-base leading-relaxed font-semibold text-slate-800 dark:text-slate-100 whitespace-pre-line">
//                   {question || "Loading question..."}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Interactive Input / Editor box */}
//           {interviewType === "coding" ? (
//             /* Coding Round: Monaco-style side compiler and test case panel */
//             <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex-1 flex flex-col gap-4">
//               <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
//                 <span className="font-bold text-sm">Code Editor Sandbox</span>
                
//                 <div className="flex items-center gap-2.5">
//                   <select
//                     value={codingLang}
//                     onChange={(e) => setCodingLang(e.target.value)}
//                     className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-lg outline-none"
//                   >
//                     <option value="python">Python 3</option>
//                     <option value="javascript">JavaScript (ES6)</option>
//                   </select>

//                   <button
//                     onClick={handleRunCode}
//                     disabled={runningCode || isAiThinking}
//                     className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow-md"
//                   >
//                     {runningCode ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
//                     <span>Run Tests</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Code TextArea Editor layout */}
//               <div className="flex-1 flex flex-col font-mono text-sm relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
//                 {/* Code Numbers Bar wrapper */}
//                 <textarea
//                   value={codeContent}
//                   onChange={(e) => setCodeContent(e.target.value)}
//                   className="w-full flex-1 p-4 bg-transparent text-slate-200 border-none outline-none font-mono text-sm leading-relaxed resize-none h-[250px]"
//                   placeholder="# Write your program here..."
//                   spellCheck="false"
//                 ></textarea>
//               </div>

//               {/* Sandbox Run result pane */}
//               {codeRunnerOutput && (
//                 <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 text-xs space-y-2">
//                   <p className="font-extrabold uppercase text-[10px] text-slate-400">Compiler Test Cases Result:</p>
                  
//                   {codeRunnerOutput.complexity_feedback && (
//                     <p className="font-bold text-slate-300">{codeRunnerOutput.complexity_feedback}</p>
//                   )}

//                   {codeRunnerOutput.results && (
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//                       {JSON.parse(codeRunnerOutput.complexity_feedback.includes("Results:") ? codeRunnerOutput.complexity_feedback.split("Results:")[1] : "[]").map((tc: any, i: number) => (
//                         <div key={i} className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 flex items-center justify-between">
//                           <span className="font-semibold text-[10px] uppercase text-slate-400">Test #{tc.test_case}</span>
//                           <span className="font-bold text-[10px] uppercase">{tc.passed ? <span className="text-emerald-500">Passed</span> : <span className="text-rose-500">Failed</span>}</span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Bottom Actions */}
//               <div className="flex justify-end gap-3 mt-2">
//                 <button
//                   onClick={handleSubmitResponse}
//                   disabled={isAiThinking}
//                   className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
//                 >
//                   <Send className="w-3.5 h-3.5" />
//                   <span>Submit Code & Next Question</span>
//                 </button>
//               </div>
//             </div>
//           ) : (
//             /* Technical/HR/Behavioral text and voice response input */
//             <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex-1 flex flex-col gap-4">
//               <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
//                 <span className="font-bold text-sm">Your Response Workspace</span>
                
//                 <button
//                   type="button"
//                   onClick={toggleVoiceRecording}
//                   className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
//                     isRecordingVoice
//                       ? "bg-rose-600 text-white animate-pulse"
//                       : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
//                   }`}
//                 >
//                   {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
//                   <span>{isRecordingVoice ? "Stop Recording Voice" : "Answer with Voice (Transcribe)"}</span>
//                 </button>
//               </div>

//               <textarea
//                 value={answer}
//                 onChange={(e) => setAnswer(e.target.value)}
//                 placeholder="Type your response here or speak using the mic option..."
//                 className="w-full flex-1 p-4 bg-slate-50 dark:bg-slate-950 text-sm border border-slate-200 dark:border-slate-800 rounded-2xl outline-none resize-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
//               ></textarea>

//               <div className="flex justify-between items-center mt-2">
//                 <p className="text-xs text-slate-400 font-semibold">
//                   Ensure to speak clearly. Fillers are tracked live.
//                 </p>

//                 <div className="flex gap-3">
//                   {questionIndex > 3 ? (
//                     <button
//                       onClick={handleFinishInterview}
//                       disabled={isAiThinking}
//                       className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg"
//                     >
//                       Complete & Get Report
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handleSubmitResponse}
//                       disabled={isAiThinking}
//                       className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
//                     >
//                       <Send className="w-3.5 h-3.5" />
//                       <span>Submit & Next Question</span>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
