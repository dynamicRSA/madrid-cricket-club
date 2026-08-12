"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { COMMITTEE } from "@/lib/mock-data";
import { MapPin, ExternalLink, Users, Trophy, Star, Mail, Phone, Calendar } from "lucide-react";
import { imgSrc } from "@/lib/imgSrc";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero — real team photo */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imgSrc("/images/real/mcc-team-alicante.jpg")})` }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(18,8,8,0.3) 0%, rgba(18,8,8,0.6) 60%, rgba(18,8,8,1) 100%)" }} />
        </div>
        <div className="relative z-10 w-full container-wide px-4 pb-16 pt-40">
          {/* Real MCC logo */}
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-brand-600/60 mb-4 shadow-glow-red" style={{ background: "#1a0505" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc("/images/logo_mcc.png")} alt="Madrid Cricket Club" width={80} height={80} className="w-full h-full object-contain" />
          </div>
          <p className="text-brand-300 text-sm font-semibold uppercase tracking-widest mb-2">Est. 2001</p>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-3">Madrid Cricket Club</h1>
          <p className="text-xl text-slate-300 max-w-2xl">Cricket in the heart of Spain for 50 years and counting</p>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: "linear-gradient(135deg, #1a0505, #120808)" }} className="py-8">
        <div className="container-wide px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { icon: Calendar, label: "Founded", value: "2001" },
              { icon: Users, label: "Members", value: "100+" },
              { icon: Trophy, label: "Teams", value: "Men, Women & Juniors" },
              { icon: MapPin, label: "Madrid Base", value: "La Elipa" },
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

      {/* Our Story — from El País feature Aug 2026 + real history */}
      <section className="section px-4" style={{ background: "#120808" }}>
        <div className="container-content px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="text-4xl font-display font-bold text-white mb-6">A Club With Deep Roots</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                <p>
                  Madrid Cricket Club was formed in 2001, with the club celebrating its 25th anniversary in 2026.
                  We were the only cricket club in Spain until Barcelona CC was founded in 1982.
                </p>
                <p>
                  The modern chapter began around 25 years ago when Jon Woodward, a Brit who has lived in Madrid for over 30 years, placed a classified ad in a free English-language newspaper: <em className="text-slate-200">"Se buscan jugadores de críquet."</em> Three people replied. From a conversation over a beer, a club was reborn.
                </p>
                <p>
                  El País described us in August 2026 as <em className="text-slate-200">"una institución con solera pero sin sede"</em> (an institution with heritage but without a home). That headline captures a real tension: Madrid City Council subsidises us with 2 hours a week at <strong className="text-white">La Elipa</strong> and around €7,000 a year in support for youth cricket. But for league matches, we travel 460km south to the Alicante coast.
                </p>
                <p>
                  Today MCC has over <strong className="text-white">100 members</strong> from more than a dozen nationalities. There are now 200+ registered cricketers across 6 clubs in Madrid, plus around 15 informal groups. Cricket enters the <strong className="text-white">Olympics at Los Angeles 2028</strong>, and this autumn Madrid hosts its first ever <strong className="text-white">20-over city league at La Elipa</strong> (six teams, three months). The tide is turning.
                </p>
                <a
                  href="https://elpais.com/espana/madrid/2026-08-09/madrid-cricket-club-una-institucion-con-solera-pero-sin-sede-exiliado-en-la-costa-alicantina.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-400 text-xs hover:underline mt-1"
                >
                  Read the El País feature (Aug 2026) <ExternalLink size={11} />
                </a>
              </div>
            </div>
            {/* Real photos */}
            <div className="space-y-4">
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc("/images/real/mcc-1982.png")} alt="Madrid Cricket Club team 1982" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,8,8,0.8) 0%, transparent 60%)" }} />
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs text-white/90 font-medium bg-black/60 px-2.5 py-1 rounded-md backdrop-blur">Historic Squad (1982/83) — Early Days of MCC</span>
                </div>
              </div>
              <div className="relative h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc("/images/real/mcc-juniors.jpg")} alt="Madrid Cricket Club Junior Squad" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,8,8,0.8) 0%, transparent 60%)" }} />
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs text-white/90 font-medium bg-black/60 px-2.5 py-1 rounded-md backdrop-blur">Junior & Youth Development Squad at La Elipa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Grounds */}
      <section className="section px-4" style={{ background: "linear-gradient(135deg, #1a0505, #120808)" }}>
        <div className="container-content px-4">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">Where We Play</p>
          <h2 className="text-4xl font-display font-bold text-white mb-8">Our Grounds</h2>
          <div className="grid md:grid-cols-2 gap-6">

            <div className="glass-dark overflow-hidden rounded-2xl border border-white/10 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc("/images/real/mcc-batting-cages.jpg")} alt="CDM La Elipa Batting Cages" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120808] to-transparent" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge-red text-xs">Madrid Base</span>
                    <span className="badge-gold text-xs">Training & Junior Cricket</span>
                  </div>
                  <h3 className="text-white font-display font-bold text-xl mb-2">Centro Deportivo Municipal La Elipa</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Our home in Madrid. La Elipa is where we train and run junior cricket. Madrid City Council supports the club with 2 hours/week of subsidised pitch time — a vital lifeline.
                    The new <strong className="text-white">Madrid 20-over league</strong> will also be played here from October 2026.
                  </p>
                </div>
                <div>
                  <div className="flex items-start gap-2 text-slate-400 text-xs mb-4">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0 text-brand-400" />
                    C. del Alcalde Garrido Juaristi 17, Moratalaz, 28030 Madrid
                  </div>
                  <a
                    href="https://maps.google.com/?q=Centro+Deportivo+Municipal+La+Elipa+Madrid"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline btn-sm inline-flex items-center gap-1"
                  >
                    <MapPin size={12} /> Get Directions <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-dark overflow-hidden rounded-2xl border border-white/10 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc("/images/real/mcc-ecn-lineup.jpg")} alt="Sporting Alfaz Cricket Ground" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120808] to-transparent" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge-gold text-xs">40-Over League</span>
                    <span className="badge-gold text-xs">20-Over Coastal League</span>
                  </div>
                  <h3 className="text-white font-display font-bold text-xl mb-2">Sporting Alfaz Cricket Ground</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Our away home for the ECCL coastal league (40-over and 20-over). Alfaz del Pi, Alicante — roughly 460km south of Madrid. The reality of cricket in Spain: we travel to compete.
                    Also hosts the ECCL T20 league and La Manga Club fixtures.
                  </p>
                </div>
                <div>
                  <div className="flex items-start gap-2 text-slate-400 text-xs mb-4">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0 text-brand-400" />
                    Alfaz del Pi, Alicante, Spain (~4.5h from Madrid)
                  </div>
                  <a
                    href="https://maps.google.com/?q=Sporting+Alfaz+del+Pi+cricket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline btn-sm inline-flex items-center gap-1"
                  >
                    <MapPin size={12} /> Get Directions <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Committee */}
      <section className="section px-4" style={{ background: "#120808" }}>
        <div className="container-wide px-4">
          <div className="text-center mb-12">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Club Leadership</p>
            <h2 className="text-4xl font-display font-bold text-white">Committee 2026</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMMITTEE.map((member) => (
              <div key={member.role} className="glass-dark p-5 card-hover">
                <div className="w-12 h-12 rounded-full bg-brand-900/40 border border-brand-700/30 flex items-center justify-center mb-3">
                  <Users size={20} className="text-brand-400" />
                </div>
                <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-1">{member.role}</p>
                <p className="text-white font-display font-bold text-lg mb-2">{member.name}</p>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">{member.bio}</p>
                <div className="space-y-1">
                  {"email" in member && member.email && (
                    <a href={`mailto:${member.email}`} className="text-brand-400 text-xs flex items-center gap-1 hover:underline">
                      <Mail size={10} /> {member.email}
                    </a>
                  )}
                  {"phone" in member && member.phone && (
                    <a href={`tel:${member.phone}`} className="text-slate-400 text-xs flex items-center gap-1">
                      <Phone size={10} /> {member.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Federación Española de Cricket announcement */}
      <section className="section px-4" style={{ background: "linear-gradient(135deg, #0d0303, #1a0505)" }}>
        <div className="container-content px-4">
          <div className="glass-dark p-8 flex flex-col md:flex-row items-center gap-8">
            {/* Fed logo placeholder — official announcement image */}
            <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a1535] flex items-center justify-center">
              <div className="text-center p-2">
                <Trophy size={32} className="text-gold-400 mx-auto mb-1" />
                <p className="text-[8px] text-white font-bold leading-tight">FEDERACIÓN ESPAÑOLA DE CRICKET</p>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-1">🇪🇸 Big News for Spanish Cricket</p>
              <h3 className="text-2xl font-display font-bold text-white mb-2">Spain Now Has a National Cricket Federation</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                Cricket España has been formally recognised as Spain's <strong className="text-white">Federación Española de Cricket</strong> — a national federation.
                A huge milestone for the sport. With cricket entering the <strong className="text-white">Olympics in Los Angeles 2028</strong>, the future of the game in Spain has never looked brighter.
                <br /><em className="text-slate-400">"Unidos por la pasión. Impulsados por la excelencia."</em>
              </p>
            </div>
            <a
              href="https://cricketespana.es"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold btn-sm whitespace-nowrap shrink-0"
            >
              cricketespana.es <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="section px-4 text-center" style={{ background: "#120808" }}>
        <div className="container-wide px-4">
          <h2 className="text-3xl font-display font-bold text-white mb-4">Want to be part of it?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            All abilities welcome — senior, women's, and junior. Whether you've played all your life or just want to give it a try, come down to La Elipa on a Sunday morning.
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
