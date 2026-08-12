"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { User, Mail, Phone, MessageSquare, CheckCircle, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function JoinPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age_group: "senior",
    experience: "",
    hear_about: "",
    message: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-content px-4 text-center">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Membership</p>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Join Madrid Cricket Club</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Send us an enquiry and we&apos;ll be in touch within 48 hours to arrange a trial nets session.</p>
        </div>
      </section>

      <section className="section bg-slate-950">
        <div className="container-content px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Info sidebar */}
            <div className="space-y-6">
              <div className="glass-dark p-6">
                <h3 className="text-white font-display font-bold text-lg mb-4">What to Expect</h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                  {[
                    "We'll reply within 48 hours",
                    "Invited to a nets session to meet the squad",
                    "Full membership application submitted",
                    "Committee review and approval",
                    "Pay membership fee (€100 senior / €60 junior full year)",
                    "Registered with Cricket España — ready to play!",
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
                <h3 className="text-white font-display font-bold mb-3">Membership Fees</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { cat: "Senior Full Year", fee: "€100" },
                    { cat: "Senior Half Year", fee: "€60" },
                    { cat: "Junior Full Year", fee: "€60" },
                    { cat: "Junior Half Year", fee: "€35" },
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

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="glass-dark p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-brand-400" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Thanks, we&apos;ll be in touch!</h3>
                  <p className="text-slate-400">We look forward to meeting you at the ground!</p>
                </div>
              ) : (
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
                        name="phone"
                        type="tel"
                        value={form.phone}
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
