// app/login/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/user-store";
import { Compass, AlertCircle, Info, ArrowLeft, Loader2, KeyRound, Phone, ShieldCheck, Cpu, Globe, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AuthStatus = "idle" | "sendingOtp" | "otpSent" | "verifying" | "success" | "error";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);

  // States
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Refs for OTP inputs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Detect mock mode based on env
  const isMockMode =
    typeof window !== "undefined" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"));

  // Handle URL parameters for role selection
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "recruiter" || roleParam === "candidate") {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Handle auto-focus first box when switching to OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    setAuthStatus("sendingOtp");

    try {
      if (isMockMode) {
        const data = await api.login(phone, role);
        if (data.success) {
          setStep("otp");
          setAuthStatus("otpSent");
          setMessage("OTP sent (Mock mode: Use 123456 to verify)");
        }
      } else {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });
        if (error) throw error;
        setStep("otp");
        setAuthStatus("otpSent");
        setMessage("OTP sent successfully to your phone.");
      }
    } catch (err: any) {
      console.error("Login send OTP error:", err);
      setAuthStatus("error");
      setError(err.message || "Failed to send OTP. Please check your number.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resending || loading) return;
    setResending(true);
    setError(null);
    setMessage(null);

    try {
      if (isMockMode) {
        const data = await api.login(phone, role);
        if (data.success) {
          setAuthStatus("otpSent");
          setMessage("OTP sent successfully.");
        } else {
          throw new Error("Unable to resend OTP.");
        }
      } else {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });
        if (error) throw error;
        setAuthStatus("otpSent");
        setMessage("OTP sent successfully.");
      }
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      setAuthStatus("error");
      setError("Unable to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    
    if (otp.length < 6) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setAuthStatus("verifying");

    try {
      if (isMockMode) {
        const data = await api.verifyOtp(phone, otp, role);
        if (data.success) {
          setAuthStatus("success");
          setMessage("✅ Login successful.");
          setUser({
            id: data.user.id,
            email: data.user.email || "",
            firstName: data.profile ? data.profile.fullName.split(" ")[0] : "User",
            lastName: data.profile ? data.profile.fullName.split(" ").slice(1).join(" ") : "",
            imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
            fullName: data.profile ? data.profile.fullName : "User",
            role: data.user.role,
            profileId: data.profile ? data.profile.id : undefined,
          } as any);

          setTimeout(() => {
            if (data.userExists) {
              if (role === "recruiter") {
                router.push("/recruiter/dashboard");
              } else {
                router.push("/dashboard");
              }
            } else {
              router.push("/onboarding");
            }
          }, 1500);
        }
      } else {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const { data: authData, error: authError } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: "sms",
        });

        if (authError || !authData.user) {
          throw authError || new Error("Verification failed");
        }

        // Call server route to upsert user/check profile status
        const syncRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code: otp, role }),
        });

        if (!syncRes.ok) {
          const errData = await syncRes.json().catch(() => ({}));
          const error = new Error(errData.error || "Failed to sync auth session");
          (error as any).status = syncRes.status;
          throw error;
        }

        const data = await syncRes.json();
        setAuthStatus("success");
        setMessage("✅ Login successful.");
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          firstName: data.profile ? data.profile.fullName.split(" ")[0] : "User",
          lastName: data.profile ? data.profile.fullName.split(" ").slice(1).join(" ") : "",
          imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
          fullName: data.profile ? data.profile.fullName : "User",
          role: data.user.role,
          profileId: data.profile ? data.profile.id : undefined,
        } as any);

        setTimeout(() => {
          if (data.userExists) {
            if (role === "recruiter") {
              router.push("/recruiter/dashboard");
            } else {
              router.push("/dashboard");
            }
          } else {
            router.push("/onboarding");
          }
        }, 1500);
      }
    } catch (err: any) {
      console.error("Verification OTP error:", err);
      setAuthStatus("error");
      
      if (err.status === 400) {
        setError("Invalid OTP. Please try again.");
      } else if (err.status === 401) {
        setError("OTP has expired. Request a new OTP.");
      } else if (err.status === 404) {
        setError("Verification service unavailable.");
      } else if (err.status === 500) {
        setError("Something went wrong. Please try again later.");
      } else if (err.status === 408 || err.name === "AbortError" || err.message?.includes("timed out")) {
        setError("Request timed out. Check your internet connection and try again.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const val = value.replace(/[^0-9]/g, "");
    if (!val) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      setOtp(newDigits.join(""));
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = val.charAt(val.length - 1);
    setOtpDigits(newDigits);
    
    const joined = newDigits.join("");
    setOtp(joined);

    // Auto-focus next input
    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        setOtp(newDigits.join(""));
        otpRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
        setOtp(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").substring(0, 6);
    if (pasteData.length === 6) {
      const newDigits = pasteData.split("");
      setOtpDigits(newDigits);
      setOtp(pasteData);
      otpRefs.current[5]?.focus();
    }
  };

  // Status mapping UI
  const getStatusIndicator = () => {
    switch (authStatus) {
      case "sendingOtp":
        return { text: "Sending OTP...", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "otpSent":
        return { text: "OTP Sent successfully", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
      case "verifying":
        return { text: "Verifying credentials...", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
      case "success":
        return { text: "Verified successfully", color: "text-emerald-450 bg-emerald-500/10 border-emerald-500/20" };
      case "error":
        return { text: "Authentication failed", color: "text-red-400 bg-red-500/10 border-red-500/20" };
      case "idle":
      default:
        return null;
    }
  };

  const statusUI = getStatusIndicator();

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 relative overflow-x-hidden overflow-y-auto font-sans select-none selection:bg-blue-500/30">
      
      {/* Animated Glowing Ambient Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [-150, 150, -150],
            y: [-100, 100, -100],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vh] bg-violet-600/10 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{
            x: [200, -200, 200],
            y: [300, -100, 300],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vh] bg-cyan-500/10 rounded-full blur-[160px]"
        />
      </div>

      {/* Subtle SaaS Grid Line Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />

      {/* Primary Authentication Container */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[540px] glass-panel border border-white/12 shadow-[0_25px_80px_rgba(0,0,0,0.5)] rounded-3xl p-8 sm:p-12 relative z-10 space-y-8"
      >
        {/* Header Hero Section */}
        <div className="text-center space-y-6">
          <div className="relative group mx-auto w-16 h-16 flex items-center justify-center">
            {/* Soft pulsing animated glow rings */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
            <div className="relative w-16 h-16 rounded-2xl bg-[#080d16] border border-white/10 flex items-center justify-center shadow-2xl">
              <Compass className="w-8 h-8 text-cyan-400 group-hover:rotate-45 transition-transform duration-500 ease-out" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight">
              {role === "candidate" ? "Candidate Portal" : "Recruiter Portal"}
            </h1>
            <p className="text-[15px] text-gray-300 font-medium max-w-sm mx-auto leading-relaxed">
              {role === "candidate" 
                ? "Verify your vocational skills and access job opportunities across India." 
                : "Source verified technical talent across India directly."}
            </p>
          </div>

          {/* Secure Status Badge */}
          {statusUI && (
            <div className="inline-flex items-center">
              <span className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest font-mono border ${statusUI.color} transition-all duration-300`}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                {statusUI.text}
              </span>
            </div>
          )}
        </div>

        {/* Role Toggle Tabs */}
        {step === "phone" && (
          <div className="flex bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl space-x-2">
            <button
              onClick={() => setRole("candidate")}
              className={`flex-grow py-3 text-[14px] font-bold rounded-xl transition-all duration-350 cursor-pointer ${
                role === "candidate" 
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Candidate Portal
            </button>
            <button
              onClick={() => setRole("recruiter")}
              className={`flex-grow py-3 text-[14px] font-bold rounded-xl transition-all duration-350 cursor-pointer ${
                role === "recruiter" 
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Recruiter Portal
            </button>
          </div>
        )}

        {/* Error / Alert Boxes wrapped with Framer Motion AnimatePresence */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 premium-alert-error rounded-xl text-[14px] font-semibold flex items-start gap-3 shadow-md border border-red-500/20">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed text-red-200">{error}</span>
              </div>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 premium-alert-info rounded-xl text-[14px] font-semibold flex items-start gap-3 shadow-md border border-blue-500/20">
                <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
                <span className="leading-relaxed text-blue-200">{message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step === "phone" ? (
          /* Phone Input Form */
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="flex flex-col gap-2.5">
              <label className="text-[14px] font-bold text-gray-200 tracking-wide flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                Phone Number / मोबाईल नंबर
              </label>
              <div className="flex relative rounded-xl overflow-hidden group">
                <span className="p-4 bg-white/[0.04] border border-white/15 border-r-0 rounded-l-xl text-[14px] font-bold text-gray-200 flex items-center select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 p-4 premium-input rounded-r-xl outline-none text-[16px] font-semibold transition"
                  placeholder="9876543210"
                />
              </div>
              <p className="text-[14px] text-gray-400 font-normal">
                Enter your 10-digit primary contact number.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || authStatus === "sendingOtp"}
              className="w-full mt-4 py-4 premium-btn-blue text-[16px] font-bold text-white flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shimmer-btn hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  Sending secure request...
                </>
              ) : (
                "Request Login OTP"
              )}
            </button>
          </form>
        ) : (
          /* OTP Input Form */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex flex-col gap-3">
              <label className="text-[14px] font-bold text-gray-200 tracking-wide flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                Enter Verification Code / ओटीपी कोड
              </label>
              
              {/* Upgraded 64px OTP Inputs with Auto-focus and Paste */}
              <div className="flex justify-between gap-2.5 sm:gap-4 py-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    required
                    pattern="[0-9]{1}"
                    maxLength={1}
                    value={digit}
                    disabled={loading || authStatus === "verifying"}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 sm:w-16 sm:h-16 text-center text-xl font-bold bg-white/[0.04] border border-white/15 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 rounded-2xl outline-none transition-all duration-300 text-white hover:border-white/20 disabled:opacity-50"
                    placeholder="-"
                  />
                ))}
              </div>
              <p className="text-[14px] text-gray-400 font-normal text-center">
                We sent a 6-digit verification code to +91 {phone}.
              </p>
            </div>

            <div className="flex justify-between items-center text-[14px]">
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setAuthStatus("idle");
                  setError(null);
                  setMessage(null);
                }}
                className="text-gray-300 hover:text-white font-bold cursor-pointer transition-colors"
              >
                Change Phone
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending || loading}
                className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {resending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Resend OTP
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || authStatus === "verifying"}
              className="w-full mt-4 py-4 premium-btn-blue text-[16px] font-bold text-white flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shimmer-btn hover:scale-[1.01]"
            >
              {loading || authStatus === "verifying" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  Verifying...
                </>
              ) : (
                "Verify Code & Login"
              )}
            </button>
          </form>
        )}

        {/* Secure Trust Badges Footer */}
        <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono select-none">
          <div className="flex items-center justify-center gap-2 py-1 px-2 rounded-lg bg-white/[0.01]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Auth</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1 px-2 rounded-lg bg-white/[0.01]">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>AI Verification</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1 px-2 rounded-lg bg-white/[0.01]">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Multilingual</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1 px-2 rounded-lg bg-white/[0.01]">
            <Lock className="w-4 h-4 text-violet-400" />
            <span>Privacy Secured</span>
          </div>
        </div>

        {/* Back navigation */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-[14px] font-semibold text-gray-300 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal Gateway
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
