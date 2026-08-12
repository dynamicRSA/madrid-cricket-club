"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // The Supabase client automatically picks up the auth code/tokens
    // from the URL fragment when initialized. We just wait for it to
    // exchange the code, then redirect to the dashboard.
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      } else {
        // Give Supabase a moment to process the URL fragment
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            router.replace(s ? "/dashboard" : "/auth/signin?error=Authentication+failed");
          });
        }, 1000);
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#0d1420" }}>
      <Loader2 size={32} className="animate-spin text-brand-400" />
      <p className="text-slate-400 text-sm">Completing sign in…</p>
    </div>
  );
}
