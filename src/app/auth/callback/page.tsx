// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign in…");

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      try {
        // ── 1. Determine auth flow from URL ──────────────────────────────
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams   = new URLSearchParams(window.location.hash.slice(1));

        const code        = searchParams.get("code");           // PKCE flow
        const accessToken = hashParams.get("access_token");     // Implicit / hash flow
        const errorDesc   = searchParams.get("error_description") || searchParams.get("error");

        if (errorDesc) {
          router.replace(`/auth/signin?error=${encodeURIComponent(errorDesc)}`);
          return;
        }

        // ── 2. Exchange token ────────────────────────────────────────────
        if (code) {
          // PKCE flow — must exchange code for session
          setStatus("Verifying your link…");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            router.replace(`/auth/signin?error=${encodeURIComponent(error.message)}`);
            return;
          }
        } else if (accessToken) {
          // Hash / implicit flow — SDK auto-processes on load, just wait
          setStatus("Processing session…");
          await new Promise((r) => setTimeout(r, 600));
        } else {
          // No obvious auth params — give SDK time to detect session from cookies/hash
          setStatus("Loading session…");
          await new Promise((r) => setTimeout(r, 1000));
        }

        // ── 3. Get the resolved session ──────────────────────────────────
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          // One more retry after a brief wait (handles edge race conditions)
          await new Promise((r) => setTimeout(r, 1200));
          const { data: { session: s2 } } = await supabase.auth.getSession();
          if (!s2?.user) {
            router.replace("/auth/signin?error=Authentication+failed");
            return;
          }
        }

        const finalSession = (await supabase.auth.getSession()).data.session;
        const user = finalSession?.user;
        if (!user) {
          router.replace("/auth/signin?error=Authentication+failed");
          return;
        }

        setStatus("Setting up your profile…");

        // ── 4. Auto-link pre-created member record (invited members) ─────
        const { data: existingMember } = await supabase
          .from("members")
          .select("id, user_id, status")
          .eq("email", user.email)
          .is("user_id", null)
          .maybeSingle();

        if (existingMember) {
          // Invited member — link auth user and move to pending approval
          await supabase
            .from("members")
            .update({
              user_id: user.id,
              status: "pending_approval",
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingMember.id);

          // Ensure notification prefs exist
          await supabase
            .from("notification_preferences")
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
            // Completely new — e.g. Google sign-in, no invite
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
              await supabase
                .from("notification_preferences")
                .upsert({ member_id: newMember.id })
                .onConflict("member_id")
                .ignore();
            }
          }
        }

        // ── 5. Redirect to dashboard ─────────────────────────────────────
        router.replace("/dashboard");
      } catch (err) {
        console.error("Auth callback error:", err);
        router.replace("/auth/signin?error=Unexpected+error+during+sign+in");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "#0d1420" }}
    >
      <Loader2 size={32} className="animate-spin text-brand-400" />
      <p className="text-slate-400 text-sm">{status}</p>
    </div>
  );
}
