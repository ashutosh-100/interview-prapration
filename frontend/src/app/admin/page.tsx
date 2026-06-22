"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ShieldCheck, Users, Calendar, Award, LayoutDashboard, Cpu, ArrowLeft, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const { token, role } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadAdminData();
  }, [token, role]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const metricsData = await api.getAdminMetrics(token!);
      const usersData = await api.getAdminUsers(token!);
      const interviewsData = await api.getAdminInterviews(token!);
      
      setMetrics(metricsData);
      setUsers(usersData);
      setInterviews(interviewsData);
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
          <span className="text-sm font-semibold text-slate-500 font-sans">Verifying administrative credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5" />
            <span>ADMINISTRATOR HUB</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            System Operations Metrics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Realtime database insights and user audit logs
          </p>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
                <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white mt-2">{metrics.total_users}</h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Users</p>
                <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white mt-2">{metrics.active_users}</h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Interviews Conducted</p>
                <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white mt-2">{metrics.interviews_conducted}</h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Score</p>
                <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white mt-2">{metrics.average_score}%</h3>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* User Accounts & Interviews Split tables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User Accounts */}
          <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[500px]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span>User Registrations</span>
            </h3>
            <div className="overflow-y-auto flex-1 pr-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2">User Email</th>
                    <th className="pb-2">Target Role</th>
                    <th className="pb-2 text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 font-semibold truncate max-w-[120px]">{u.email}</td>
                      <td className="py-3 text-slate-500 truncate max-w-[120px]">{u.target_role || "-"}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === "admin" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400" : "bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-400"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interview logs */}
          <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[500px]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>Interview Activity log</span>
            </h3>
            <div className="overflow-y-auto flex-1 pr-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2">Candidate</th>
                    <th className="pb-2">Round Type</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {interviews.map((iv) => (
                    <tr key={iv.id}>
                      <td className="py-3 font-semibold truncate max-w-[120px]">{iv.user_name}</td>
                      <td className="py-3 capitalize">{iv.type}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          iv.status === "completed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20" : "bg-amber-100 text-amber-800"
                        }`}>
                          {iv.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-extrabold text-slate-950 dark:text-white">
                        {iv.score !== null ? `${iv.score}%` : "-"}
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
