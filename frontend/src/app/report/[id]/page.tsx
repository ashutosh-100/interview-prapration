"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import { Award, CheckCircle2, AlertTriangle, BookOpen, Clock, RefreshCw, ChevronLeft, Sun, Moon } from "lucide-react";

export default function PerformanceReport() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadReport();
  }, [token]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await api.getInterviewDetails(id, token!);
      setReport(data.report);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Compiling your performance feedback metrics...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold">Feedback report not found</h2>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-sm">
          Please check if the interview session completed successfully or return to your dashboard.
        </p>
        <Link href="/dashboard" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold mt-6">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Parse JSON arrays safely
  const categoryScores = JSON.parse(report.category_scores || "{}");
  const strengths = JSON.parse(report.strengths || "[]");
  const weaknesses = JSON.parse(report.weaknesses || "[]");
  const improvementAreas = JSON.parse(report.improvement_areas || "[]");
  const resources = JSON.parse(report.resource_suggestions || "[]");

  const getHiringProbabilityBadge = (prob: string) => {
    switch (prob?.toLowerCase()) {
      case "high":
        return <span className="px-3.5 py-1 text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full">{t("probabilityHigh")}</span>;
      case "medium":
        return <span className="px-3.5 py-1 text-xs font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-full">{t("probabilityMedium")}</span>;
      default:
        return <span className="px-3.5 py-1 text-xs font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 rounded-full">{t("probabilityLow")}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t("performanceReport")}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Session UUID: {report.interview_id}
          </p>
        </div>

        {/* Overview Score Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">{t("overallScore")}</h3>
            <div className="relative w-32 h-32 flex items-center justify-center border-8 border-indigo-600 rounded-full">
              <span className="text-3xl font-extrabold text-slate-950 dark:text-white">{Math.round(report.overall_score)}%</span>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Section Analysis</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Technical Knowledge</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${categoryScores.technical_knowledge || 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold">{Math.round(categoryScores.technical_knowledge || 0)}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Coding Ability</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${categoryScores.coding_ability || 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold">{Math.round(categoryScores.coding_ability || 0)}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Communication Skills</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${categoryScores.communication || 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold">{Math.round(categoryScores.communication || 0)}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400">Confidence Score</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${categoryScores.confidence || 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold">{Math.round(categoryScores.confidence || 0)}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
              <span className="text-xs font-bold text-slate-400 uppercase">{t("hiringProbability")}</span>
              {getHiringProbabilityBadge(report.hiring_probability)}
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{t("strengths")}</span>
            </h3>
            <ul className="space-y-2 text-sm">
              {strengths.map((s: string, i: number) => (
                <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{t("weaknesses")}</span>
            </h3>
            <ul className="space-y-2 text-sm">
              {weaknesses.map((w: string, i: number) => (
                <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Feedback & Improvements */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{t("aiFeedbackSummary")}</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              {report.detailed_ai_feedback}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{t("improvementAreas")}</h3>
            <ul className="space-y-2.5 text-sm">
              {improvementAreas.map((area: string, i: number) => (
                <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-500 font-bold">{i + 1}.</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggested Resources */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>{t("learningResources")}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res: string, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-950 dark:text-white">Topic / Course suggestion</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{res}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all text-sm"
          >
            {t("backToDashboard")}
          </Link>
        </div>
      </main>
    </div>
  );
}
