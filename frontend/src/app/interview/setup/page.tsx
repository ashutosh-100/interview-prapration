"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { ChevronLeft, CloudUpload, Sparkles, Check, RefreshCw, Cpu, Code2, Users, FileText } from "lucide-react";

const AVAILABLE_DOMAINS = [
  { id: "python", label: "Python", category: "Programming" },
  { id: "javascript", label: "JavaScript", category: "Programming" },
  { id: "go", label: "Go Programming", category: "Programming" },
  { id: "rust", label: "Rust Programming", category: "Programming" },
  { id: "frontend", label: "Frontend", category: "Web Development" },
  { id: "backend", label: "Backend", category: "Web Development" },
  { id: "fullstack", label: "Full Stack", category: "Web Development" },
  { id: "datascience", label: "Data Science", category: "Data Science" },
  { id: "ml", label: "Machine Learning", category: "Data Science" },
  { id: "ai", label: "AI", category: "Data Science" },
  { id: "aws", label: "AWS Cloud", category: "Cloud & DevOps" },
  { id: "devops", label: "DevOps", category: "Cloud & DevOps" },
  { id: "hr", label: "HR Assessment", category: "Non-Technical" },
  { id: "behavioral", label: "Behavioral STAR", category: "Non-Technical" },
];

export default function InterviewSetup() {
  const { token, profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [type, setType] = useState("technical");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeParsed, setResumeParsed] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    if (profile?.selected_domains) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDomains(profile.selected_domains.split(",").map((d: string) => d.trim()).filter((d: string) => d));
    }
  }, [token, profile, router]);

  const handleDomainToggle = (domainId: string) => {
    setError(null);
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domainId));
    } else {
      if (selectedDomains.length >= 3) { setError("You can select a maximum of 3 domains."); return; }
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { setError("File size exceeds 5MB limit."); return; }

    setResumeFile(file);
    setError(null);
    setParsing(true);
    setResumeParsed(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.uploadResume(formData, token!);
      setResumeParsed(true);
    } catch (err: any) {
      setError(err.message || "Failed to parse resume.");
      setResumeFile(null);
    } finally { setParsing(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await updateProfile({ selected_domains: selectedDomains.join(",") });
      const interview = await api.startInterview({ type, difficulty }, token!);
      router.push(`/interview/${interview.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to start interview. Please try again.");
      setLoading(false);
    }
  };

  const modes = [
    { id: "technical", icon: Cpu, title: "Technical", desc: "Core algorithms & systems" },
    { id: "coding", icon: Code2, title: "Coding", desc: "Sandbox compiler round" },
    { id: "hr", icon: Users, title: "HR Assess", desc: "Common HR questions" },
    { id: "behavioral", icon: FileText, title: "Behavioral", desc: "STAR evaluation" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5" style={{ background: "rgba(2,6,23,0.88)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /><span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-extrabold text-sm gradient-text uppercase tracking-wider hidden sm:block">AI Interview Setup</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 mb-4 animate-pulse-ring">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">{t("interviewSetup")}</h1>
          <p className="text-sm text-slate-400">Configure your AI Interviewer parameters for a personalized session.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-3 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* Card 1: Interview Mode */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/8 bg-white/3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">{t("selectMode")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setType(m.id)}
                  className={`p-4 rounded-2xl border transition-all text-left group ${
                    type === m.id
                      ? "border-indigo-500 bg-indigo-500/10 shadow-glow shadow-indigo-500/20"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <m.icon className={`w-5 h-5 mb-3 ${type === m.id ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                  <h4 className="font-extrabold text-sm text-white mb-1">{m.title}</h4>
                  <p className="text-xs text-slate-400">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Difficulty Selection */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/8 bg-white/3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">{t("experienceLevel")}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {["beginner", "intermediate", "advanced"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-3.5 text-sm font-bold rounded-xl capitalize transition-all border ${
                    difficulty === d
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Domains Selection */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/8 bg-white/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">{t("selectDomains")}</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/10">Selected: {selectedDomains.length}/3</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AVAILABLE_DOMAINS.map((dom) => {
                const isSelected = selectedDomains.includes(dom.id);
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => handleDomainToggle(dom.id)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-glow shadow-indigo-500/10"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                  >
                    <span>{dom.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Resume Upload */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/8 bg-white/3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">{t("uploadResume")}</h3>
            
            <div className="relative border-2 border-dashed border-white/20 hover:border-indigo-500/50 bg-white/5 hover:bg-indigo-500/5 rounded-2xl p-8 text-center transition-all group">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleResumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={parsing}
              />
              
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                  <CloudUpload className={`w-6 h-6 ${resumeFile ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">
                    {resumeFile ? resumeFile.name : "Choose file or drag here"}
                  </p>
                  <p className="text-xs text-slate-400">{t("uploadDescription")}</p>
                </div>
              </div>

              {parsing && (
                <div className="absolute inset-0 bg-slate-900/90 rounded-2xl flex flex-col items-center justify-center gap-3 z-20 backdrop-blur-sm animate-fade-in">
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  <span className="text-sm font-bold text-white">AI is parsing your resume skills...</span>
                </div>
              )}
            </div>

            {resumeParsed && (
              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>{t("resumeParsed")} Custom interview questions generated.</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || parsing}
            className="w-full btn-glow py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> {t("startInterview")}</>}
          </button>
        </form>
      </main>
    </div>
  );
}
