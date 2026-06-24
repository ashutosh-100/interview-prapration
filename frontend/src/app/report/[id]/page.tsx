"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import { Award, CheckCircle2, AlertTriangle, BookOpen, Clock, RefreshCw, ChevronLeft, Sun, Moon, Cpu, Target, Brain, ShieldAlert, Sparkles } from "lucide-react";

export default function PerformanceReport() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await api.getInterviewDetails(id, token!);
      setReport(data.report);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <div className="h-4 w-48 rounded-full skeleton mx-auto" />
            <div className="h-3 w-32 rounded-full skeleton mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-8">Please check if the interview session completed successfully or return to your dashboard.</p>
        <Link href="/dashboard" className="btn-glow px-6 py-3 text-white font-bold rounded-xl flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const categoryScores = JSON.parse(report.category_scores || "{}");
  const strengths = JSON.parse(report.strengths || "[]");
  const weaknesses = JSON.parse(report.weaknesses || "[]");
  const improvementAreas = JSON.parse(report.improvement_areas || "[]");
  const resources = JSON.parse(report.resource_suggestions || "[]");

  const getProbabilityBadge = (prob: string) => {
    switch (prob?.toLowerCase()) {
      case "high": return <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-glow shadow-emerald-500/10">High Probability</span>;
      case "medium": return <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-glow shadow-amber-500/10">Medium Probability</span>;
      default: return <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/20 shadow-glow shadow-rose-500/10">Low Probability</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5" style={{ background: "rgba(2,6,23,0.88)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /><span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span className="font-extrabold text-sm gradient-text uppercase tracking-wider hidden sm:block">AI Analysis Report</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 sm:space-y-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 mb-6 animate-pulse-ring">
            <Award className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{t("performanceReport")}</h1>
          <p className="text-xs font-mono text-slate-500">Session ID: {report.interview_id}</p>
        </div>

        {/* Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 p-6 sm:p-8 rounded-3xl border border-white/8 bg-white/3 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 relative z-10">{t("overallScore")}</h3>
            <div className="relative w-36 h-36 flex items-center justify-center rounded-full z-10" style={{ background: `conic-gradient(#6366f1 ${report.overall_score}%, transparent ${report.overall_score}%)` }}>
              <div className="absolute inset-2 bg-slate-950 rounded-full flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold gradient-text">{Math.round(report.overall_score)}%</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 p-6 sm:p-8 rounded-3xl border border-white/8 bg-white/3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Section Analysis
              </h3>
              {getProbabilityBadge(report.hiring_probability)}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {[
                { label: "Technical Knowledge", val: categoryScores.technical_knowledge },
                { label: "Coding Ability", val: categoryScores.coding_ability },
                { label: "Communication Skills", val: categoryScores.communication },
                { label: "Confidence Score", val: categoryScores.confidence }
              ].map(cat => (
                <div key={cat.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{cat.label}</span>
                    <span className="text-white">{Math.round(cat.val || 0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${cat.val || 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 space-y-5">
            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> {t("strengths")}
            </h3>
            <ul className="space-y-3">
              {strengths.map((s: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 space-y-5">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> {t("weaknesses")}
            </h3>
            <ul className="space-y-3">
              {weaknesses.map((w: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Feedback & Improvements */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/8 bg-white/3 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> AI Executive Summary
            </h3>
            <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/5 text-sm leading-relaxed text-slate-300 whitespace-pre-line relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-500 rounded-l-2xl" />
              {report.detailed_ai_feedback}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">{t("improvementAreas")}</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {improvementAreas.map((area: string, i: number) => (
                <li key={i} className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggested Resources */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/8 bg-white/3 space-y-6">
          <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> {t("learningResources")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map((res: string, i: number) => (
              <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block mb-1">Recommended Material</span>
                  <span className="text-xs text-slate-400 leading-relaxed block">{res}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
