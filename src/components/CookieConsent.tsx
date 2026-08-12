"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, Settings, Check, X, Lock } from "lucide-react";

export type CookiePreferences = {
  essential: boolean; // Always true
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true,
  functional: true,
  marketing: false,
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if consent has already been saved
    const savedConsent = localStorage.getItem("mcc_cookie_consent");
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        setPrefs(JSON.parse(savedConsent));
      } catch (e) {
        setShowBanner(true);
      }
    }

    // Listen for custom event to reopen preferences from footer
    const handleReopen = () => {
      setShowModal(true);
    };
    window.addEventListener("open-cookie-settings", handleReopen);
    return () => window.removeEventListener("open-cookie-settings", handleReopen);
  }, []);

  function saveConsent(updated: CookiePreferences) {
    localStorage.setItem("mcc_cookie_consent", JSON.stringify(updated));
    localStorage.setItem("mcc_cookie_consent_date", new Date().toISOString());
    setPrefs(updated);
    setShowBanner(false);
    setShowModal(false);
  }

  function handleAcceptAll() {
    saveConsent({ essential: true, analytics: true, functional: true, marketing: true });
  }

  function handleRejectNonEssential() {
    saveConsent({ essential: true, analytics: false, functional: false, marketing: false });
  }

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Bottom Banner */}
      {showBanner && !showModal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#140606]/95 border-t border-brand-500/30 backdrop-blur-md shadow-2xl">
          <div className="container-wide flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie size={18} className="text-brand-400" />
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white text-sm">Privacy & Cookie Management</p>
                <p className="leading-relaxed">
                  We use cookies and encrypted sessions to protect your data, keep you signed in securely, and improve club services in compliance with GDPR and Spanish AEPD standards.
                  <Link href="/privacy" className="text-brand-400 underline hover:text-brand-300 ml-1">
                    Read Privacy Notice
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <button onClick={() => setShowModal(true)} className="btn-ghost btn-sm text-xs gap-1">
                <Settings size={13} /> Customize
              </button>
              <button onClick={handleRejectNonEssential} className="btn-outline btn-sm text-xs">
                Reject Non-Essential
              </button>
              <button onClick={handleAcceptAll} className="btn-primary btn-sm text-xs">
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preference Customization Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-dark w-full max-w-lg p-6 space-y-5 rounded-2xl border border-brand-500/30 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-brand-400" />
                <h3 className="text-lg font-display font-bold text-white">Customize Cookie Preferences</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select which cookie categories you agree to store on your device. Essential cookies are required to manage your authenticated member session safely.
            </p>

            <div className="space-y-3 text-xs">
              {/* Essential */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <span>Essential & Session Security</span>
                    <span className="badge-green text-[10px]">Always Active</span>
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Required for encrypted member authentication, Supabase sessions, and CSRF protection.</p>
                </div>
                <Lock size={14} className="text-slate-500 shrink-0 ml-3" />
              </div>

              {/* Functional */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Functional Preferences</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Saves language preferences (English / Spanish) and interface settings.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.functional}
                  onChange={(e) => setPrefs({ ...prefs, functional: e.target.checked })}
                  className="rounded accent-brand-500 w-4 h-4 cursor-pointer ml-3"
                />
              </div>

              {/* Analytics */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Performance Analytics</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Helps us measure site traffic and match report views anonymously.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                  className="rounded accent-brand-500 w-4 h-4 cursor-pointer ml-3"
                />
              </div>

              {/* Marketing */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Social & External Media</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Enables ECN match video embeds and Instagram social media cards.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                  className="rounded accent-brand-500 w-4 h-4 cursor-pointer ml-3"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
              <Link href="/privacy" className="text-xs text-brand-400 hover:underline">
                Read GDPR Privacy Policy
              </Link>
              <button onClick={() => saveConsent(prefs)} className="btn-primary btn-sm text-xs">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
