"use client";

/**
 * DocumentUploader — Shared component used on both the join form and profile page.
 *
 * Upload flow:
 *   1. User selects file (or drag-drops)
 *   2. Client-side validation (type, size)
 *   3. Sends multipart POST to the Edge Function `upload-member-document`
 *   4. On success, shows confirmation + calls onUploaded(doc)
 *
 * For the join form (unauthenticated), pass memberId (returned from notify-admin-join).
 * For the profile page (authenticated), memberId is optional — Edge Function resolves it from JWT.
 */

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";

export type DocType = "id_document" | "payment_proof" | "other";
export type DocSource = "registration" | "profile";

export interface UploadedDocument {
  id: string;
  file_name: string;
  doc_type: string;
  storage_path: string;
  uploaded_at: string;
  scan_status: string;
  source: string;
}

interface Props {
  memberId?: string | null;
  docType?: DocType;
  source: DocSource;
  label?: string;
  required?: boolean;
  supabaseUrl?: string;
  anonKey?: string;
  /** Called when a document has been successfully uploaded */
  onUploaded?: (doc: UploadedDocument) => void;
}

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_MB  = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const DOC_TYPE_LABELS: Record<DocType, string> = {
  id_document:    "ID Document",
  payment_proof:  "Payment Proof",
  other:          "Other Document",
};

const MIME_ICONS: Record<string, React.ReactNode> = {
  "application/pdf": <FileText size={18} className="text-red-400" />,
  "image/jpeg":      <ImageIcon size={18} className="text-blue-400" />,
  "image/png":       <ImageIcon size={18} className="text-blue-400" />,
  "image/webp":      <ImageIcon size={18} className="text-blue-400" />,
};

function fmtBytes(bytes: number) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DocumentUploader({
  memberId,
  docType = "other",
  source,
  label,
  required = false,
  supabaseUrl,
  anonKey,
  onUploaded,
}: Props) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [file, setFile]           = useState<File | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded]   = useState<UploadedDocument | null>(null);
  const [dragging, setDragging]   = useState(false);

  const validate = useCallback((f: File): string | null => {
    const allowed = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(f.type)) return "Only PDF, JPG, PNG, or WebP files allowed.";
    if (f.size > MAX_BYTES)   return `File must be smaller than ${MAX_MB} MB.`;
    if (f.size === 0)         return "File is empty.";
    return null;
  }, []);

  function handleFileChange(f: File) {
    const err = validate(f);
    if (err) { setError(err); setFile(null); return; }
    setError(null);
    setFile(f);
    setUploaded(null);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFileChange(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange(f);
  }

  function reset() {
    setFile(null);
    setError(null);
    setUploaded(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setError(null);

    const url = supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = anonKey    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const fd = new FormData();
    fd.append("file",      file);
    fd.append("doc_type",  docType);
    fd.append("source",    source);
    if (memberId) fd.append("member_id", memberId);

    try {
      // Include auth header so Edge Function can resolve member from JWT if memberId omitted
      const headers: Record<string, string> = {
        "Authorization": `Bearer ${key}`,
      };

      const res = await fetch(`${url}/functions/v1/upload-member-document`, {
        method:  "POST",
        headers,
        body:    fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Upload failed. Please try again.");
      }

      setUploaded(data.document as UploadedDocument);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.(data.document as UploadedDocument);
    } catch (e: any) {
      setError(e?.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const displayLabel = label ?? DOC_TYPE_LABELS[docType];

  // ── Uploaded state ─────────────────────────────────────────────────────────
  if (uploaded) {
    return (
      <div className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/30 rounded-xl px-4 py-3">
        <CheckCircle size={18} className="text-brand-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-brand-300 text-sm font-medium truncate">{uploaded.file_name}</p>
          <p className="text-slate-500 text-xs">{displayLabel} · Uploaded successfully</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 ml-2"
          title="Upload different file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="label">
        {displayLabel}{required && <span className="text-red-400 ml-1">*</span>}
      </p>

      {/* Drop zone */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            dragging
              ? "border-brand-400 bg-brand-500/10"
              : "border-white/[0.10] bg-white/[0.02] hover:border-brand-500/50 hover:bg-brand-500/5"
          }`}
        >
          <Upload size={22} className="mx-auto mb-2 text-slate-400" />
          <p className="text-slate-300 text-sm">
            <span className="text-brand-400 font-medium">Click to browse</span> or drag &amp; drop
          </p>
          <p className="text-slate-600 text-xs mt-1">PDF, JPG, PNG, WebP — max {MAX_MB} MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={onInputChange}
            className="sr-only"
          />
        </div>
      ) : (
        /* File selected — show preview + upload button */
        <div className="flex items-center gap-3 bg-slate-800/60 border border-white/[0.08] rounded-xl px-4 py-3">
          <div className="shrink-0">
            {MIME_ICONS[file.type] ?? <FileText size={18} className="text-slate-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{file.name}</p>
            <p className="text-slate-500 text-xs">{fmtBytes(file.size)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={upload}
              disabled={uploading}
              className="btn-primary btn-sm text-xs"
            >
              {uploading
                ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                : "Upload"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={uploading}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Remove"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
