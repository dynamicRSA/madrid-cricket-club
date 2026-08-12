"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

export default function SignInPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setError("Authentication will be live once the Supabase backend is configured.");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 pt-20">
        <div className="w-full max-w-md px-4 py-12">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image src="/images/logo.png" alt="MCC Logo" width={72} height={72} className="rounded-full mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-white">Member Sign In</h1>
            <p className="text-slate-400 text-sm mt-1">Madrid Cricket Club</p>
          </div>

          <div className="glass-dark p-8">
            {/* Google SSO */}
            <button
              type="button"
              className="btn-outline w-full justify-center mb-5"
              onClick={() => setError("Google sign-in will be available once backend is configured.")}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-500 text-xs">or sign in with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="signin-email">
                  <Mail size={12} className="inline mr-1" /> Email address
                </label>
                <input id="signin-email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="your@email.com" className="input" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0" htmlFor="signin-password">
                    <Lock size={12} className="inline mr-1" /> Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-brand-400 hover:text-brand-300 text-xs transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="signin-password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="input pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Sign In"}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-400 text-sm mt-6">
            Not a member yet?{" "}
            <Link href="/join" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Apply to Join
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
