"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { imgSrc } from "@/lib/imgSrc";
import { useLanguage, type Language } from "@/lib/i18n";

const NAV_KEYS = [
  { href: "/",         key: "nav.home" },
  { href: "/fixtures", key: "nav.fixtures" },
  { href: "/results",  key: "nav.results" },
  { href: "/news",     key: "nav.news" },
  { href: "/about",    key: "nav.about" },
  { href: "/join",     key: "nav.join" },
  { href: "/contact",  key: "nav.contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#1a0505]/95 backdrop-blur-md border-b border-white/[0.06] py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container-wide px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc("/images/logo_mcc.png")}
            alt="Madrid Cricket Club"
            className="h-12 w-auto object-contain transition-opacity group-hover:opacity-80"
            style={{ filter: "drop-shadow(0 0 6px rgba(180,0,0,0.35))" }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_KEYS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-link",
                pathname === link.href && "text-white after:w-full"
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="hidden lg:flex items-center gap-3">
          <LocaleSwitcher />
          <Link href="/auth/signin" className="btn-outline btn-sm">
            {t("nav.signin")}
          </Link>
          <Link href="/join" className="btn-primary btn-sm">
            {t("nav.join_cta")}
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden btn-ghost p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-[#1a0505]/98 backdrop-blur-md border-t border-white/[0.06] px-4 py-6 flex flex-col gap-4">
          {NAV_KEYS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "text-slate-300 hover:text-white font-medium py-1",
                pathname === link.href && "text-white"
              )}
            >
              {t(link.key)}
            </Link>
          ))}
          <div className="flex gap-3 mt-2">
            <Link href="/auth/signin" className="btn-outline btn-sm flex-1 justify-center" onClick={() => setMobileOpen(false)}>
              {t("nav.signin")}
            </Link>
            <Link href="/join" className="btn-primary btn-sm flex-1 justify-center" onClick={() => setMobileOpen(false)}>
              {t("nav.join_cta")}
            </Link>
          </div>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}

function LocaleSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const options: { code: Language; flag: string; label: string }[] = [
    { code: "en", flag: "🇬🇧", label: "English" },
    { code: "es", flag: "🇪🇸", label: "Español" },
  ];

  const current = options.find((o) => o.code === lang) ?? options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost btn-sm flex items-center gap-1.5"
        aria-label="Select language"
      >
        <Globe size={14} />
        <span className="text-xs font-medium">{current.flag} {current.code.toUpperCase()}</span>
        <ChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 glass-dark rounded-xl overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          {options.map((opt) => (
            <button
              key={opt.code}
              onClick={() => { setLang(opt.code); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors text-white flex items-center justify-between"
            >
              <span>{opt.flag} {opt.label}</span>
              {lang === opt.code && <Check size={12} className="text-brand-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
