"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Globe, Moon, Sun, ArrowRight, CheckCircle2, ShieldAlert, Award, Code2, Users, Cpu, FileText } from "lucide-react";

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout, role } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="font-extrabold text-xl bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              {t("appName")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-sm font-semibold"
              title="Switch Language"
            >
              <Globe className="w-4 h-4" />
              <span>{language === "en" ? "हिन्दी" : "English"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-lg shadow-md hover:shadow-indigo-500/20"
                >
                  {t("dashboard")}
                </Link>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                  >
                    {t("admin")}
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-lg shadow-md hover:shadow-indigo-500/20 flex items-center gap-2"
              >
                <span>{t("login")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-slate-900/50 dark:via-slate-950 dark:to-transparent">
          {/* Decorative Background Blob */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full filter blur-3xl -z-10 animate-blob"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-violet-400/20 dark:bg-violet-600/10 rounded-full filter blur-3xl -z-10 animate-blob animation-delay-2000"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Next Generation AI Interview Simulator</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight max-w-4xl mx-auto">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t("heroSubtitle")}
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all rounded-xl shadow-lg hover:shadow-indigo-500/20 flex items-center gap-3"
              >
                <span>{t("getStarted")}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Learn More
              </Link>
            </div>

            {/* Realtime Trust Logos */}
            <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                SIMULATING EXPERIENCES AT WORLD-CLASS COMPANIES
              </p>
              <div className="mt-6 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 dark:opacity-40 grayscale contrast-200 font-bold text-slate-500 text-lg">
                <span>GOOGLE</span>
                <span>MICROSOFT</span>
                <span>AMAZON</span>
                <span>META</span>
                <span>TCS</span>
                <span>INFOSYS</span>
                <span>ACCENTURE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white dark:bg-slate-900/30 border-t border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Everything You Need to Ace the Interview
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                A complete, end-to-end evaluation suite combining behavioral psychometrics and deep technical testing.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-white dark:bg-slate-900/50">
                <Code2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Coding & Tech Rounds</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Online compiler with hidden test cases, space/time complexity feedback, and multi-language support.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-white dark:bg-slate-900/50">
                <Users className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">STAR Behavioral Round</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Detailed situation analysis evaluating leadership, teamwork, and structured conflict-resolution skills.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-white dark:bg-slate-900/50">
                <Globe className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">English & Hindi Support</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Prepare comfortably by toggling between Hindi and English prompts, answers, reports, and AI voice responses.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-white dark:bg-slate-900/50">
                <FileText className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resume-Based Adaptation</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Upload your resume to receive highly customized, relevant questions probing your actual experience and projects.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security / Consent Highlight */}
        <section className="py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 flex flex-col md:flex-row items-center gap-6">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/60 rounded-2xl text-indigo-600 dark:text-indigo-400 shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-indigo-900 dark:text-indigo-200">
                  Privacy-First Eye Gaze & Attention Monitoring
                </h3>
                <p className="mt-1 text-sm text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                  We process eye-tracking and voice analysis parameters securely. No video or screen feeds are sent to third-party servers; all gaze validation and speech filler counting is completed securely on your browser.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-white text-base">{t("appName")}</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} {t("appName")}. All rights reserved. Built for professional interview readiness.
          </p>
        </div>
      </footer>
    </div>
  );
}
