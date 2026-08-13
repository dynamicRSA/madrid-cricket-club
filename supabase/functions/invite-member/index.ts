// Supabase Edge Function — invite-member
// Uses auth.admin.inviteUserByEmail. If user already exists, falls back to generateLink (magic link).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://dynamicrsa.github.io/madrid-cricket-club";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, memberId } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const redirectTo = `${SITE_URL}/auth/callback`;

    // Try admin invite first (best for brand-new users)
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        full_name: name || email.split("@")[0],
        member_id: memberId || null,
        invited_by: "admin",
      },
    });

    if (!error) {
      // Success
      return new Response(
        JSON.stringify({ success: true, type: "invite", user_id: data.user?.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // If invite failed for ANY reason (user exists, DB conflict, etc.)
    // fall back to generating a magic link — works for both new & existing users
    console.log("inviteUserByEmail failed:", error.message, "— trying magic link fallback");

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (linkError) {
      // Both approaches failed — last resort: try OTP via admin
      console.log("generateLink also failed:", linkError.message);
      return new Response(
        JSON.stringify({ error: `Invite failed: ${error.message}. Magic link also failed: ${linkError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Magic link generated — email is sent automatically by Supabase when using generateLink with type magiclink
    return new Response(
      JSON.stringify({ success: true, type: "magic_link", action_link: linkData.properties?.action_link }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
