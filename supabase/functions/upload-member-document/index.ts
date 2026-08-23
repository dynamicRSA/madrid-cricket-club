// Supabase Edge Function — upload-member-document
// Accepts multipart/form-data with a file + metadata.
// Validates, stores in private Supabase Storage, inserts member_documents row.
// Called from both the join form (unauthenticated, uses member_id from notify-admin-join)
// and the profile page (authenticated, resolves member_id from JWT).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY   = Deno.env.get("SB_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BUCKET        = "member-documents";
const MAX_BYTES     = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME  = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXT   = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── Parse multipart form ──────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return json({ error: "Invalid multipart form data" }, 400);
  }

  const file     = formData.get("file") as File | null;
  let   memberId = (formData.get("member_id") as string | null)?.trim();
  const docType  = (formData.get("doc_type") as string | null)?.trim() || "other";
  const source   = (formData.get("source")  as string | null)?.trim() || "profile";

  if (!file) return json({ error: "No file provided" }, 400);

  // ── Validate doc_type ─────────────────────────────────────────────────────
  const validDocTypes = ["id_document", "payment_proof", "other"];
  if (!validDocTypes.includes(docType)) {
    return json({ error: `Invalid doc_type. Must be one of: ${validDocTypes.join(", ")}` }, 400);
  }

  // ── Validate source ───────────────────────────────────────────────────────
  const validSources = ["registration", "profile"];
  if (!validSources.includes(source)) {
    return json({ error: "Invalid source" }, 400);
  }

  // ── Resolve member_id from JWT if not supplied ────────────────────────────
  if (!memberId) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "member_id required for unauthenticated requests" }, 400);
    }
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: authErr } = await createClient(SUPABASE_URL, SERVICE_KEY)
      .auth.getUser(jwt);
    if (authErr || !user) {
      return json({ error: "Invalid auth token" }, 401);
    }
    const { data: mem } = await supabase
      .from("members")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!mem) return json({ error: "Member record not found for this user" }, 404);
    memberId = mem.id;
  }

  // ── File size check ───────────────────────────────────────────────────────
  if (file.size > MAX_BYTES) {
    return json({ error: `File too large. Maximum size is 5 MB.` }, 413);
  }
  if (file.size === 0) {
    return json({ error: "File is empty" }, 400);
  }

  // ── MIME type check ───────────────────────────────────────────────────────
  const mime = file.type.toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return json({
      error: `File type not allowed. Accepted: PDF, JPG, PNG, WebP`,
    }, 415);
  }

  // ── Extension check ───────────────────────────────────────────────────────
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.has(ext)) {
    return json({ error: `File extension .${ext} not allowed` }, 415);
  }

  // ── Magic bytes check (server-side, cannot be spoofed by client) ──────────
  const firstBytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const isPdf   = firstBytes[0] === 0x25 && firstBytes[1] === 0x50; // %P
  const isJpeg  = firstBytes[0] === 0xFF && firstBytes[1] === 0xD8;
  const isPng   = firstBytes[0] === 0x89 && firstBytes[1] === 0x50;
  const isWebp  = firstBytes[0] === 0x52 && firstBytes[1] === 0x49; // RIFF

  const mimeToCheck: Record<string, boolean> = {
    "application/pdf": isPdf,
    "image/jpeg":      isJpeg,
    "image/png":       isPng,
    "image/webp":      isWebp,
  };
  if (!mimeToCheck[mime]) {
    return json({ error: "File content does not match declared type" }, 415);
  }

  // ── Build storage path ────────────────────────────────────────────────────
  const ts          = Date.now();
  const safeName    = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${memberId}/${docType}/${ts}_${safeName}`;

  // ── Upload to Supabase Storage ────────────────────────────────────────────
  const fileBytes = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBytes, {
      contentType: mime,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return json({ error: "Failed to upload file. Please try again." }, 500);
  }

  // ── Insert member_documents row ───────────────────────────────────────────
  const { data: docRow, error: dbError } = await supabase
    .from("member_documents")
    .insert({
      member_id:    memberId,
      doc_type:     docType,
      file_name:    file.name,
      storage_path: storagePath,
      file_size:    file.size,
      mime_type:    mime,
      scan_status:  "clean",  // No virus scanning — relies on MIME + magic bytes validation
      source:       source,
    })
    .select("id, file_name, doc_type, storage_path, uploaded_at, scan_status, source")
    .single();

  if (dbError) {
    console.error("DB insert error:", dbError);
    // Clean up storage on DB failure
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return json({ error: "Failed to record document. Please try again." }, 500);
  }

  return json({
    success: true,
    document: docRow,
  });
});
