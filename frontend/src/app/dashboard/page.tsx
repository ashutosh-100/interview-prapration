"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { LogOut, Sun, Moon, PlusCircle, Calendar, Award, CheckCircle, Clock, ChevronRight, User, Cpu, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const { token, profile, role, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    avgScore: 0,
    conducted: 0,
    readiness: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadDashboardData();
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const history = await api.getInterviewHistory(token!);
      setInterviews(history);
      
      // Calculate scores
      let completedCount = 0;
      let totalScoreSum = 0;
      const historyChart: any[] = [];

      // Fetch reports for completed interviews to compile analytics
      const processedInterviews = await Promise.all(
        history.map(async (item: any) => {
          if (item.status === "completed") {
            try {
              const details = await api.getInterviewDetails(item.id, token!);
              if (details.report) {
                completedCount++;
                totalScoreSum += details.report.overall_score;
                
                historyChart.push({
                  date: new Date(item.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
                  score: details.report.overall_score,
                  type: item.type.toUpperCase()
                });
                return { ...item, score: details.report.overall_score };
              }
            } catch (e) {
              console.error(e);
            }
          }
          return item;
        })
      );

      setInterviews(processedInterviews);
      setChartData(historyChart.reverse());

      const avg = completedCount > 0 ? Math.round(totalScoreSum / completedCount) : 0;
      setMetrics({
        avgScore: avg,
        conducted: history.length,
        readiness: Math.round(avg * 1.1) > 100 ? 100 : Math.round(avg * 1.1)
      });
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
          <Clock className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading your profile dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              {t("appName")}
            </span>
          </div>

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

            {role === "admin" && (
              <Link
                href="/admin"
                className="px-3 py-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100"
              >
                ADMIN DASHBOARD
              </Link>
            )}

            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t("welcome")}, {profile?.full_name || "Innovator"}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Targeting: <span className="font-bold text-slate-700 dark:text-slate-200">{profile?.target_role || "Not specified"}</span> | Level: <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">{profile?.experience_level}</span>
            </p>
          </div>

          <Link
            href="/interview/setup"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2 self-start md:self-auto"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t("newInterview")}</span>
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("overallAverage")}</p>
              <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white mt-2">{metrics.avgScore}%</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("interviewsConducted")}</p>
              <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white mt-2">{metrics.conducted}</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("readinessScore")}</p>
              <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white mt-2">{metrics.readiness}%</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Score Improvement Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Mastery by Domain</h3>
              <div className="space-y-4">
                {profile?.selected_domains.split(",").filter(d => d).map((domain, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="capitalize">{domain.trim()}</span>
                      <span>{Math.round(metrics.avgScore * (1 - i * 0.15))}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(metrics.avgScore * (1 - i * 0.15))}%` }}
                      ></div>
                    </div>
                  </div>
                )) || (
                  <div className="text-sm text-slate-400 py-8 text-center">No domains selected in profile.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t("pastInterviews")}</h3>

          {interviews.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                {t("noInterviews")}
              </p>
              <Link
                href="/interview/setup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-indigo-700 mt-6 active:scale-95 transition-all"
              >
                Start Practice Now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Interview Type</th>
                    <th className="pb-3">Difficulty</th>
                    <th className="pb-3">Conducted At</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {interviews.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-4 font-bold capitalize">{item.type} Round</td>
                      <td className="py-4 capitalize">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.difficulty === "advanced" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400" :
                          item.difficulty === "intermediate" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400" :
                          "bg-teal-100 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400"
                        }`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="py-4 text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                          item.status === "completed" ? "text-teal-500" : "text-amber-500"
                        }`}>
                          {item.status === "completed" ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          <span className="capitalize">{item.status.replace("_", " ")}</span>
                        </span>
                      </td>
                      <td className="py-4 font-extrabold">
                        {item.score !== undefined ? `${item.score}%` : "-"}
                      </td>
                      <td className="py-4 text-right">
                        {item.status === "completed" ? (
                          <Link
                            href={`/report/${item.id}`}
                            className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                          >
                            <span>{t("viewReport")}</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <Link
                            href={`/interview/${item.id}`}
                            className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline"
                          >
                            <span>Resume</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
