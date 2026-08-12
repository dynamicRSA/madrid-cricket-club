import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { COMMITTEE, VENUES } from "@/lib/mock-data";
import { MapPin, ExternalLink, Users, Trophy, Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Madrid Cricket Club — our history, home ground, committee and affiliation to Cricket España.",
};

export default function AboutPage() {
  const homeVenue = VENUES.find((v) => v.is_home);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/ground.jpg" alt="Casa de Campo Cricket Ground" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/60 to-slate-950" />
        </div>
        <div className="relative z-10 pt-40 pb-24 container-wide px-4 text-center">
          <Image src="/images/logo.png" alt="MCC Logo" width={100} height={100} className="rounded-full mx-auto mb-6 shadow-glow-green" />
          <p className="text-brand-300 text-sm font-semibold uppercase tracking-widest mb-3">Est. 2008</p>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">Madrid Cricket Club</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">Cricket in the heart of Spain since 2008</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-slate-900/60 py-8">
        <div className="container-wide px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { icon: Star, label: "Founded", value: "2008" },
              { icon: Users, label: "Active Members", value: "60+" },
              { icon: Trophy, label: "League", value: "Liga Nacional Div 2" },
              { icon: MapPin, label: "Base", value: "Madrid, Spain" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <Icon size={20} className="text-brand-400 mx-auto mb-2" />
                <div className="text-xl font-bold font-display text-white">{value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="section bg-slate-950">
        <div className="container-content px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="text-4xl font-display font-bold text-white mb-6">Our History</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Madrid Cricket Club was founded in 2008 by a group of expats and Spanish cricket enthusiasts who wanted to bring competitive cricket to the Spanish capital. Starting with just a handful of players, we began playing friendly matches in the Casa de Campo park.
                </p>
                <p>
                  Over the years the club has grown steadily. Today we are a vibrant, multicultural community of over 60 players — from 14 different nationalities — competing in the Liga Nacional División 2 under the banner of Cricket España.
                </p>
                <p>
                  We field a senior side that travels to Valencia, Alicante, Barcelona and beyond, and we run a junior programme to bring the next generation of Spanish cricketers into the game.
                </p>
                <p>
                  The club is affiliated to <strong className="text-white">Cricket España</strong>, the national governing body, and all our players are registered and insured under the national scheme. Our long-term ambition is promotion to División 1 and the development of home-grown Spanish cricket talent.
                </p>
              </div>
            </div>
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden">
              <Image src="/images/news-hero-2.jpg" alt="Madrid Cricket Club team" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Home ground */}
      {homeVenue && (
        <section className="section bg-slate-900/30">
          <div className="container-content px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">Where We Play</p>
                <h2 className="text-4xl font-display font-bold text-white mb-6">Our Home Ground</h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                  We play our home fixtures at the <strong className="text-white">Casa de Campo cricket ground</strong>, one of the finest club grounds in Spain, set in Madrid's beautiful 1,700-hectare western parkland — with views across to the Palacio Real.
                </p>
                <div className="glass-dark p-5 mb-5">
                  <p className="text-white font-semibold mb-1">{homeVenue.name}</p>
                  <p className="text-slate-400 text-sm flex items-center gap-1.5">
                    <MapPin size={13} /> {homeVenue.address}
                  </p>
                  {homeVenue.notes && <p className="text-slate-400 text-sm mt-2">{homeVenue.notes}</p>}
                </div>
                <a
                  href={homeVenue.map_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline btn-sm"
                >
                  <MapPin size={14} /> Get Directions <ExternalLink size={13} />
                </a>
              </div>
              <div className="relative h-80 rounded-2xl overflow-hidden lg:order-1">
                <Image src="/images/ground.jpg" alt="Casa de Campo cricket ground" fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Committee */}
      <section className="section bg-slate-950">
        <div className="container-wide px-4">
          <div className="text-center mb-12">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Club Leadership</p>
            <h2 className="text-4xl font-display font-bold text-white">Committee</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMITTEE.map((member) => (
              <div key={member.role} className="glass-dark p-6 card-hover">
                <div className="w-12 h-12 rounded-full bg-brand-900/60 border border-brand-700/40 flex items-center justify-center mb-4">
                  <Users size={20} className="text-brand-400" />
                </div>
                <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-1">{member.role}</p>
                <p className="text-white font-display font-bold text-lg mb-2">{member.name}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cricket España */}
      <section className="section bg-slate-900/30">
        <div className="container-content px-4">
          <div className="glass-dark p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-brand-900/50 flex items-center justify-center shrink-0">
              <Trophy size={32} className="text-brand-400" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-brand-300 text-xs font-semibold uppercase tracking-widest mb-1">National Affiliation</p>
              <h3 className="text-2xl font-display font-bold text-white mb-2">Cricket España</h3>
              <p className="text-slate-300 leading-relaxed">
                MCC is affiliated to Cricket España, the governing body of cricket in Spain. All our players are registered and insured under the national scheme. Cricket España represents Spain at the European Cricket Council and International Cricket Council.
              </p>
            </div>
            <a
              href="https://cricketespana.es"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-sm whitespace-nowrap shrink-0"
            >
              cricketespana.es <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="section bg-slate-950">
        <div className="container-wide px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">Want to be part of it?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            All abilities welcome — senior and junior. Whether you've played all your life or picked up a bat for the first time last summer, we'd love to hear from you.
          </p>
          <Link href="/join" className="btn-gold btn-lg">
            <Users size={18} /> Join the Club
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
