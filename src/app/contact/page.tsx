"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Mail, MapPin, Loader2, CheckCircle, MessageSquare } from "lucide-react";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-content px-4">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Contact Us</h1>
          <p className="text-slate-400 text-lg">
            Questions about the club, playing opportunities, or anything else? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="section bg-slate-950">
        <div className="container-content px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact info */}
            <div className="space-y-6">
              <div className="glass-dark p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-900/60 flex items-center justify-center">
                    <Mail size={18} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Email</p>
                    <a href="mailto:secretary@madridcricketclub.es" className="text-white font-medium hover:text-brand-300 transition-colors text-sm">
                      secretary@madridcricketclub.es
                    </a>
                  </div>
                </div>
              </div>

              <div className="glass-dark p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-900/60 flex items-center justify-center">
                    <MapPin size={18} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Location</p>
                    <p className="text-white font-medium text-sm">Madrid, Spain</p>
                    <p className="text-slate-400 text-xs">Home: Casa de Campo</p>
                  </div>
                </div>
              </div>

              <div className="glass-dark p-6">
                <h3 className="text-white font-semibold mb-4">Follow Us</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: InstagramIcon, label: "Instagram", handle: "@madridcricketcc", href: "https://instagram.com/madridcc" },
                    { icon: TwitterXIcon, label: "Twitter / X", handle: "@madridCC", href: "https://twitter.com/madridcc" },
                    { icon: FacebookIcon, label: "Facebook", handle: "Madrid Cricket Club", href: "https://facebook.com/madridcricketclub" },
                  ].map(({ icon: Icon, label, handle, href }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Icon />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="text-sm font-medium">{handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Message form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="glass-dark p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-brand-400" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Message sent!</h3>
                  <p className="text-slate-400">We'll get back to you within 48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-dark p-8 space-y-5">
                  <h2 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
                    <MessageSquare size={18} className="text-brand-400" /> Send a Message
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label" htmlFor="contact-name">Your name *</label>
                      <input id="contact-name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Jane Smith" className="input" />
                    </div>
                    <div>
                      <label className="label" htmlFor="contact-email">Email address *</label>
                      <input id="contact-email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jane@example.com" className="input" />
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="contact-message">Message *</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      value={form.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Your message..."
                      className="input resize-none"
                    />
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send Message"}
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
