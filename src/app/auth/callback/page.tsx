// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign in…");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      try {
        // ── 1. Parse URL ─────────────────────────────────────────────────
        const searchParams = new URLSearchParams(window.location.search);
        const hash         = window.location.hash.slice(1);
        const hashParams   = new URLSearchParams(hash);

        const code         = searchParams.get("code");            // PKCE
        const accessToken  = hashParams.get("access_token");      // implicit / magic link
        const refreshToken = hashParams.get("refresh_token") || "";
        const errorMsg     = searchParams.get("error_description")
                           || searchParams.get("error")
                           || hashParams.get("error_description")
                           || hashParams.get("error");

        if (errorMsg) {
          setError(decodeURIComponent(errorMsg));
          setTimeout(() => router.replace(`/auth/signin?error=${encodeURIComponent(errorMsg)}`), 2000);
          return;
        }

        // ── 2. Exchange / set session ─────────────────────────────────────
        if (code) {
          // PKCE flow: exchange the one-time code for a session
          setStatus("Verifying your link…");
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchErr) {
            // PKCE code-verifier mismatch (admin-generated link opened in different browser)
            // Fall through — try to get any existing session
            console.warn("exchangeCodeForSession error:", exchErr.message);
          }
        } else if (accessToken) {
          // Hash / implicit flow — explicitly set session from hash tokens
          setStatus("Verifying your link…");
          const { error: sessErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessErr) {
            console.warn("setSession error:", sessErr.message);
          }
        } else {
          // No obvious auth params — wait briefly for SDK to auto-process
          setStatus("Loading session…");
          await new Promise((r) => setTimeout(r, 1500));
        }

        // ── 3. Wait for session (with retry + timeout) ───────────────────
        setStatus("Setting up your account…");

        let session = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          const { data } = await supabase.auth.getSession();
          session = data?.session;
          if (session?.user) break;
          await new Promise((r) => setTimeout(r, 800));
        }

        if (!session?.user) {
          setError("Authentication failed — the link may have expired. Please request a new one.");
          setTimeout(() => router.replace("/auth/signin?error=Link+expired+or+invalid.+Please+request+a+new+invite."), 3000);
          return;
        }

        const user = session.user;

        // ── 4. Link member record ────────────────────────────────────────
        setStatus("Linking your profile…");

        // Check for pre-created member record (invited via admin)
        const { data: existingMember } = await supabase
          .from("members")
          .select("id, user_id, status")
          .eq("email", user.email)
          .is("user_id", null)
          .maybeSingle();

        if (existingMember) {
          await supabase.from("members").update({
            user_id: user.id,
            status: "pending_approval",
            updated_at: new Date().toISOString(),
          }).eq("id", existingMember.id);

          await supabase.from("notification_preferences")
            .upsert({ member_id: existingMember.id })
            .onConflict("member_id")
            .ignore();
        } else {
          // Check if already linked (returning sign-in)
          const { data: linkedMember } = await supabase
            .from("members")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!linkedMember) {
            // New sign-in via Google or other — create member record
            const { data: newMember } = await supabase
              .from("members")
              .insert({
                user_id: user.id,
                full_legal_name:
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.email?.split("@")[0],
                email: user.email,
                status: "pending_approval",
                roles: ["member"],
                registration_status: "applied",
              })
              .select("id")
              .single();

            if (newMember) {
              await supabase.from("notification_preferences")
                .upsert({ member_id: newMember.id })
                .onConflict("member_id")
                .ignore();
            }
          }
        }

        // ── 5. Redirect ──────────────────────────────────────────────────
        setStatus("Redirecting…");
        router.replace("/dashboard");

      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError("Something went wrong. Redirecting…");
        setTimeout(() => router.replace("/auth/signin?error=Unexpected+error"), 2500);
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: "linear-gradient(135deg, #0d1420 0%, #0a1628 100%)" }}
    >
      {/* Logo */}
      <div className="mb-2 opacity-60">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
          <span className="text-2xl">🏏</span>
        </div>
      </div>

      {error ? (
        <div className="text-center space-y-2 max-w-xs px-4">
          <p className="text-red-400 text-sm font-medium">⚠ {error}</p>
          <p className="text-slate-500 text-xs">Redirecting to sign in…</p>
        </div>
      ) : (
        <>
          <Loader2 size={28} className="animate-spin text-brand-400" />
          <div className="text-center space-y-1">
            <p className="text-white text-sm font-medium">{status}</p>
            <p className="text-slate-500 text-xs">Madrid Cricket Club</p>
          </div>
        </>
      )}
    </div>
  );
}
