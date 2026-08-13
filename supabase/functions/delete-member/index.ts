// Supabase Edge Function — delete-member / admin-user-actions
// Handles admin operations requiring service role: delete user, set password

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { userId, email, action, password } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // ── Set temporary password ──────────────────────────────────────────
    if (action === "set_password") {
      if (!password) {
        return new Response(JSON.stringify({ error: "password required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let targetUserId = userId;

      // If no userId given, find/create auth user by email
      if (!targetUserId && email) {
        // Try to find existing auth user by email
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existing = users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

        if (existing) {
          targetUserId = existing.id;
        } else {
          // Create a new auth user with email + password directly (no invite flow)
          const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          if (createErr) {
            return new Response(JSON.stringify({ error: createErr.message }), {
              status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          // Update the member record to link this new auth user
          await supabase.from("members")
            .update({ user_id: newUser.user.id, updated_at: new Date().toISOString() })
            .eq("email", email);

          return new Response(JSON.stringify({ success: true, created: true, userId: newUser.user.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (!targetUserId) {
        return new Response(JSON.stringify({ error: "No user ID and no email provided" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Set password + confirm email on existing user
      const { error } = await supabase.auth.admin.updateUserById(targetUserId, {
        password,
        email_confirm: true,
      });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update member record to ensure user_id is linked
      if (email) {
        await supabase.from("members")
          .update({ user_id: targetUserId, updated_at: new Date().toISOString() })
          .eq("email", email)
          .is("user_id", null);  // only if not already linked
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Delete user ─────────────────────────────────────────────────────
    if (!userId) {
      return new Response(JSON.stringify({ success: true, message: "no_auth_user" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
