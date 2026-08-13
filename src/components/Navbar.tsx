// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Menu, X, Globe, ChevronDown, Check, ShieldCheck,
  LogOut, User, LayoutDashboard, Swords
} from "lucide-react";
import { cn } from "@/lib/utils";
import { imgSrc } from "@/lib/imgSrc";
import { useLanguage, type Language } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/",         key: "nav.home" },
  { href: "/fixtures", key: "nav.fixtures" },
  { href: "/results",  key: "nav.results" },
  { href: "/news",     key: "nav.news" },
  { href: "/about",    key: "nav.about" },
  { href: "/join",     key: "nav.join" },
  { href: "/contact",  key: "nav.contact" },
];

const ADMIN_ROLES   = ["admin", "super_admin", "treasurer", "secretary"];
const CAPTAIN_ROLES = ["captain", "vice_captain"];

export default function Navbar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const supabase = createClient();

  const [user,   setUser]   = useState<any>(null);
  const [member, setMember] = useState<any>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadMember(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadMember(session.user);
      else setMember(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadMember(u: any) {
    const isSven = u.email?.toLowerCase() === "svenprinsloo@gmail.com";
    const { data } = await supabase.from("members").select("id,roles,preferred_name,full_legal_name,status").eq("user_id", u.id).single();
    if (isSven) {
      setMember({ ...(data || {}), roles: ["super_admin","admin","captain","vice_captain","treasurer","secretary"] });
    } else {
      setMember(data);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null); setMember(null); setUserMenuOpen(false); setMobileOpen(false);
    router.push("/");
  }

  const roles: string[]  = member?.roles || [];
  const isAdmin          = roles.some(r => ADMIN_ROLES.includes(r));
  const isCaptain        = roles.some(r => CAPTAIN_ROLES.includes(r));
  const loggedIn         = !!user;
  const displayName      = member?.preferred_name || member?.full_legal_name || user?.email?.split("@")[0];
  const initials         = displayName ? displayName.split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase() : "?";

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-slate-950/95 backdrop-blur-md border-b border-white/[0.06] py-2" : "bg-transparent py-4"
      )}>
        <div className="container-wide px-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0" onClick={() => setMobileOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc("/images/logo_mcc.png")}
              alt="Madrid Cricket Club"
              className="h-10 w-auto object-contain transition-opacity group-hover:opacity-80"
              style={{ filter: "drop-shadow(0 0 6px rgba(180,0,0,0.35))" }}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn("nav-link text-sm", pathname === link.href && "text-white after:w-full")}>
                {t(link.key)}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-2">
            <LocaleSwitcher />
            {loggedIn ? (
              /* ── Single user dropdown pill ── */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 transition-colors text-sm"
                >
                  {/* Avatar circle */}
                  <span className="w-7 h-7 rounded-full bg-brand-700/60 border border-brand-500/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials}
                  </span>
                  <span className="text-white font-medium max-w-[100px] truncate">{displayName || "Account"}</span>
                  <ChevronDown size={13} className={cn("text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-dark rounded-2xl overflow-hidden shadow-2xl z-50 border border-white/[0.08]">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-white text-sm font-semibold truncate">{displayName}</p>
                      <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                    </div>

                    <div className="py-1.5">
                      {/* Member dashboard — always shown */}
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className={cn("flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors",
                          pathname.startsWith("/dashboard") && "text-brand-300 bg-brand-500/10")}>
                        <LayoutDashboard size={15} />
                        My Dashboard
                      </Link>

                      {/* Captain panel */}
                      {isCaptain && (
                        <Link href="/captain" onClick={() => setUserMenuOpen(false)}
                          className={cn("flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors",
                            pathname.startsWith("/captain") && "text-brand-300 bg-brand-500/10")}>
                          <span className="text-base leading-none">🏏</span>
                          Captain Panel
                        </Link>
                      )}

                      {/* Admin panel */}
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className={cn("flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors",
                            pathname.startsWith("/admin") && "text-brand-300 bg-brand-500/10")}>
                          <ShieldCheck size={15} className="text-brand-400" />
                          Club Admin
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-white/[0.06] py-1.5">
                      <button onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors">
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-outline btn-sm text-sm">{t("nav.signin")}</Link>
                <Link href="/join"        className="btn-primary btn-sm text-sm">{t("nav.join_cta")}</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col" style={{ background: "#080f18" }}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-white/[0.06]">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc("/images/logo_mcc.png")} alt="MCC" className="h-9 w-auto" />
            </Link>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl bg-white/[0.06] text-slate-300 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* If logged in, show user identity strip */}
          {loggedIn && (
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3 bg-white/[0.02]">
              <span className="w-9 h-9 rounded-full bg-brand-700/60 border border-brand-500/30 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{displayName || "Member"}</p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Nav links */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                  pathname === link.href
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                {t(link.key)}
              </Link>
            ))}

            {/* Member/Captain/Admin panel links */}
            {loggedIn && (
              <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-4 mb-2">My Account</p>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                  className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                    pathname.startsWith("/dashboard") ? "bg-brand-500/15 text-brand-300 border border-brand-500/20" : "text-slate-300 hover:text-white hover:bg-white/[0.06]")}>
                  <LayoutDashboard size={18} /> My Dashboard
                </Link>
                {isCaptain && (
                  <Link href="/captain" onClick={() => setMobileOpen(false)}
                    className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                      pathname.startsWith("/captain") ? "bg-brand-500/15 text-brand-300 border border-brand-500/20" : "text-slate-300 hover:text-white hover:bg-white/[0.06]")}>
                    <span className="text-xl">🏏</span> Captain Panel
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}
                    className={cn("flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                      pathname.startsWith("/admin") ? "bg-brand-500/15 text-brand-300 border border-brand-500/20" : "text-slate-300 hover:text-white hover:bg-white/[0.06]")}>
                    <ShieldCheck size={18} className="text-brand-400" /> Club Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Bottom auth actions */}
          <div className="px-4 pb-8 pt-4 border-t border-white/[0.06] space-y-3" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
            <LocaleSwitcher />
            {loggedIn ? (
              <button onClick={handleSignOut}
                className="btn-ghost w-full justify-center text-sm text-slate-400 border border-white/10">
                <LogOut size={15} /> Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="btn-outline flex-1 justify-center text-sm">{t("nav.signin")}</Link>
                <Link href="/join"        onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center text-sm">{t("nav.join_cta")}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
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
      <button onClick={() => setOpen(!open)}
        className="btn-ghost btn-sm flex items-center gap-1.5 text-xs"
        aria-label="Select language">
        <Globe size={13} />
        <span>{current.flag} {current.code.toUpperCase()}</span>
        <ChevronDown size={11} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-36 glass-dark rounded-xl overflow-hidden shadow-2xl z-50">
          {options.map((opt) => (
            <button key={opt.code} onClick={() => { setLang(opt.code); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors text-white flex items-center justify-between">
              <span>{opt.flag} {opt.label}</span>
              {lang === opt.code && <Check size={12} className="text-brand-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
