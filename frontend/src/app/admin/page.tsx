"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ShieldCheck, Users, Calendar, Award, LayoutDashboard, Cpu, ArrowLeft, RefreshCw, BarChart3, Database } from "lucide-react";

export default function AdminDashboard() {
  const { token, role } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [metricsData, usersData, interviewsData] = await Promise.all([
        api.getAdminMetrics(token!),
        api.getAdminUsers(token!),
        api.getAdminInterviews(token!)
      ]);
      setMetrics(metricsData);
      setUsers(usersData);
      setInterviews(interviewsData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    if (role !== "admin") { router.push("/dashboard"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAdminData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2 text-center">
            <div className="h-4 w-48 rounded-full skeleton mx-auto" />
            <div className="h-3 w-32 rounded-full skeleton mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: metrics?.total_users || 0, icon: Users, color: "from-indigo-500 to-violet-500" },
    { label: "Active Sessions", value: metrics?.active_users || 0, icon: BarChart3, color: "from-emerald-500 to-teal-500" },
    { label: "Total Interviews", value: metrics?.interviews_conducted || 0, icon: Calendar, color: "from-blue-500 to-cyan-500" },
    { label: "Average Score", value: `${metrics?.average_score || 0}%`, icon: Award, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5" style={{ background: "rgba(2,6,23,0.88)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="font-extrabold text-sm sm:text-base gradient-text uppercase tracking-wider">Administrator Hub</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">System Operations</h1>
          <p className="text-sm text-slate-400 mt-1">Realtime database insights and user audit logs</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-5 sm:p-6 rounded-2xl border border-white/8 bg-white/3 flex items-center justify-between group hover:bg-white/5 transition-colors">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Tables Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* User Accounts */}
          <div className="lg:col-span-5 flex flex-col rounded-2xl border border-white/8 bg-white/3 h-[500px] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-2 bg-white/3">
              <Users className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">User Registrations</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-900 border-b border-white/5 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">User Details</th>
                    <th className="px-5 py-3 font-semibold text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-200 truncate max-w-[200px]">{u.email}</div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{u.target_role || "No target role"}</div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "bg-white/5 text-slate-400 border border-white/10"
                        }`}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interview logs */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/8 bg-white/3 h-[500px] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-2 bg-white/3">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Interview Activity Log</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 bg-slate-900 border-b border-white/5 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Candidate</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {interviews.map(iv => (
                    <tr key={iv.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-200 truncate max-w-[150px]">{iv.user_name}</td>
                      <td className="px-5 py-3 capitalize text-slate-400">{iv.type}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          iv.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                        }`}>{iv.status}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-extrabold text-white">
                        {iv.score !== null ? `${iv.score}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
