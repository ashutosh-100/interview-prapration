"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  Globe, Moon, Sun, ArrowRight, CheckCircle2, ShieldCheck,
  Award, Code2, Users, Cpu, FileText, Mic, BarChart3, Zap,
  Star, ChevronRight, Menu, X
} from "lucide-react";

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Code2, title: "Coding Rounds", color: "from-blue-500 to-cyan-400",
      desc: "Live compiler with hidden test cases, time/space complexity feedback, Python & JavaScript support."
    },
    {
      icon: Mic, title: "AI Voice Interviewer", color: "from-violet-500 to-purple-400",
      desc: "Your AI interviewer speaks questions aloud and listens to your voice answers in real-time."
    },
    {
      icon: Users, title: "Behavioral STAR", color: "from-rose-500 to-pink-400",
      desc: "Structured situation analysis evaluating leadership, teamwork & conflict resolution skills."
    },
    {
      icon: BarChart3, title: "Performance Reports", color: "from-amber-500 to-orange-400",
      desc: "Detailed AI-generated reports with strengths, weaknesses, scores & resource suggestions."
    },
    {
      icon: Globe, title: "Hindi & English", color: "from-emerald-500 to-teal-400",
      desc: "Toggle seamlessly between Hindi and English for questions, reports and AI voice responses."
    },
    {
      icon: FileText, title: "Resume-Adaptive AI", color: "from-indigo-500 to-blue-400",
      desc: "Upload your resume and receive hyper-personalized questions probing your exact experience."
    },
  ];

  const companies = ["GOOGLE", "MICROSOFT", "AMAZON", "META", "TCS", "INFOSYS", "WIPRO"];

  const stats = [
    { value: "10K+", label: "Mock Interviews" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "4.9★", label: "User Rating" },
    { value: "50+", label: "Companies Prep" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5" style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(24px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 no-select">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg gradient-text hidden sm:block">{t("appName")}</span>
            <span className="font-extrabold text-lg gradient-text sm:hidden">InterviewAI</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              {language === "en" ? "हिन्दी" : "English"}
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                {role === "admin" && <Link href="/admin" className="px-4 py-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Admin</Link>}
                <button onClick={logout} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-rose-400 transition-colors">Logout</button>
              </>
            ) : (
              <Link href="/login" className="btn-glow px-5 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-950/98 px-4 py-4 space-y-2 animate-fade-in">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all">Dashboard</Link>
                {role === "admin" && <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-indigo-400 hover:bg-white/5 transition-all">Admin</Link>}
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-white/5 transition-all">Logout</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block btn-glow px-4 py-3 rounded-xl text-sm font-bold text-white text-center">Get Started Free</Link>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setLanguage(language === "en" ? "hi" : "en")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-400 border border-white/10 hover:bg-white/5 transition-all">
                <Globe className="w-4 h-4" /> {language === "en" ? "हिन्दी" : "English"}
              </button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-400 border border-white/10 hover:bg-white/5 transition-all">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <main className="flex-1">
        <section className="relative min-h-[92vh] flex items-center justify-center px-4 py-20 overflow-hidden">
          {/* Background orbs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-600/20 rounded-full blur-3xl animate-blob pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-violet-600/20 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-blob animation-delay-4000 pointer-events-none" />

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "64px 64px"
          }} />

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold mb-8 animate-fade-up">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Gen AI Interview Simulator</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-up delay-100">
              <span className="text-white">{t("heroTitle").split(" ").slice(0, 3).join(" ")} </span>
              <span className="gradient-text">{t("heroTitle").split(" ").slice(3).join(" ")}</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up delay-200">
              {t("heroSubtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up delay-300">
              <Link
                href="/login"
                className="btn-glow w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3"
              >
                <span>{t("getStarted")}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all text-center"
              >
                See All Features
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-up delay-400">
              {stats.map(({ value, label }) => (
                <div key={label} className="p-4 rounded-2xl border border-white/8 bg-white/3 text-center">
                  <p className="text-xl sm:text-2xl font-extrabold gradient-text">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPANY LOGOS ── */}
        <section className="py-10 border-t border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-600 mb-6">
              Preparing candidates for top companies
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
              {companies.map(c => (
                <span key={c} className="text-slate-600 text-sm font-extrabold tracking-widest hover:text-slate-400 transition-colors">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-20 sm:py-28 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 block">Platform Features</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Everything to Ace the Interview</h2>
              <p className="mt-4 text-slate-400 max-w-xl mx-auto">A complete end-to-end evaluation suite combining behavioral psychometrics with deep technical testing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ icon: Icon, title, color, desc }, i) => (
                <div
                  key={title}
                  className="group p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-indigo-500/30 transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRIVACY HIGHLIGHT ── */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative p-6 sm:p-8 rounded-3xl border border-indigo-500/20 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(124,58,237,0.05) 100%)" }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white mb-1">Privacy-First Eye Gaze & Voice Analysis</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    All gaze tracking and speech filler counting runs <span className="text-indigo-300 font-semibold">100% locally in your browser</span>. No video or audio is ever sent to third-party servers. Your data stays yours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-slate-400 mb-8">Start your first AI mock interview today — completely free.</p>
            <Link href="/login" className="btn-glow inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white">
              <span>Start Free Interview</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">{t("appName")}</span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            &copy; {new Date().getFullYear()} {t("appName")}. Built for professional interview readiness.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Privacy protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
