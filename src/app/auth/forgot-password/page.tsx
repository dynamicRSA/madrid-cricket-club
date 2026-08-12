"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await sendPasswordReset(email);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 pt-20">
        <div className="w-full max-w-md px-4 py-12">
          <div className="glass-dark p-8">
            <Link href="/auth/signin" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft size={14} /> Back to sign in
            </Link>

            {sent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-brand-400" />
                </div>
                <h2 className="text-xl font-display font-bold text-white mb-2">Check your email</h2>
                <p className="text-slate-400 text-sm">
                  We sent a password reset link to <strong className="text-white">{email}</strong>.
                  Check your inbox (and spam folder).
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-display font-bold text-white mb-2">Forgot your password?</h1>
                <p className="text-slate-400 text-sm mb-6">Enter your email address and we&apos;ll send you a reset link.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label" htmlFor="forgot-email">
                      <Mail size={12} className="inline mr-1" /> Email address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="your@email.com"
                    />
                  </div>
                  {error && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-3 rounded-xl">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send Reset Link"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
