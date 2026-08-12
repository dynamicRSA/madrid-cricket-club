import Link from "next/link";
import { Mail, MapPin, ExternalLink } from "lucide-react";

// Minimal social SVG icons (lucide-react doesn't bundle these)
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

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/[0.06]">
      <div className="container-wide px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                  <path d="M8 32 L24 8" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                  <path d="M24 8 L30 14" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                  <path d="M30 14 L14 38" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                  <circle cx="32" cy="28" r="4" fill="#e8af05" fillOpacity="0.9"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-display font-bold text-sm">MADRID</div>
                <div className="text-gold-400 text-xs font-semibold tracking-widest">CRICKET CLUB</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Cricket in the heart of Spain since 2008. Affiliated to Cricket España and competing in the Liga Nacional División 2.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin size={14} />
              <span>Madrid, Spain</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Navigation</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/fixtures", label: "Fixtures" },
                { href: "/results", label: "Results" },
                { href: "/news", label: "News" },
                { href: "/about", label: "About" },
                { href: "/agm", label: "AGM Records" },
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
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Members</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/join", label: "Join the Club" },
                { href: "/auth/signin", label: "Member Login" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/contact", label: "Contact Us" },
                { href: "/privacy", label: "Privacy Notice" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide">Get in Touch</h3>
            <div className="space-y-3 mb-6">
              <a
                href="mailto:secretary@madridcricketclub.es"
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <Mail size={14} />
                secretary@madridcricketclub.es
              </a>
              <a
                href="https://cricketespana.es"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <ExternalLink size={14} />
                Cricket España
              </a>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: InstagramIcon, href: "https://instagram.com/madridcc", label: "Instagram" },
                { icon: TwitterXIcon, href: "https://twitter.com/madridcc", label: "Twitter/X" },
                { icon: FacebookIcon, href: "https://facebook.com/madridcricketclub", label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="divider mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {year} Madrid Cricket Club. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Affiliated to Cricket España · Liga Nacional División 2
          </p>
        </div>
      </div>
    </footer>
  );
}
