"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { User, Mail, Phone, MessageSquare, CheckCircle, Loader2, ChevronDown, Lock, FileText } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DocumentUploader, { type UploadedDocument } from "@/components/DocumentUploader";

// ── Cloudflare Turnstile ──────────────────────────────────────────────────────
// Replace with your real site key from https://dash.cloudflare.com/?to=/:account/turnstile
// Test key (always passes, no challenge shown): 1x00000000000000000000AA
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

// ── How did you hear about us — options ──────────────────────────────────────
const HEAR_OPTIONS = [
  { value: "",              label: "Select an option..." },
  { value: "instagram",     label: "Instagram" },
  { value: "facebook",      label: "Facebook" },
  { value: "google",        label: "Google Search" },
  { value: "friend",        label: "Friend / Word of mouth" },
  { value: "cricket_espana",label: "Cricket España" },
  { value: "ecn",           label: "European Cricket Network (ECN)" },
  { value: "local_event",   label: "Local event / saw us playing" },
  { value: "other",         label: "Other" },
];

// Phone: allow digits, +, spaces, dashes, parens only
const PHONE_REGEX = /^[+\d\s\-().]{6,20}$/

export default function JoinPage() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [registrationsOpen, setRegistrationsOpen] = useState<boolean | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  // Step 2 — document upload after successful form submission
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [docsComplete, setDocsComplete] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    age_group: "senior",
    experience: "",
    hear_about: "",
    hear_about_other: "",  // free text when "other" is chosen
    message: "",
    honeypot: "",           // bot trap — must stay empty
  });

  // Load Cloudflare Turnstile script once
  useEffect(() => {
    if (document.querySelector("script[data-turnstile]")) { setTurnstileReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.dataset.turnstile = "1";
    s.onload = () => setTurnstileReady(true);
    document.head.appendChild(s);
  }, []);

  // Check if registrations are open
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "registrations_open")
      .single()
      .then(({ data }: { data: any }) => {
        setRegistrationsOpen(data ? data.value === true : true);
      })
      .catch(() => setRegistrationsOpen(true));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip letters — only allow digits, +, spaces, dashes, parens
    const cleaned = e.target.value.replace(/[^+\d\s\-().]/g, "");
    setForm((f) => ({ ...f, mobile: cleaned }));
    if (cleaned && !PHONE_REGEX.test(cleaned)) {
      setPhoneError("Please enter a valid phone number (digits, +, spaces, dashes only)");
    } else {
      setPhoneError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check — bots fill hidden fields, humans don't
    if (form.honeypot) return;

    // Phone validation
    if (form.mobile && !PHONE_REGEX.test(form.mobile)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }

    // Grab Turnstile token from the widget's hidden input
    const turnstileInput = turnstileRef.current?.querySelector<HTMLInputElement>("[name='cf-turnstile-response']");
    const turnstileToken = turnstileInput?.value || "";

    setSubmitting(true);
    setErrorMsg("");

    const hear = form.hear_about === "other" && form.hear_about_other
      ? `Other: ${form.hear_about_other}`
      : HEAR_OPTIONS.find(o => o.value === form.hear_about)?.label || form.hear_about || null;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-admin-join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.mobile || null,
            age_group: form.age_group,
            experience: form.experience || null,
            hear_about: hear,
            message: form.message || null,
            turnstile_token: turnstileToken,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        console.error("Submission error:", err);
        setErrorMsg("Something went wrong. Please try again or email us directly.");
        setSubmitting(false);
        return;
      }

      // Capture member_id so Step 2 can attach documents
      try {
        const json = await res.json();
        if (json?.member_id) setPendingMemberId(json.member_id);
      } catch { /* non-fatal — documents can still be skipped */ }

    } catch (err) {
      console.error("Network error:", err);
      setErrorMsg("Could not reach the server. Please check your connection.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  // Loading state
  if (registrationsOpen === null) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-brand-400" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-content px-4 text-center">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">{t("join.tag")}</p>
          <h1 className="text-5xl font-display font-bold text-white mb-4">{t("join.title")}</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">{t("join.hero_sub")}</p>
        </div>
      </section>

      <section className="section bg-slate-950">
        <div className="container-content px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Info sidebar */}
            <div className="space-y-6">
              <div className="glass-dark p-6">
                <h3 className="text-white font-display font-bold text-lg mb-4">{t("join.what_title")}</h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                  {[
                    t("join.step1"),
                    t("join.step2"),
                    t("join.step3"),
                    t("join.step4"),
                    t("join.step5"),
                    t("join.step6"),
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-700/60 text-brand-300 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-dark p-6">
                <h3 className="text-white font-display font-bold mb-3">{t("join.form_fees")}</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { cat: t("join.fees.senior_full"), fee: "€100" },
                    { cat: t("join.fees.senior_half"), fee: "€60" },
                    { cat: t("join.fees.junior_full"), fee: "€60" },
                    { cat: t("join.fees.junior_half"), fee: "€35" },
                  ].map((row) => (
                    <div key={row.cat} className="flex justify-between text-slate-300">
                      <span>{row.cat}</span>
                      <span className="font-semibold text-white">{row.fee}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-500 text-xs mt-3">Fees paid by bank transfer. Unique reference issued on approval.</p>
              </div>

              <div className="glass-dark p-5 text-center">
                <p className="text-slate-400 text-sm mb-2">Already a member?</p>
                <Link href="/auth/signin" className="btn-outline btn-sm">
                  Sign In to Member Area
                </Link>
              </div>
            </div>

            {/* Form / Closed state */}
            <div className="lg:col-span-2">
              {!registrationsOpen ? (
                /* ── Registrations closed ── */
                <div className="glass-dark p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-700/40 flex items-center justify-center mx-auto mb-5">
                    <Lock size={28} className="text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-3">
                    Registrations are currently closed
                  </h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-6">
                    We&apos;re not accepting new membership applications at this time.
                    Check back soon, or get in touch if you have a question.
                  </p>
                  <Link href="/contact" className="btn-outline btn-lg">
                    Contact Us
                  </Link>
                </div>
              ) : submitted ? (
                /* ── Step 2: Document Upload ── */
                <div className="glass-dark p-8 space-y-6">
                  {/* Step header */}
                  <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
                    <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                      <CheckCircle size={24} className="text-brand-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-display font-bold text-xl">Application received!</h3>
                      <p className="text-slate-400 text-sm mt-0.5">Now upload your registration documents below.</p>
                    </div>
                  </div>

                  {docsComplete ? (
                    /* All done */
                    <div className="text-center py-6 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto">
                        <CheckCircle size={30} className="text-brand-400" />
                      </div>
                      <p className="text-white font-semibold text-lg">Documents submitted — we&apos;re reviewing your application!</p>
                      <p className="text-slate-400 text-sm">We&apos;ll be in touch by email within a few days. Welcome to Madrid Cricket Club 🏏</p>
                    </div>
                  ) : (
                    <>
                      {pendingMemberId ? (
                        <div className="space-y-5">
                          <p className="text-slate-300 text-sm">
                            Please upload a copy of your <strong className="text-white">ID document</strong> (passport, DNI, or NIE) and <strong className="text-white">proof of payment</strong> if you&apos;ve already paid your membership fee. You can also skip this step and upload them later from your profile.
                          </p>

                          {/* ID Document */}
                          <DocumentUploader
                            memberId={pendingMemberId}
                            docType="id_document"
                            source="registration"
                            label="ID Document (Passport, DNI, NIE)"
                            onUploaded={(doc) => setUploadedDocs((prev) => [...prev, doc])}
                          />

                          {/* Payment Proof */}
                          <DocumentUploader
                            memberId={pendingMemberId}
                            docType="payment_proof"
                            source="registration"
                            label="Proof of Membership Fee Payment"
                            onUploaded={(doc) => setUploadedDocs((prev) => [...prev, doc])}
                          />

                          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setDocsComplete(true)}
                              className="btn-gold w-full sm:w-auto justify-center"
                            >
                              <CheckCircle size={16} />
                              {uploadedDocs.length > 0
                                ? `Done — ${uploadedDocs.length} document${uploadedDocs.length === 1 ? "" : "s"} uploaded`
                                : "Skip for now"}
                            </button>
                            {uploadedDocs.length === 0 && (
                              <p className="text-slate-500 text-xs text-center sm:text-left">You can upload documents later from your member profile.</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Could not get member_id — still show success */
                        <div className="text-center py-6 space-y-3">
                          <FileText size={32} className="mx-auto text-brand-400" />
                          <p className="text-white font-semibold">Thanks, we&apos;ll be in touch!</p>
                          <p className="text-slate-400 text-sm">We look forward to meeting you at the ground! Once approved, you can upload your documents from your member profile.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* ── Application form ── */
                <form onSubmit={handleSubmit} className="glass-dark p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label" htmlFor="join-name">
                        <User size={13} className="inline mr-1" />
                        Full Name *
                      </label>
                      <input
                        id="join-name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="join-email">
                        <Mail size={13} className="inline mr-1" />
                        Email Address *
                      </label>
                      <input
                        id="join-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label" htmlFor="join-phone">
                        <Phone size={13} className="inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        id="join-phone"
                        name="mobile"
                        type="tel"
                        value={form.mobile}
                        onChange={handlePhoneChange}
                        placeholder="+34 600 000 000"
                        className={`input ${phoneError ? "border-red-500" : ""}`}
                        inputMode="tel"
                        autoComplete="tel"
                      />
                      {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
                    </div>
                    <div>
                      <label className="label" htmlFor="join-age">
                        Age Group *
                      </label>
                      <div className="relative">
                        <select
                          id="join-age"
                          name="age_group"
                          required
                          value={form.age_group}
                          onChange={handleChange}
                          className="input appearance-none pr-10"
                        >
                          <option value="senior">Senior (16+)</option>
                          <option value="junior">Junior (under 16)</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="join-experience">
                      Previous Cricket Experience
                    </label>
                    <input
                      id="join-experience"
                      name="experience"
                      type="text"
                      value={form.experience}
                      onChange={handleChange}
                      placeholder="e.g. Club cricket in England, beginner..."
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="join-hear">
                      How did you hear about us?
                    </label>
                    <div className="relative">
                      <select
                        id="join-hear"
                        name="hear_about"
                        value={form.hear_about}
                        onChange={handleChange}
                        className="input appearance-none pr-10"
                      >
                        {HEAR_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                    {form.hear_about === "other" && (
                      <input
                        name="hear_about_other"
                        type="text"
                        value={form.hear_about_other}
                        onChange={handleChange}
                        placeholder="Please tell us how you found us..."
                        className="input mt-2"
                        maxLength={200}
                      />
                    )}
                  </div>

                  <div>
                    <label className="label" htmlFor="join-message">
                      <MessageSquare size={13} className="inline mr-1" />
                      Message / anything else we should know
                    </label>
                    <textarea
                      id="join-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Anything else you'd like us to know?"
                      className="input resize-none"
                    />
                  </div>

                  {/* Honeypot — hidden from real users, bots fill it */}
                  <input
                    name="honeypot"
                    type="text"
                    value={form.honeypot}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", width: 0, height: 0, opacity: 0 }}
                  />

                  {/* Cloudflare Turnstile CAPTCHA */}
                  {turnstileReady && (
                    <div ref={turnstileRef}>
                      <div
                        className="cf-turnstile"
                        data-sitekey={TURNSTILE_SITE_KEY}
                        data-theme="dark"
                      />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <input type="checkbox" required id="join-privacy" className="mt-1 accent-brand-500" />
                    <label htmlFor="join-privacy" className="text-slate-400 text-sm">
                      I have read and accept the{" "}
                      <Link href="/privacy" className="text-brand-400 hover:text-brand-300 underline">
                        Privacy Notice
                      </Link>
                      . I understand my data will be used to process this enquiry.
                    </label>
                  </div>

                  {errorMsg && (
                    <p className="text-red-400 text-sm">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold w-full justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Send Enquiry"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
