// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying your link…");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      try {
        // ── 1. Parse URL ─────────────────────────────────────────────────
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams   = new URLSearchParams(window.location.hash.slice(1));

        const errorMsg = searchParams.get("error_description")
                       || searchParams.get("error")
                       || hashParams.get("error_description")
                       || hashParams.get("error");

        if (errorMsg) {
          const msg = decodeURIComponent(errorMsg);
          setError(msg);
          setTimeout(() => router.replace(`/auth/signin?error=${encodeURIComponent(msg)}`), 2500);
          return;
        }

        // ── 2. Wait for SDK to process the session from URL ───────────────
        // With flowType:"implicit" + detectSessionInUrl:true, the SDK
        // auto-detects #access_token or ?code and sets up the session.
        // We just poll until it's ready (usually < 500ms).
        setStatus("Signing you in…");

        let session = null;
        for (let attempt = 0; attempt < 8; attempt++) {
          await new Promise((r) => setTimeout(r, 500));
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            session = data.session;
            break;
          }
        }

        if (!session?.user) {
          const msg = "Link expired or already used. Please request a new invite link.";
          setError(msg);
          setTimeout(() => router.replace("/auth/signin?error=Link+expired+or+already+used"), 2500);
          return;
        }

        const user = session.user;
        setStatus("Setting up your profile…");

        // ── 3. Link member record ────────────────────────────────────────
        // Check for pre-created member record (admin-invited member)
        const { data: existingMember } = await supabase
          .from("members")
          .select("id, user_id, status")
          .eq("email", user.email)
          .is("user_id", null)
          .maybeSingle();

        if (existingMember) {
          // Link auth user to the pre-created member record
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
          // Already linked (returning sign-in) or new Google user
          const { data: linkedMember } = await supabase
            .from("members")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!linkedMember) {
            // New sign-in (Google OAuth, etc.) — create member record
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

        // ── 4. Done ──────────────────────────────────────────────────────
        setStatus("Welcome! Redirecting…");
        router.replace("/dashboard");

      } catch (err: any) {
        console.error("Auth callback error:", err);
        const msg = "Something went wrong during sign in.";
        setError(msg);
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
      {/* Cricket club logo mark */}
      <div className="mb-2 opacity-50">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-3xl">🏏</span>
        </div>
      </div>

      {error ? (
        <div className="text-center space-y-3 max-w-xs px-6">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <span className="text-lg">⚠</span>
          </div>
          <p className="text-white text-sm font-medium">{error}</p>
          <p className="text-slate-500 text-xs">Redirecting to sign in…</p>
        </div>
      ) : (
        <>
          <Loader2 size={28} className="animate-spin text-brand-400" />
          <div className="text-center space-y-1.5">
            <p className="text-white text-sm font-semibold">{status}</p>
            <p className="text-slate-500 text-xs">Madrid Cricket Club</p>
          </div>
        </>
      )}
    </div>
  );
}
