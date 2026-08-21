// Supabase Edge Function — notify-admin-join
// Called from the /join page after a successful member insert.
// Sends a branded email to the admin with the applicant's details.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const ADMIN_EMAIL    = Deno.env.get("ADMIN_EMAIL") ?? "svenprinsloo@gmail.com";
const FROM_EMAIL     = "Madrid Cricket Club <onboarding@resend.dev>";
const SITE_URL       = "https://madridcricketclub.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping admin notification");
    return new Response(JSON.stringify({ skipped: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400, headers: corsHeaders });
  }

  const { name, email, phone, age_group, nationality } = body;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Membership Application</title>
</head>
<body style="margin:0;padding:0;background:#0d1420;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1420;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#131e2e;border-radius:12px;overflow:hidden;border:1px solid #1e3050;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a3a5c,#0f2540);padding:32px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#f0b429;font-weight:700;">Madrid Cricket Club</p>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">New Membership Application</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                A new membership application has been submitted. Review the details below and take action in the admin panel.
              </p>

              <!-- Applicant card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1420;border-radius:8px;border:1px solid #1e3050;margin-bottom:28px;">
                <tr><td style="padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #1e3050;">
                        <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Name</span><br/>
                        <span style="color:#f1f5f9;font-size:15px;font-weight:600;">${name ?? "—"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #1e3050;">
                        <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</span><br/>
                        <span style="color:#f1f5f9;font-size:15px;">${email ?? "—"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #1e3050;">
                        <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Phone</span><br/>
                        <span style="color:#f1f5f9;font-size:15px;">${phone ?? "—"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;border-bottom:1px solid #1e3050;">
                        <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Age Group</span><br/>
                        <span style="color:#f1f5f9;font-size:15px;text-transform:capitalize;">${age_group ?? "—"}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;">
                        <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Nationality</span><br/>
                        <span style="color:#f1f5f9;font-size:15px;">${nationality ?? "—"}</span>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/admin"
                       style="display:inline-block;background:#f0b429;color:#0d1420;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                      Review in Admin Panel →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e3050;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">
                You're receiving this because you're an admin of Madrid Cricket Club.<br/>
                <a href="${SITE_URL}" style="color:#64748b;">madridcricketclub.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `New membership application — ${name ?? email}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return new Response(JSON.stringify({ error: err }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ sent: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
