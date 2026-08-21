// Supabase Edge Function — notify-member-approved
// Called automatically when an admin approves a membership application.
//
// Flow:
// 1. Generate a Supabase invite/magic link (does NOT trigger Supabase's own email)
// 2. Send a branded approval + activation email via Resend
// 3. The email contains the "Set up your account" button with the magic link

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL    = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY  = Deno.env.get("RESEND_API_KEY") ?? "";
const ADMIN_EMAIL     = Deno.env.get("ADMIN_EMAIL") ?? "svenprinsloo@gmail.com";
const FROM_EMAIL      = "Madrid Cricket Club <onboarding@resend.dev>";
const SITE_URL        = "https://madridcricketclub.com";

// Bank details for membership fee — set via: supabase secrets set BANK_DETAILS="..."
const BANK_DETAILS = Deno.env.get("BANK_DETAILS") ?? "Please contact the club secretary for bank transfer details.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: any;
  try { body = await req.json(); } catch {
    return new Response("Bad JSON", { status: 400, headers: corsHeaders });
  }

  const { email, name, member_id, membership_category } = body;

  if (!email || !name) {
    return new Response(JSON.stringify({ error: "email and name are required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const redirectTo = `${SITE_URL}/auth/callback`;

  // ── Step 1: Generate a sign-in link for the member ─────────────────────────
  // We check if they already have an auth account.
  // generateLink does NOT send Supabase's default email — we send our own below.
  let actionLink = "";
  try {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingUser = users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      // User already has an auth account — generate a magic link
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });
      if (!error) actionLink = data.properties?.action_link ?? "";
    } else {
      // New user — generate an invite link (creates the auth account)
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "invite",
        email,
        options: {
          redirectTo,
          data: { full_name: name, member_id: member_id ?? null, invited_by: "admin" },
        },
      });
      if (!error) actionLink = data.properties?.action_link ?? "";
    }
  } catch (err) {
    console.error("Failed to generate auth link:", err);
    // Continue — we still send the email, just without the magic link button
  }

  // ── Step 2: Determine fee based on membership category ─────────────────────
  const isJunior = membership_category === "junior";
  const fullFee  = isJunior ? "€60" : "€100";
  const halfFee  = isJunior ? "€35" : "€60";
  const category = isJunior ? "Junior" : "Senior";

  // ── Step 3: Send branded approval email via Resend ─────────────────────────
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping approval email");
    return new Response(JSON.stringify({ success: true, email_sent: false, action_link: actionLink }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ctaButton = actionLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr><td align="center">
          <a href="${actionLink}"
             style="display:inline-block;background:#f0b429;color:#0d1420;font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
            Set Up Your Account &amp; Sign In →
          </a>
        </td></tr>
       </table>
       <p style="text-align:center;color:#64748b;font-size:12px;margin-top:4px;">
         This link expires in 24 hours. If it expires, visit
         <a href="${SITE_URL}/auth/signin" style="color:#64748b;">${SITE_URL}/auth/signin</a>
         to request a new one.
       </p>`
    : `<p style="color:#94a3b8;">Visit <a href="${SITE_URL}/auth/signin" style="color:#f0b429;">${SITE_URL}/auth/signin</a> to set up your account.</p>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Madrid Cricket Club</title>
</head>
<body style="margin:0;padding:0;background:#0d1420;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1420;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#131e2e;border-radius:12px;overflow:hidden;border:1px solid #1e3050;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a3a5c,#0f2540);padding:36px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#f0b429;font-weight:700;">Madrid Cricket Club</p>
            <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;">You're in! 🏏</h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Your membership application has been approved</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;color:#e2e8f0;font-size:16px;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.7;">
              Welcome to Madrid Cricket Club! The committee has reviewed your application and we're
              delighted to confirm that you have been accepted as a <strong style="color:#f1f5f9;">${category} member</strong>.
            </p>

            <!-- CTA button -->
            ${ctaButton}

            <!-- Membership fee section -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1420;border-radius:8px;border:1px solid #1e3050;margin:24px 0;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 12px;color:#f0b429;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">💳 Membership Fee</p>
                <p style="margin:0 0 10px;color:#94a3b8;font-size:14px;line-height:1.6;">
                  To complete your registration, please transfer your membership fee:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;border-bottom:1px solid #1e3050;">
                      <span style="color:#64748b;font-size:12px;">Full Season</span>
                    </td>
                    <td style="padding:6px 0;border-bottom:1px solid #1e3050;text-align:right;">
                      <span style="color:#f1f5f9;font-weight:700;">${fullFee}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;">
                      <span style="color:#64748b;font-size:12px;">Half Season (joining after July)</span>
                    </td>
                    <td style="padding:6px 0;text-align:right;">
                      <span style="color:#f1f5f9;font-weight:700;">${halfFee}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:14px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
                  <strong style="color:#e2e8f0;">Bank transfer details:</strong><br/>
                  ${BANK_DETAILS}
                </p>
                <p style="margin:10px 0 0;color:#64748b;font-size:12px;">
                  Use your full name as the payment reference.
                  Once paid, please upload proof of payment in your member portal.
                </p>
              </td></tr>
            </table>

            <!-- Next steps -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1420;border-radius:8px;border:1px solid #1e3050;margin:0 0 24px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;color:#f0b429;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📋 Next Steps</p>
                ${[
                  "Click the button above to set up your account and access the member portal",
                  "Transfer the membership fee using the bank details above",
                  "Upload your proof of payment in the member portal",
                  "Check the fixtures page for upcoming training sessions and matches",
                  "Join our WhatsApp group — details in the member portal",
                ].map((step, i) => `
                  <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
                    <span style="background:#1a3a5c;color:#f0b429;font-weight:700;font-size:11px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${i+1}</span>
                    <span style="color:#94a3b8;font-size:14px;line-height:1.5;">${step}</span>
                  </div>`).join("")}
              </td></tr>
            </table>

            <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
              Any questions? Reply to this email or contact us at
              <a href="mailto:${ADMIN_EMAIL}" style="color:#f0b429;">${ADMIN_EMAIL}</a>.
              We look forward to seeing you at the ground!
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1e3050;text-align:center;">
            <p style="margin:0;color:#475569;font-size:12px;">
              Madrid Cricket Club · <a href="${SITE_URL}" style="color:#64748b;">madridcricketclub.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: `Welcome to Madrid Cricket Club — you've been approved! 🏏`,
      html,
    }),
  });

  if (!emailRes.ok) console.error("Resend error:", await emailRes.text());

  return new Response(
    JSON.stringify({ success: true, email_sent: emailRes.ok, action_link: actionLink }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
