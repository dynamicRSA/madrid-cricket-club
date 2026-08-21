"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { User, Mail, Phone, MessageSquare, CheckCircle, Loader2, ChevronDown, Lock } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

export default function JoinPage() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [registrationsOpen, setRegistrationsOpen] = useState<boolean | null>(null); // null = loading
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    age_group: "senior",
    experience: "",
    hear_about: "",
    message: "",
  });

  // Check if registrations are open
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_config")
      .select("value")
      .eq("key", "registrations_open")
      .single()
      .then(({ data }) => {
        // Default to open if config row missing
        setRegistrationsOpen(data ? data.value === true : true);
      })
      .catch(() => setRegistrationsOpen(true));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("members").insert({
        full_legal_name: form.name,
        email: form.email,
        mobile: form.mobile || null,
        status: "enquiry",
        membership_category: form.age_group === "junior" ? "junior" : "senior",
        notes: [form.experience, form.message, form.hear_about].filter(Boolean).join(" | "),
      });

      if (error) {
        console.error("Supabase insert error:", error);
      }

      // Fire admin notification — best effort, non-blocking
      try {
        await fetch(
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
            }),
          }
        );
      } catch (notifyErr) {
        console.warn("Admin notification failed (non-blocking):", notifyErr);
      }
    } catch (err) {
      console.warn("Using offline/mock mode for form submit");
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
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
                /* ── Success state ── */
                <div className="glass-dark p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-brand-400" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Thanks, we&apos;ll be in touch!</h3>
                  <p className="text-slate-400">We look forward to meeting you at the ground!</p>
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
                        onChange={handleChange}
                        placeholder="+34 600 000 000"
                        className="input"
                      />
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
                    <input
                      id="join-hear"
                      name="hear_about"
                      type="text"
                      value={form.hear_about}
                      onChange={handleChange}
                      placeholder="e.g. Instagram, Google, a friend..."
                      className="input"
                    />
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
