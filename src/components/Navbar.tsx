"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/results", label: "Results" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/join", label: "Join" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-brand-600/50 shadow-glow-red">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo_mcc.png"
              alt="MCC Logo"
              className="w-full h-full object-contain bg-[#1a0505]"
            />
          </div>
          <div>
            <div className="text-white font-display font-bold text-sm leading-tight group-hover:text-brand-300 transition-colors">
              MADRID
            </div>
            <div className="text-gold-400 text-xs font-semibold tracking-widest leading-tight">
              CRICKET CLUB
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-link",
                pathname === link.href && "text-white after:w-full"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="hidden lg:flex items-center gap-3">
          <LocaleSwitcher />
          <Link href="/auth/signin" className="btn-outline btn-sm">
            Sign In
          </Link>
          <Link href="/join" className="btn-primary btn-sm">
            Join the Club
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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "text-slate-300 hover:text-white font-medium py-1",
                pathname === link.href && "text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-2">
            <Link href="/auth/signin" className="btn-outline btn-sm flex-1 justify-center" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link href="/join" className="btn-primary btn-sm flex-1 justify-center" onClick={() => setMobileOpen(false)}>
              Join
            </Link>
          </div>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}

function LocaleSwitcher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost btn-sm flex items-center gap-1.5"
      >
        <Globe size={14} />
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 glass-dark rounded-xl overflow-hidden" style={{boxShadow: "0 4px 24px rgba(0,0,0,0.2)"}}>
          <button onClick={() => setOpen(false)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors text-white">
            🇬🇧 English
          </button>
          <button onClick={() => setOpen(false)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors text-white">
            🇪🇸 Español
          </button>
        </div>
      )}
    </div>
  );
}
