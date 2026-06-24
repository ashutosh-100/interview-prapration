"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  LogOut, Sun, Moon, PlusCircle, Calendar, Award,
  CheckCircle, Clock, ChevronRight, Cpu, TrendingUp,
  Target, Zap, Globe, Menu, X, User, BarChart2
} from "lucide-react";

export default function Dashboard() {
  const { token, profile, role, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ avgScore: 0, conducted: 0, readiness: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const history = await api.getInterviewHistory(token!);
      let completedCount = 0;
      let totalScoreSum = 0;
      const historyChart: any[] = [];

      const processedInterviews = await Promise.all(
        history.map(async (item: any) => {
          if (item.status === "completed") {
            try {
              const details = await api.getInterviewDetails(item.id, token!);
              if (details.report) {
                completedCount++;
                totalScoreSum += details.report.overall_score;
                historyChart.push({
                  date: new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                  score: details.report.overall_score,
                  type: item.type.toUpperCase()
                });
                return { ...item, score: details.report.overall_score };
              }
            } catch (e) { console.error(e); }
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
        readiness: Math.min(100, Math.round(avg * 1.1))
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const statCards = [
    { label: t("overallAverage"), value: `${metrics.avgScore}%`, icon: Award, gradient: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20" },
    { label: t("interviewsConducted"), value: String(metrics.conducted), icon: Calendar, gradient: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/20" },
    { label: t("readinessScore"), value: `${metrics.readiness}%`, icon: Target, gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <div className="h-4 w-48 rounded-full skeleton mx-auto" />
            <div className="h-3 w-32 rounded-full skeleton mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-white/5" style={{ background: "rgba(2,6,23,0.88)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base sm:text-lg gradient-text hidden sm:block">{t("appName")}</span>
          </div>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setLanguage(language === "en" ? "hi" : "en")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Globe className="w-3.5 h-3.5" />{language === "en" ? "हिन्दी" : "English"}
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {role === "admin" && (
              <Link href="/admin" className="px-3 py-1.5 text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-all">
                ADMIN
              </Link>
            )}
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <LogOut className="w-4 h-4" /><span>Logout</span>
            </button>
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all" onClick={() => setMobileMenuOpen(v => !v)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 px-4 py-3 space-y-1 animate-fade-in" style={{ background: "rgba(2,6,23,0.98)" }}>
            {role === "admin" && <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-indigo-400 hover:bg-white/5 transition-all">Admin Dashboard</Link>}
            <div className="flex gap-2">
              <button onClick={() => setLanguage(language === "en" ? "hi" : "en")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-slate-400 border border-white/10 hover:bg-white/5 transition-all">
                <Globe className="w-4 h-4" />{language === "en" ? "हिन्दी" : "English"}
              </button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-slate-400 border border-white/10 hover:bg-white/5 transition-all">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-all">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8" style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(124,58,237,0.1) 100%)", border: "1px solid rgba(79,70,229,0.2)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Welcome back</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">
                {t("welcome")}, {profile?.full_name || "Innovator"}!
              </h1>
              <p className="text-sm text-slate-400 mt-1.5">
                Targeting: <span className="font-bold text-slate-200">{profile?.target_role || "Not set"}</span>
                <span className="mx-2 text-slate-600">·</span>
                Level: <span className="capitalize font-bold text-indigo-400">{profile?.experience_level || "Beginner"}</span>
              </p>
            </div>
            <Link
              href="/interview/setup"
              className="btn-glow px-5 sm:px-6 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t("newInterview")}</span>
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map(({ label, value, icon: Icon, gradient, glow }) => (
            <div key={label} className="relative overflow-hidden p-5 sm:p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 transition-all group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">{value}</p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${glow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* Chart + Domains */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border border-white/8 bg-white/3">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Score Improvement Trend</h3>
              </div>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9", fontSize: "12px" }}
                      cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1 }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl border border-white/8 bg-white/3">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Skill Mastery</h3>
              </div>
              <div className="space-y-4">
                {profile?.selected_domains.split(",").filter((d: string) => d.trim()).map((domain: string, i: number) => {
                  const score = Math.round(metrics.avgScore * (1 - i * 0.12));
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="capitalize text-slate-300">{domain.trim()}</span>
                        <span className="text-slate-400">{score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  );
                }) || (
                  <div className="py-8 text-center text-sm text-slate-500">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                    No domains selected in your profile yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interview History */}
        <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-white/8 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white">{t("pastInterviews")}</h3>
            <Link href="/interview/setup" className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              <PlusCircle className="w-3.5 h-3.5" />New
            </Link>
          </div>

          {interviews.length === 0 ? (
            <div className="py-16 sm:py-20 text-center px-4">
              <div className="w-16 h-16 rounded-3xl bg-white/3 border border-white/8 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">{t("noInterviews")}</p>
              <Link href="/interview/setup" className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white">
                <PlusCircle className="w-4 h-4" />Start Practice Now
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 text-left font-bold">Type</th>
                      <th className="px-6 py-3 text-left font-bold">Difficulty</th>
                      <th className="px-6 py-3 text-left font-bold">Date</th>
                      <th className="px-6 py-3 text-left font-bold">Status</th>
                      <th className="px-6 py-3 text-left font-bold">Score</th>
                      <th className="px-6 py-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {interviews.map(item => (
                      <tr key={item.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold capitalize text-slate-200">{item.type} Round</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                            item.difficulty === "advanced" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                            item.difficulty === "intermediate" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" :
                            "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          }`}>{item.difficulty}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{new Date(item.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold w-fit ${item.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                            {item.status === "completed" ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 animate-spin" />}
                            {item.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-white">{item.score !== undefined ? `${item.score}%` : "—"}</td>
                        <td className="px-6 py-4 text-right">
                          {item.status === "completed" ? (
                            <Link href={`/report/${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                              {t("viewReport")} <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <Link href={`/interview/${item.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                              Resume <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-white/5">
                {interviews.map(item => (
                  <div key={item.id} className="p-4 hover:bg-white/3 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold capitalize text-slate-200 text-sm">{item.type} Round</p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.score !== undefined && <span className="text-sm font-extrabold text-white">{item.score}%</span>}
                        {item.status === "completed" ? (
                          <Link href={`/report/${item.id}`} className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <Link href={`/interview/${item.id}`} className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                        item.difficulty === "advanced" ? "bg-amber-500/15 text-amber-400" :
                        item.difficulty === "intermediate" ? "bg-indigo-500/15 text-indigo-400" :
                        "bg-emerald-500/15 text-emerald-400"
                      }`}>{item.difficulty}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-semibold ${item.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                        {item.status === "completed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
