// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  // When the reset email link is clicked, Supabase redirects here with
  // #access_token=...&type=recovery in the hash.
  // With flowType:"implicit" + detectSessionInUrl:true, the SDK auto-processes
  // the hash and establishes a recovery session.
  useEffect(() => {
    const supabase = createClient();

    async function waitForSession() {
      // Poll for the recovery session (SDK processes hash asynchronously)
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 500));
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setSessionReady(true);
          return;
        }
      }
      // No session after 4s — link was invalid or already used
      setError("This reset link is invalid or has expired. Please request a new one.");
    }

    // If page was loaded directly (not from reset link), check for existing session
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      waitForSession();
    } else {
      // Check if user is already logged in (navigated here directly)
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) setSessionReady(true);
        else router.replace("/auth/forgot-password");
      });
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 2500);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 pt-20">
        <div className="w-full max-w-md px-4 py-12">
          <div className="glass-dark p-8">

            {/* Icon + Title */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                <Lock size={24} className="text-brand-400" />
              </div>
              <h1 className="text-xl font-display font-bold text-white">Set new password</h1>
              <p className="text-slate-400 text-sm mt-1">Madrid Cricket Club</p>
            </div>

            {done ? (
              <div className="text-center space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle size={24} className="text-green-400" />
                </div>
                <p className="text-white font-semibold">Password updated!</p>
                <p className="text-slate-400 text-sm">Redirecting to your dashboard…</p>
              </div>
            ) : error && !sessionReady ? (
              <div className="text-center space-y-4">
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-4 rounded-xl">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
                <Link href="/auth/forgot-password" className="btn-primary w-full justify-center inline-flex">
                  Request new reset link
                </Link>
              </div>
            ) : !sessionReady ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <Loader2 size={24} className="animate-spin text-brand-400" />
                <p className="text-slate-400 text-sm">Verifying your reset link…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label" htmlFor="reset-pw">New password</label>
                  <div className="relative">
                    <input
                      id="reset-pw"
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pr-10"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="reset-confirm">Confirm password</label>
                  <input
                    id="reset-confirm"
                    type={showPw ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input"
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </div>

                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[8, 10, 12, 14].map((min) => (
                        <div key={min}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            password.length >= min ? "bg-brand-500" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-slate-500 text-xs">
                      {password.length < 8 ? "Too short" : password.length < 10 ? "Acceptable" : password.length < 12 ? "Good" : "Strong"}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-xl">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || !password || !confirm} className="btn-primary w-full justify-center">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Updating…</> : "Set new password"}
                </button>

                <p className="text-center text-slate-500 text-xs">
                  <Link href="/auth/signin" className="hover:text-slate-300 transition-colors">Back to sign in</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
