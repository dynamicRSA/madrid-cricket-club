import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { imgSrc } from "@/lib/imgSrc";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0d0303", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="container-wide px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* Real MCC logo */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-700/50" style={{ background: "#1a0505" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc("/images/logo_mcc.png")}
                  alt="Madrid Cricket Club"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-white font-display font-bold text-sm">MADRID</div>
                <div className="text-gold-400 text-xs font-semibold tracking-widest">CRICKET CLUB</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Cricket in the heart of Spain since <strong className="text-slate-300">1975</strong>.
              All nationalities, all abilities, all welcome.
            </p>
            <div className="space-y-1.5 text-slate-500 text-xs">
              <div className="flex items-center gap-2">
                <MapPin size={11} className="text-brand-500" />
                <span>Av. Complutense, Moncloa-Aravaca, Madrid</span>
              </div>
              <a
                href="https://cricketinmadrid.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-brand-400 transition-colors"
              >
                <ExternalLink size={11} className="text-brand-500" />
                cricketinmadrid.com
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Navigation</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/fixtures", label: "Fixtures & Events" },
                { href: "/results", label: "Results" },
                { href: "/news", label: "News & Reports" },
                { href: "/about", label: "About the Club" },
                { href: "/join", label: "Join the Club" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Members */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Member Hub</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/auth/signin" className="text-brand-400 font-medium hover:text-brand-300 transition-colors flex items-center gap-1.5 mb-1">
                  <span>Member Sign In</span> →
                </Link>
              </li>
              {[
                { href: "/dashboard", label: "My Dashboard & Stats" },
                { href: "/dashboard", label: "Match Availability & Selection" },
                { href: "/dashboard", label: "Catering & Dietary Requirements" },
                { href: "/dashboard", label: "Away Trip Accommodation & Transport" },
                { href: "/dashboard", label: "Membership Dues & Payment Declarations" },
                { href: "/admin", label: "Committee Admin Panel" },
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="text-slate-400 hover:text-white transition-colors">
                    • {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Get in Touch</h3>
            <div className="space-y-2.5 mb-5 text-sm">
              <div>
                <p className="text-gold-500 text-xs font-semibold mb-0.5">President — Jon Woodward</p>
                <a href="mailto:jonwoodward1975@gmail.com" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Mail size={13} className="text-brand-500" /> jonwoodward1975@gmail.com
                </a>
                <a href="tel:+34655069911" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mt-0.5">
                  <Phone size={13} className="text-brand-500" /> +34 655 069 911
                </a>
              </div>
              <div>
                <p className="text-gold-500 text-xs font-semibold mb-0.5">Vice President — Lewis Clark</p>
                <a href="mailto:mail@lewclark.com" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <Mail size={13} className="text-brand-500" /> mail@lewclark.com
                </a>
              </div>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/madridcricketclub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @madridcricketclub"
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/50 hover:bg-brand-900/30 transition-all"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://cricketinmadrid.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Official website"
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/50 hover:bg-brand-900/30 transition-all"
              >
                <ExternalLink size={14} />
              </a>
              <a
                href="https://www.facebook.com/madridcricketclub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-500/50 hover:bg-brand-900/30 transition-all"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="divider mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {year} Madrid Cricket Club. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Affiliated to Cricket España · Est. 1975 · La Elipa, Madrid
          </p>
        </div>
      </div>
    </footer>
  );
}
