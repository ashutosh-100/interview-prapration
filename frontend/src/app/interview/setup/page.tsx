"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import { Cpu, ArrowLeft, Sun, Moon, CloudUpload, Sparkles, Check, RefreshCw } from "lucide-react";

const AVAILABLE_DOMAINS = [
  { id: "python", label: "Python", category: "Programming" },
  { id: "javascript", label: "JavaScript", category: "Programming" },
  { id: "go", label: "Go Programming", category: "Programming" },
  { id: "rust", label: "Rust Programming", category: "Programming" },
  { id: "frontend", label: "Frontend Development", category: "Web Development" },
  { id: "backend", label: "Backend Development", category: "Web Development" },
  { id: "fullstack", label: "Full Stack", category: "Web Development" },
  { id: "datascience", label: "Data Science", category: "Data Science" },
  { id: "ml", label: "Machine Learning", category: "Data Science" },
  { id: "ai", label: "Artificial Intelligence", category: "Data Science" },
  { id: "aws", label: "AWS Cloud", category: "Cloud & DevOps" },
  { id: "devops", label: "DevOps", category: "Cloud & DevOps" },
  { id: "hr", label: "HR Assessment", category: "Non-Technical" },
  { id: "behavioral", label: "Behavioral STAR", category: "Non-Technical" },
];

export default function InterviewSetup() {
  const { token, profile, updateProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
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
    if (!token) {
      router.push("/login");
      return;
    }
    // Pre-populate domains from profile if any
    if (profile?.selected_domains) {
      setSelectedDomains(profile.selected_domains.split(",").map(d => d.trim()).filter(d => d));
    }
  }, [token, profile]);

  const handleDomainToggle = (domainId: string) => {
    setError(null);
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domainId));
    } else {
      if (selectedDomains.length >= 3) {
        setError("You can select a maximum of 3 domains.");
        return;
      }
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

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
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Save target domains & preferences back to user profile first
      await updateProfile({
        selected_domains: selectedDomains.join(",")
      });

      // 2. Start the interview session
      const interview = await api.startInterview({
        type,
        difficulty
      }, token!);

      // Route to Interview Room
      router.push(`/interview/${interview.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to start interview. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-colors"
            >
              {language === "en" ? "हिन्दी" : "English"}
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-500" />
            <span>{t("interviewSetup")}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Configure your AI Interviewer parameters
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Interview Mode */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("selectMode")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "technical", title: "Technical Round", desc: "Core algorithms & sys design" },
                { id: "coding", title: "Coding Round", desc: "Sandbox coding compiler round" },
                { id: "hr", title: "HR Assessment", desc: "Common HR questions & behaviors" },
                { id: "behavioral", title: "Behavioral Round", desc: "STAR answering evaluations" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setType(m.id)}
                  className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                    type === m.id
                      ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/25 ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{m.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Difficulty Selection */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("experienceLevel")}</h3>
            <div className="flex gap-4">
              {["beginner", "intermediate", "advanced"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-3 text-center text-sm font-bold rounded-2xl capitalize transition-all border ${
                    difficulty === d
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Domains Selection */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("selectDomains")}</h3>
              <span className="text-xs font-semibold text-slate-400">Selected: {selectedDomains.length}/3</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AVAILABLE_DOMAINS.map((dom) => {
                const isSelected = selectedDomains.includes(dom.id);
                return (
                  <button
                    key={dom.id}
                    type="button"
                    onClick={() => handleDomainToggle(dom.id)}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span>{dom.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Resume Upload */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("uploadResume")}</h3>
            
            <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleResumeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={parsing}
              />
              
              <div className="flex flex-col items-center justify-center gap-2.5">
                <CloudUpload className="w-10 h-10 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {resumeFile ? resumeFile.name : "Choose file to upload"}
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  {t("uploadDescription")}
                </p>
              </div>

              {parsing && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-2xl flex items-center justify-center gap-2.5">
                  <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">AI is parsing your resume skills...</span>
                </div>
              )}
            </div>

            {resumeParsed && (
              <div className="p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 rounded-xl text-teal-600 dark:text-teal-400 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{t("resumeParsed")} Custom interview questions generated.</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || parsing}
            className="w-full py-4 text-base font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-2xl shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : t("startInterview")}
          </button>
        </form>
      </main>
    </div>
  );
}
