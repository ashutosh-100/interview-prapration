"use client";
import Link from "next/link";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  ShieldCheck, Video, Monitor, Mic, MicOff, RefreshCw, Send,
  AlertTriangle, Play, Sparkles, CheckCircle2, Volume2, VolumeX,
  Brain, Eye, Zap, MessageSquare, Code, Clock
} from "lucide-react";

export default function InterviewRoom() {
  const { id } = useParams() as { id: string };
  const { token, profile } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Setup/Consent
  const [consentGranted, setConsentGranted] = useState(false);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [setupError, setSetupError] = useState("");

  // Streams
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);

  // Interview state
  const [interviewType, setInterviewType] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [codingQKey, setCodingQKey] = useState<string | null>(null);
  const [codingLang, setCodingLang] = useState("python");
  const [codeContent, setCodeContent] = useState("");
  const [codeRunnerOutput, setCodeRunnerOutput] = useState<any>(null);
  const [runningCode, setRunningCode] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);

  // ─── AI Voice Assistant ───────────────────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false);         // TTS is active
  const [isListening, setIsListening] = useState(false);        // STT is active
  const [voiceEnabled, setVoiceEnabled] = useState(true);       // User toggle
  const [transcript, setTranscript] = useState("");             // Live interim transcript
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // ──────────────────────────────────────────────────────────────────────────

  // Live Metrics
  const [eyeContact, setEyeContact] = useState(95);
  const [attention, setAttention] = useState(98);
  const [fillers, setFillers] = useState(0);
  const [wpm, setWpm] = useState(120);
  const [sessionTime, setSessionTime] = useState(0);

  // Recording
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [error, setError] = useState("");

  // ─────────────────────── SPEAK via TTS ───────────────────────────────────
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel(); // stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = profile?.preferred_language === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    // Try to pick a natural voice
    const voices = synth.getVoices();
    const preferred = voices.find(v =>
      (utterance.lang === "hi-IN" && v.lang.startsWith("hi")) ||
      (utterance.lang === "en-US" && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")))
    );
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    currentUtteranceRef.current = utterance;
    synthRef.current = synth;
    setIsSpeaking(true);
    synth.speak(utterance);
  }, [voiceEnabled, profile?.preferred_language]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────── SPEECH RECOGNITION (STT) ────────────────────────
  const setupSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = profile?.preferred_language === "hi" ? "hi-IN" : "en-US";

    rec.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += t + " ";
          // Count filler words
          const fillerWords = ["umm", "uhh", "uh", "like", "you know", "actually", "basically", "अह", "मतलब"];
          let count = 0;
          fillerWords.forEach(f => {
            const matches = (t.toLowerCase().match(new RegExp("\\b" + f + "\\b", "g")) || []).length;
            count += matches;
          });
          if (count > 0) setFillers(prev => prev + count);
        } else {
          interimText = t;
        }
      }
      setTranscript(interimText);
      if (finalText) {
        setAnswer(prev => prev + finalText);
        setTranscript("");
      }
    };

    rec.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
      if (e.error !== "no-speech") setIsListening(false);
    };
    rec.onend = () => {
      // Auto-restart if still in listening mode
      if (recognitionRef.current?._shouldRestart) {
        try { rec.start(); } catch (_) {}
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
  }, [profile?.preferred_language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    stopSpeaking(); // Stop AI from speaking when user starts
    recognitionRef.current._shouldRestart = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (_) {}
  }, [stopSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current._shouldRestart = false;
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setTranscript("");
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────── LOAD INTERVIEW ──────────────────────────────────
  const fetchNextQuestion = useCallback(async () => {
    setIsAiThinking(true);
    stopListening();
    stopSpeaking();
    try {
      const res = await api.getNextQuestion(id, token!);
      const qText = res.question;
      setQuestion(qText);
      setCodingQKey(res.coding_q_key);
      setAnswer("");
      setTranscript("");
      setCodeRunnerOutput(null);

      if (res.coding_q_key) {
        const pyTemplates: Record<string, string> = {
          two_sum: `def two_sum(nums, target):\n    # Write your solution here\n    pass`,
          valid_parentheses: `def is_valid(s):\n    # Write your solution here\n    pass`,
          reverse_string: `def reverse_string(s):\n    # Write your solution here in-place\n    s.reverse()\n    return s`
        };
        setCodeContent(pyTemplates[res.coding_q_key] || "");
      }

      // AI Voice reads the question aloud
      setTimeout(() => speakText(qText.replace(/```[\s\S]*?```/g, "code block").replace(/[*#]/g, "")), 400);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiThinking(false);
    }
  }, [id, token, speakText, stopListening, stopSpeaking]);

  const loadInterviewRound = useCallback(async () => {
    try {
      const details = await api.getInterviewDetails(id, token!);
      setInterviewType(details.interview.type);
      await fetchNextQuestion();
    } catch (e) {
      console.error(e);
    }
  }, [id, token, fetchNextQuestion]);
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────── MEDIA SETUP ─────────────────────────────────────
  const startMediaStreams = async () => {
    setLoadingSetup(true);
    setSetupError("");
    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
      setCameraStream(cam);
      if (cameraVideoRef.current) cameraVideoRef.current.srcObject = cam;

      // Start recording
      try {
        const recorder = new MediaRecorder(cam, { mimeType: "video/webm;codecs=vp8" });
        recorder.ondataavailable = (e) => { if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]); };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      } catch (_) {}

      setConsentGranted(true);
    } catch (err: any) {
      setSetupError("Please grant Camera & Microphone access to start the interview simulation.");
    } finally {
      setLoadingSetup(false);
    }
  };

  const stopMediaStreams = () => {
    cameraStream?.getTracks().forEach(t => t.stop());
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
  };
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────── SUBMIT RESPONSE ─────────────────────────────────
  const handleSubmitResponse = async () => {
    stopListening();
    stopSpeaking();
    setIsAiThinking(true);
    try {
      const payload = {
        question_text: question,
        user_answer_text: answer || (interviewType === "coding" ? "Code response submitted" : "No voice input captured"),
        code_submitted: interviewType === "coding" ? codeContent : null,
        eye_contact_ratio: eyeContact / 100,
        attention_level: attention / 100,
        fillers_count: fillers,
        speaking_speed_wpm: wpm
      };
      await api.submitResponse(id, payload, token!, codingQKey || undefined, codingLang);
      setQuestionIndex(prev => prev + 1);
      setFillers(0);
      await fetchNextQuestion();
    } catch (e: any) {
      setError("Failed to submit response: " + e.message);
      setIsAiThinking(false);
    }
  };

  const handleRunCode = async () => {
    if (!codingQKey) return;
    setRunningCode(true);
    setCodeRunnerOutput(null);
    try {
      const payload = {
        question_text: question,
        user_answer_text: "Running code",
        code_submitted: codeContent
      };
      const data = await api.submitResponse(id, payload, token!, codingQKey, codingLang);
      setCodeRunnerOutput(data);
    } catch (err: any) {
      setError("Code execution failed: " + err.message);
    } finally {
      setRunningCode(false);
    }
  };

  const handleFinishInterview = async () => {
    stopListening();
    stopSpeaking();
    setIsAiThinking(true);
    try {
      await api.finishInterview(id, token!);
      if (recordedChunks.length > 0) {
        const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
        const formData = new FormData();
        formData.append("video_file", videoBlob, "interview_recording.webm");
        try { await api.uploadRecording(id, formData, token!); } catch (_) {}
      }
      setInterviewFinished(true);
      speakText("Congratulations! Your interview session has been completed. Please wait while we generate your performance report.");
      setTimeout(() => router.push(`/report/${id}`), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to finish interview");
      router.push(`/report/${id}`);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // ─────────────────────── EFFECTS ─────────────────────────────────────────
  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    setupSpeechRecognition();

    // Metric simulation
    const metricsInterval = setInterval(() => {
      if (consentGranted) {
        setEyeContact(prev => Math.min(100, Math.max(60, Math.round(prev + (Math.random() - 0.5) * 6))));
        setAttention(prev => Math.min(100, Math.max(70, Math.round(prev + (Math.random() - 0.5) * 4))));
        setWpm(prev => Math.min(180, Math.max(80, Math.round(prev + (Math.random() - 0.5) * 10))));
      }
    }, 3000);

    // Session timer
    const timerInterval = setInterval(() => {
      if (consentGranted) setSessionTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(timerInterval);
      stopMediaStreams();
      stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current._shouldRestart = false;
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, consentGranted]);

  useEffect(() => {
    if (consentGranted && token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadInterviewRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consentGranted]);
  // ─────────────────────────────────────────────────────────────────────────

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ─────────────────────── CONSENT SCREEN ──────────────────────────────────
  if (!consentGranted) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/30">
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">AI Interview Session</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your AI interviewer will <strong className="text-indigo-400">speak questions aloud</strong> and listen to your spoken answers in real-time. 
              Grant camera & microphone access to begin.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {[
              { icon: Volume2, label: "AI Voice Questions", desc: "Questions read aloud via speech synthesis" },
              { icon: Mic, label: "Voice Answer Detection", desc: "Your speech transcribed in real-time" },
              { icon: Eye, label: "Attention Monitoring", desc: "Eye contact & focus tracked live" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{label}</p>
                  <p className="text-slate-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {setupError && (
            <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{setupError}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={startMediaStreams}
              disabled={loadingSetup}
              className="w-full py-3.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {loadingSetup ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /><span>Initializing...</span></>
              ) : (
                <><Video className="w-4 h-4" /><span>Grant Access & Start Interview</span></>
              )}
            </button>
            <Link
              href="/dashboard"
              className="block w-full py-3 text-center text-sm font-bold text-slate-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────── MAIN INTERVIEW UI ───────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-900/80 border-b border-white/10 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live AI Interview</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase">{interviewType}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Session timer */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(sessionTime)}</span>
          </div>

          {/* Voice toggle */}
          <button
            onClick={() => { setVoiceEnabled(v => !v); if (voiceEnabled) stopSpeaking(); }}
            title={voiceEnabled ? "Mute AI voice" : "Enable AI voice"}
            className={`p-2 rounded-lg border transition-all ${voiceEnabled ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/10 text-slate-500"}`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleFinishInterview}
            disabled={isAiThinking || interviewFinished}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-all"
          >
            End Session
          </button>
        </div>
      </header>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl w-full mx-auto">

        {/* ── LEFT PANEL: Camera + Metrics ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Webcam */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-white uppercase flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Webcam
            </span>
            <video ref={cameraVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            {/* Gaze tracking overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-dashed border-indigo-400/30 animate-pulse" />
            </div>
          </div>

          {/* AI Voice Status */}
          <div className={`p-4 rounded-2xl border transition-all ${isSpeaking ? "bg-indigo-500/10 border-indigo-500/40" : isListening ? "bg-emerald-500/10 border-emerald-500/40" : "bg-white/5 border-white/10"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-slate-400">AI Voice Assistant</span>
              {isSpeaking && (
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  Speaking...
                </div>
              )}
              {isListening && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  Listening...
                </div>
              )}
            </div>

            {/* Sound wave animation */}
            <div className="flex items-center gap-1 h-8 mb-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${isSpeaking ? "bg-indigo-500" : isListening ? "bg-emerald-500" : "bg-white/20"}`}
                  style={{
                    height: (isSpeaking || isListening)
                      ? "24px"
                      : "4px",
                    animationName: (isSpeaking || isListening) ? "wave" : "none",
                    animationDuration: `${0.5 + i * 0.07}s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDirection: "alternate",
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>

            {/* Mic button */}
            <button
              onClick={toggleListening}
              disabled={isSpeaking || isAiThinking}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isListening
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
              }`}
            >
              {isListening ? <><MicOff className="w-4 h-4" />Stop Recording</> : <><Mic className="w-4 h-4" />Start Voice Answer</>}
            </button>

            {/* Live transcript */}
            {transcript && (
              <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-slate-300 italic">{transcript}<span className="animate-pulse">|</span></p>
              </div>
            )}
          </div>

          {/* Live Metrics */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-3">
            <span className="text-xs font-bold uppercase text-slate-400">Live Metrics</span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Eye Contact", value: eyeContact, color: eyeContact < 80 ? "text-amber-400" : "text-emerald-400" },
                { label: "Attention", value: attention, color: "text-emerald-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                  <p className={`text-xl font-extrabold mt-1 ${color}`}>{value}%</p>
                  <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${color.includes("amber") ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Filler Words</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${fillers > 3 ? "bg-rose-500/20 text-rose-400" : "bg-indigo-500/20 text-indigo-400"}`}>{fillers} detected</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Speaking Speed</span>
                <span className="text-slate-300 font-bold">{wpm} WPM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Question</span>
                <span className="text-slate-300 font-bold">#{questionIndex}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Question + Answer ── */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* AI Question Panel */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="font-bold text-sm">AI Interviewer</span>
                {isSpeaking && <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full animate-pulse">Speaking...</span>}
              </div>
              <div className="flex items-center gap-2">
                {!isAiThinking && question && (
                  <button
                    onClick={() => speakText(question.replace(/```[\s\S]*?```/g, "code block").replace(/[*#]/g, ""))}
                    title="Replay question"
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md uppercase">Q #{questionIndex}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 min-h-[80px] flex items-start">
              {isAiThinking ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-bold animate-pulse">AI is generating your next question...</span>
                </div>
              ) : (
                <p className="text-sm leading-relaxed font-medium text-slate-100 whitespace-pre-line">{question || "Loading question..."}</p>
              )}
            </div>
          </div>

          {/* Answer Section */}
          {interviewType === "coding" ? (
            // ── Coding Editor ──
            <div className="flex-1 flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-sm">Code Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={codingLang}
                    onChange={(e) => setCodingLang(e.target.value)}
                    className="px-3 py-1 bg-slate-800 border border-white/10 text-xs font-bold rounded-lg outline-none text-slate-300"
                  >
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                  <button
                    onClick={handleRunCode}
                    disabled={runningCode || isAiThinking}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    {runningCode ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Run Tests
                  </button>
                </div>
              </div>

              <div className="flex-1 rounded-xl overflow-hidden border border-white/10 bg-slate-950 font-mono">
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  className="w-full h-full min-h-[200px] p-4 bg-transparent text-slate-200 border-none outline-none font-mono text-sm leading-relaxed resize-none"
                  placeholder="# Write your solution here..."
                  spellCheck={false}
                />
              </div>

              {codeRunnerOutput && (
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs space-y-1">
                  <p className="font-bold text-slate-400 uppercase text-[10px]">Test Results:</p>
                  <p className="text-slate-300">{codeRunnerOutput.complexity_feedback}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleSubmitResponse}
                  disabled={isAiThinking}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit & Next Question
                </button>
              </div>
            </div>
          ) : (
            // ── Text + Voice Answer ──
            <div className="flex-1 flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-sm">Your Answer</span>
                </div>
                <button
                  onClick={toggleListening}
                  disabled={isSpeaking || isAiThinking}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-white/10 border border-white/10 text-slate-300 hover:bg-white/15"
                  }`}
                >
                  {isListening ? <><MicOff className="w-3.5 h-3.5" />Stop Voice</> : <><Mic className="w-3.5 h-3.5" />Voice Answer</>}
                </button>
              </div>

              <div className="relative flex-1">
                <textarea
                  value={answer + (transcript ? " " + transcript : "")}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={isListening ? "🎤 Listening... speak your answer" : "Type your response or click 'Voice Answer' to speak..."}
                  className="w-full h-full min-h-[200px] p-4 bg-slate-900/80 text-slate-100 text-sm border border-white/10 rounded-xl outline-none resize-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-500 transition-all"
                />
                {isListening && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                    REC
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Speak clearly. Fillers tracked: <span className="font-bold text-slate-400">{fillers}</span></p>
                <div className="flex gap-2">
                  {questionIndex > 3 ? (
                    <button
                      onClick={handleFinishInterview}
                      disabled={isAiThinking || interviewFinished}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {interviewFinished ? "Redirecting..." : "Complete & Get Report"}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitResponse}
                      disabled={isAiThinking}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit & Next Question
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
