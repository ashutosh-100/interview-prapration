"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Lock, Mail, User, Phone, GraduationCap, Briefcase, Award, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";

type AuthTab = "login" | "signup" | "otp";

export default function Login() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [otpEmail, setOtpEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [currentRole, setCurrentRole] = useState("");
  const [targetRole, setTargetRole] = useState("");
  
  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Errors & Loading state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1. Create User
      const userRes = await api.signup({
        email: signupEmail,
        password: signupPassword
      });
      
      // 2. Perform Login to obtain token
      const formData = new URLSearchParams();
      formData.append("username", signupEmail);
      formData.append("password", signupPassword);
      const tokenRes = await api.login(formData);
      await login(tokenRes.access_token, tokenRes.role);

      
      // Update profile fields
      const updateData = {
        full_name: fullName,
        phone_number: phone,
        college,
        experience_level: experienceLevel,
        current_role: currentRole,
        target_role: targetRole,
        selected_domains: "",
        preferred_language: "en",
        theme: "system"
      };

      // Update profile details using the API client
      await api.updateProfile(updateData, tokenRes.access_token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) {
      setError("Please enter your email to receive OTP.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      setMessage("Demo OTP '123456' sent to your email!");
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otpCode !== "123456") {
      setError("Invalid OTP code. Please enter '123456' for demo validation.");
      return;
    }
    setLoading(true);
    try {
      
      // const userRes = await api.signup({
      //   email: otpEmail,
      //   password: "otp_mock_password"
      // }).catch(() => ({})); 

      
      const formData = new URLSearchParams();
      formData.append("username", otpEmail);
      formData.append("password", "otp_mock_password");
      const res = await api.login(formData).catch(async () => {
        // Retry with default signup
        await api.signup({ email: otpEmail, password: "otp_mock_password" });
        return api.login(formData);
      });
      
      await login(res.access_token, res.role);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Verification failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const mockEmail = "at9854787@gmail.com";
        const formData = new URLSearchParams();
        formData.append("username", mockEmail);
        formData.append("password", "as@%Fhu*11");
        
        // Try login, signup if doesn't exist
        let res;
        try {
          res = await api.login(formData);
        } catch (e) {
          await api.signup({ email: mockEmail, password: "as@%Fhu*11" });
          res = await api.login(formData);
        }
        await login(res.access_token, res.role);
        router.push("/dashboard");
      } catch (e: any) {
        setError("Google Auth failed: " + e.message);
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 items-center justify-center p-4 transition-colors">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back Home
        </Link>
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              {t("appName")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Elevate your interview performance
            </p>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 text-teal-600 dark:text-teal-400 text-sm font-semibold flex items-center gap-2">
              <span>{message}</span>
            </div>
          )}

          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
            <button
              onClick={() => {
                setActiveTab("login");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                activeTab === "login"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                activeTab === "signup"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Register
            </button>
            <button
              onClick={() => {
                setActiveTab("otp");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all ${
                activeTab === "otp"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              OTP Signin
            </button>
          </div>

          {/* Tab 1: Login */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                   value={loginPassword}
onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Sign In"}
              </button>
            </form>
          )}

          {/* Tab 2: Signup */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">College</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="Bahra University "
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Experience Level</label>
                  <div className="relative">
                    <Award className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-900 text-sm focus:outline-none"
                    >
                      <option value="beginner">Beginner (0-1 yrs)</option>
                      <option value="intermediate">Intermediate (2-5 yrs)</option>
                      <option value="advanced">Advanced (5+ yrs)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Current Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="Backend Engineer"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Target Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Senior Full Stack Dev"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Complete Registration"}
              </button>
            </form>
          )}

          {/* Tab 3: OTP */}
          {activeTab === "otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg flex items-center justify-center"
                  >
                    Send OTP Verification
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Enter OTP Code (Demo: 123456)</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="######"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="flex-1 py-3 text-sm font-bold text-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      Change Email
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify OTP"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute w-full border-t border-slate-200 dark:border-slate-800"></div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-400">
              OR CONTINUE WITH
            </span>
          </div>

          {/* Social login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-bold flex items-center justify-center gap-2.5 active:scale-95"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        {/* Security badge footer */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>Secured JWT session management. We protect your profile.</span>
        </div>
      </div>
    </div>
  );
}
