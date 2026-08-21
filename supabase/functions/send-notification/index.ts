// Supabase Edge Function — send-notification
// Triggered by database webhook on notifications INSERT
// Sends branded email via Resend when member has email_enabled = true

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL   = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FROM_EMAIL     = "Madrid Cricket Club <onboarding@resend.dev>";
const SITE_URL       = "https://madridcricketclub.com";

const TYPE_SUBJECT: Record<string, string> = {
  fixture_created:       "New fixture added — Madrid Cricket Club",
  selected_for_team:     "You've been selected for the squad!",
  selection_published:   "Team sheet published — Madrid Cricket Club",
  availability_reminder: "Availability deadline approaching",
  match_reminder:        "Match reminder — tomorrow",
  status_change:         "Your membership status has changed",
  charge_raised:         "New charge on your account",
  jersey_assigned:       "Your jersey number has been assigned",
};

const PREF_COLUMN: Record<string, string> = {
  fixture_created:       "fixture_created",
  selected_for_team:     "selected_for_team",
  selection_published:   "selection_published",
  availability_reminder: "availability_reminder",
  match_reminder:        "match_reminder",
  status_change:         "status_change",
  charge_raised:         "charge_raised",
  jersey_assigned:       "jersey_assigned",
};

serve(async (req) => {
  if (!RESEND_API_KEY) {
    return new Response("RESEND_API_KEY not configured", { status: 200 });
  }

  let body: any;
  try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }

  const notification = body?.record ?? body;
  if (!notification?.member_id) return new Response("No member_id", { status: 400 });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Get member email + preferences
  const { data: member } = await supabase
    .from("members")
    .select("id, email, full_legal_name, preferred_name")
    .eq("id", notification.member_id)
    .single();

  if (!member?.email) return new Response("Member not found", { status: 200 });

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("member_id", notification.member_id)
    .single();

  // Check email enabled + specific pref
  const emailEnabled = prefs?.email_enabled ?? true;
  const prefColumn   = PREF_COLUMN[notification.type];
  const typeEnabled  = prefColumn ? (prefs?.[prefColumn] ?? true) : true;

  if (!emailEnabled || !typeEnabled) {
    return new Response("Email suppressed by preferences", { status: 200 });
  }

  const displayName = member.preferred_name || member.full_legal_name || member.email.split("@")[0];
  const subject     = TYPE_SUBJECT[notification.type] ?? "Notification from Madrid Cricket Club";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d1420;font-family:Inter,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1420;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#131e2e;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:560px;width:100%">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0f2d1a,#1a4a2e);padding:32px 40px;text-align:center;">
          <p style="margin:0 0 8px;color:#4ade80;font-size:28px;font-weight:700;letter-spacing:-0.5px">MCC</p>
          <p style="margin:0;color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:2px;text-transform:uppercase">Madrid Cricket Club</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 6px;color:rgba(255,255,255,0.5);font-size:13px">Hi ${displayName},</p>
          <h1 style="margin:0 0 16px;color:#fff;font-size:22px;font-weight:700;line-height:1.3">${notification.title}</h1>
          ${notification.body ? `<p style="margin:0 0 28px;color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6">${notification.body}</p>` : ""}
          <a href="${SITE_URL}/dashboard" style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px">View in dashboard →</a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.3);font-size:11px">Madrid Cricket Club — Est. 2001 · Madrid, Spain</p>
          <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px">
            <a href="${SITE_URL}/dashboard" style="color:rgba(255,255,255,0.3)">Manage notification preferences</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM_EMAIL, to: member.email, subject, html }),
  });

  const result = await res.json();
  return new Response(JSON.stringify({ ok: res.ok, result }), {
    status: res.ok ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
});
