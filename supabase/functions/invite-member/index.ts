// Supabase Edge Function — invite-member
// Strategy: always use inviteUserByEmail (official Supabase invite flow).
// If user already exists in auth.users, delete them first then re-invite.
// This guarantees a fresh, valid invite token every time.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://madridcricketclub.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
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

    // ── Step 1: If user already exists in auth, delete them first ───────
    // This ensures inviteUserByEmail always gets a clean slate.
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingAuthUser = users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (existingAuthUser) {
      console.log(`Deleting existing auth user ${existingAuthUser.id} for ${email} to enable clean re-invite`);
      await supabase.auth.admin.deleteUser(existingAuthUser.id);
      // Small delay for the deletion to propagate
      await new Promise((r) => setTimeout(r, 500));
    }

    // Also reset user_id on the member record so callback can re-link
    if (memberId || existingAuthUser) {
      const query = memberId
        ? supabase.from("members").update({ user_id: null, updated_at: new Date().toISOString() }).eq("id", memberId)
        : supabase.from("members").update({ user_id: null, updated_at: new Date().toISOString() }).eq("email", email);
      await query;
    }

    // ── Step 2: Send official invite via inviteUserByEmail ───────────────
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        full_name: name || email.split("@")[0],
        member_id: memberId || null,
        invited_by: "admin",
      },
    });

    if (!error) {
      return new Response(
        JSON.stringify({ success: true, type: "invite", user_id: data.user?.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Step 3: Fallback — generate magic link (returns action_link) ─────
    // Only reached if inviteUserByEmail fails for unexpected reason.
    console.log("inviteUserByEmail failed:", error.message, "— trying generateLink fallback");

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (linkError) {
      return new Response(
        JSON.stringify({ error: `Invite failed: ${error.message}. Magic link also failed: ${linkError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
