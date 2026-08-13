// Supabase Edge Function — invite-member
// Uses auth.admin.inviteUserByEmail — proper invite, bypasses OTP rate limits

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://dynamicrsa.github.io/madrid-cricket-club";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { email, name, memberId } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "email required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const redirectTo = `${SITE_URL}/auth/callback`;

    // Try admin invite first (best for new users)
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { full_name: name || email.split("@")[0], member_id: memberId || null },
    });

    if (error) {
      // User exists — send them a magic link instead
      if (error.message?.includes("already") || error.message?.includes("registered")) {
        const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
          type: "magiclink", email, options: { redirectTo },
        });
        if (linkErr) return new Response(JSON.stringify({ error: linkErr.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ success: true, type: "magic_link" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, type: "invite", user_id: data.user?.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
