// @ts-nocheck
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      // Give Supabase a moment to process hash/token
      await new Promise((r) => setTimeout(r, 800));

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        // Retry once more
        await new Promise((r) => setTimeout(r, 1200));
        const { data: { session: s2 } } = await supabase.auth.getSession();
        if (!s2?.user) {
          router.replace("/auth/signin?error=Authentication+failed");
          return;
        }
      }

      const user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) { router.replace("/auth/signin?error=Authentication+failed"); return; }

      // Auto-link: check if there's a pre-created member record with this email but no user_id
      const { data: existingMember } = await supabase
        .from("members")
        .select("id, user_id, status")
        .eq("email", user.email)
        .is("user_id", null)
        .single();

      if (existingMember) {
        // Link the auth user to the pre-created member record
        await supabase
          .from("members")
          .update({
            user_id: user.id,
            status: "pending_approval",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMember.id);

        // Insert default notification preferences
        await supabase
          .from("notification_preferences")
          .upsert({ member_id: existingMember.id })
          .onConflict("member_id")
          .ignore();
      } else {
        // Check if member record already exists with user_id (normal sign-in)
        const { data: linkedMember } = await supabase
          .from("members")
          .select("id")
          .eq("user_id", user.id)
          .single();

        // If no record at all (new Google sign-in), create one
        if (!linkedMember) {
          const { data: newMember } = await supabase
            .from("members")
            .insert({
              user_id: user.id,
              full_legal_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0],
              email: user.email,
              status: "pending_approval",
              roles: ["member"],
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

      router.replace("/dashboard");
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0d1420" }}>
      <Loader2 size={32} className="animate-spin text-brand-400" />
      <p className="text-slate-400 text-sm">Completing sign in…</p>
    </div>
  );
}
