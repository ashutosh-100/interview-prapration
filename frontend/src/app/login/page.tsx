"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {
  Lock, Mail, User, Phone, GraduationCap, Briefcase,
  Award, ShieldCheck, ArrowLeft, RefreshCw, Eye, EyeOff,
  Cpu, CheckCircle2, Sparkles
} from "lucide-react";

type AuthTab = "login" | "signup" | "otp";

const InputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">{children}</div>
);

export default function Login() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const clearMessages = () => { setError(null); setMessage(null); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", loginEmail);
      formData.append("password", loginPassword);
      const res = await api.login(formData);
      await login(res.access_token, res.role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await api.signup({ email: signupEmail, password: signupPassword });
      const formData = new URLSearchParams();
      formData.append("username", signupEmail);
      formData.append("password", signupPassword);
      const tokenRes = await api.login(formData);
      await login(tokenRes.access_token, tokenRes.role);
      await api.updateProfile({
        full_name: fullName,
        phone_number: phone,
        college,
        experience_level: experienceLevel,
        current_role: currentRole,
        target_role: targetRole,
        selected_domains: "",
        preferred_language: "en",
        theme: "system"
      }, tokenRes.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally { setLoading(false); }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) { setError("Please enter your email."); return; }
    clearMessages();
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      setMessage("Demo OTP '123456' sent to your email!");
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (otpCode !== "123456") { setError("Invalid OTP. Use '123456' for demo."); return; }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", otpEmail);
      formData.append("password", "otp_mock_password");
      const res = await api.login(formData).catch(async () => {
        await api.signup({ email: otpEmail, password: "otp_mock_password" });
        return api.login(formData);
      });
      await login(res.access_token, res.role);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Verification failed: " + err.message);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const mockEmail = "at9854787@gmail.com";
        const formData = new URLSearchParams();
        formData.append("username", mockEmail);
        formData.append("password", "as@%Fhu*11");
        let res;
        try { res = await api.login(formData); }
        catch { await api.signup({ email: mockEmail, password: "as@%Fhu*11" }); res = await api.login(formData); }
        await login(res.access_token, res.role);
        router.push("/dashboard");
      } catch (e: any) {
        setError("Google Sign-In failed: " + e.message);
      } finally { setLoading(false); }
    }, 800);
  };

  const tabs: { key: AuthTab; label: string }[] = [
    { key: "login", label: "Sign In" },
    { key: "signup", label: "Register" },
    { key: "otp", label: "OTP Login" },
  ];

  const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Back link */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back Home</span>
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30 mb-4 animate-float">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">{t("appName")}</h1>
          <p className="text-sm text-slate-500 mt-1">Elevate your interview performance</p>
        </div>

        <div className="rounded-3xl border border-white/8 overflow-hidden" style={{ background: "rgba(15,23,42,0.9)", backdropFilter: "blur(24px)" }}>
          <div className="p-6 sm:p-8">

            {/* Error / Message */}
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm font-medium flex items-start gap-3 animate-fade-in">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex bg-white/3 rounded-2xl p-1 mb-6 border border-white/5">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); clearMessages(); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                    activeTab === tab.key
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── TAB 1: Login ── */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4 animate-fade-up">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <InputWrapper>
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="name@company.com" className={inputClass} />
                  </InputWrapper>
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <InputWrapper>
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type={showLoginPwd ? "text" : "password"} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className={`${inputClass} pr-11`} />
                    <button type="button" onClick={() => setShowLoginPwd(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </InputWrapper>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-glow py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" />Sign In</>}
                </button>
              </form>
            )}

            {/* ── TAB 2: Signup ── */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 animate-fade-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <InputWrapper>
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" className={inputClass} />
                    </InputWrapper>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <InputWrapper>
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="email" required value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="jane@company.com" className={inputClass} />
                    </InputWrapper>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Password</label>
                    <InputWrapper>
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type={showSignupPwd ? "text" : "password"} required value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="••••••••" className={`${inputClass} pr-11`} />
                      <button type="button" onClick={() => setShowSignupPwd(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showSignupPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </InputWrapper>
                  </div>
                  <div>
                    <label className={labelClass}>Phone (Optional)</label>
                    <InputWrapper>
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputClass} />
                    </InputWrapper>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>College</label>
                    <InputWrapper>
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" value={college} onChange={e => setCollege(e.target.value)} placeholder="Bahra university " className={inputClass} />
                    </InputWrapper>
                  </div>
                  <div>
                    <label className={labelClass}>Experience Level</label>
                    <InputWrapper>
                      <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className={`${inputClass} bg-slate-900 appearance-none cursor-pointer`}>
                        <option value="beginner">Beginner (0-1 yrs)</option>
                        <option value="intermediate">Intermediate (2-5 yrs)</option>
                        <option value="advanced">Advanced (5+ yrs)</option>
                      </select>
                    </InputWrapper>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Current Role</label>
                    <InputWrapper>
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" value={currentRole} onChange={e => setCurrentRole(e.target.value)} placeholder="Backend Engineer" className={inputClass} />
                    </InputWrapper>
                  </div>
                  <div>
                    <label className={labelClass}>Target Role</label>
                    <InputWrapper>
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="text" required value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Senior Full Stack Dev" className={inputClass} />
                    </InputWrapper>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-glow py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" />Create Account</>}
                </button>
              </form>
            )}

            {/* ── TAB 3: OTP ── */}
            {activeTab === "otp" && (
              <div className="space-y-4 animate-fade-up">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <InputWrapper>
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="email" required value={otpEmail} onChange={e => setOtpEmail(e.target.value)} placeholder="name@company.com" className={inputClass} />
                      </InputWrapper>
                    </div>
                    <button type="submit" disabled={loading} className="w-full btn-glow py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Send OTP"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className={labelClass}>Enter OTP Code</label>
                      <p className="text-xs text-slate-500 mb-2">Demo OTP: <span className="font-bold text-indigo-400">123456</span></p>
                      <InputWrapper>
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" required maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="######" className={`${inputClass} text-center tracking-[0.5em] font-mono text-lg`} />
                      </InputWrapper>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setOtpSent(false)} className="flex-1 py-3.5 rounded-xl border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/5 transition-all">Change Email</button>
                      <button type="submit" disabled={loading} className="flex-1 btn-glow py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2">
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify OTP"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-1 h-px bg-white/8" />
              <span className="px-3 text-xs font-semibold text-slate-600">OR CONTINUE WITH</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-xl border border-white/10 bg-white/3 text-slate-300 hover:bg-white/8 hover:text-white transition-all text-sm font-bold flex items-center justify-center gap-3 active:scale-95"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 border-t border-white/5 flex items-center justify-center gap-2 text-slate-600 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Secured JWT session management. Your data is protected.</span>
          </div>
        </div>
      </div>
    </div>
  );
}