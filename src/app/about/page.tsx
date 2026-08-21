"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { COMMITTEE } from "@/lib/mock-data";
import { imgSrc } from "@/lib/imgSrc";
import { Calendar, Users, Trophy, MapPin, ExternalLink, Star, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useLanguage();
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
          <p className="text-brand-300 text-sm font-semibold uppercase tracking-widest mb-2">{t("about.tag")}</p>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-3">Madrid Cricket Club</h1>
          <p className="text-xl text-slate-300 max-w-2xl">{t("about.hero_sub")}</p>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: "linear-gradient(135deg, #1a0505, #120808)" }} className="py-8">
        <div className="container-wide px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { icon: Calendar, label: t("about.stat.founded"),  value: "2001" },
              { icon: Users,    label: t("about.stat.members"),   value: "100+" },
              { icon: Trophy,   label: t("about.stat.teams"),     value: t("about.stat.teams_val") },
              { icon: MapPin,   label: t("about.stat.base"),      value: "La Elipa" },
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
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">{t("about.story_tag")}</p>
              <h2 className="text-4xl font-display font-bold text-white mb-6">{t("about.story_title")}</h2>
              <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                <p>
                  Madrid Cricket Club was formed in 2001 and is celebrating its 25th anniversary in 2026.
                  What started as a small group of enthusiasts has grown into one of Spain's most active cricket clubs.
                </p>
                <p>
                  The club was founded when Jon Woodward, a Brit who has lived in Madrid for over 30 years, placed a classified ad in a free English-language newspaper: <em className="text-slate-200">"Se buscan jugadores de críquet."</em> Three people replied. From a conversation over a beer, Madrid Cricket Club was born.
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
                  <span className="text-xs text-white/90 font-medium bg-black/60 px-2.5 py-1 rounded-md backdrop-blur">Early MCC at La Elipa, Madrid</span>
                </div>
              </div>
              <div className="relative h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc("/images/real/la-elipa-juniors.jpg")} alt="Junior & Youth Development Squad at La Elipa" className="w-full h-full object-cover" />
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
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">{t("about.venues_tag")}</p>
          <h2 className="text-4xl font-display font-bold text-white mb-10">{t("about.venues_title")}</h2>
          <div className="grid md:grid-cols-2 gap-6">

            <div className="glass-dark overflow-hidden rounded-2xl border border-white/10 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc("/images/real/la-elipa-ground.jpg")} alt="La Elipa cricket ground, Madrid" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120808] to-transparent" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge-red text-xs">{t("about.base_tag")}</span>
                    <span className="badge-gold text-xs">{t("about.training_tag")}</span>
                  </div>
                  <h3 className="text-white font-display font-bold text-xl mb-3">{t("about.elipa_title")}</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{t("about.la_elipa_desc")}</p>
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
                    <MapPin size={12} /> {t("about.directions")} <ExternalLink size={11} />
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
                    <span className="badge-gold text-xs">{t("about.league_tag")}</span>
                  </div>
                  <h3 className="text-white font-display font-bold text-xl mb-3">{t("about.alfaz_title")}</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{t("about.alicante_desc")}</p>
                </div>
                <div>
                  <div className="flex items-start gap-2 text-slate-400 text-xs mb-4">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0 text-brand-400" />
                    Alfaz del Pi, Alicante, Spain
                  </div>
                  <a
                    href="https://maps.google.com/?q=Sporting+Alfaz+del+Pi+cricket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline btn-sm inline-flex items-center gap-1"
                  >
                    <MapPin size={12} /> {t("about.directions")} <ExternalLink size={11} />
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
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">{t("about.leadership_tag")}</p>
            <h2 className="text-4xl font-display font-bold text-white">{t("about.leadership_title")}</h2>
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
            <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a1535] flex items-center justify-center">
              <div className="text-center p-2">
                <Trophy size={32} className="text-gold-400 mx-auto mb-1" />
                <p className="text-[8px] text-white font-bold leading-tight">FEDERACIÓN ESPAÑOLA DE CRICKET</p>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-1">{t("about.fed_tag")}</p>
              <h3 className="text-2xl font-display font-bold text-white mb-2">{t("about.fed_title")}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{t("about.fed_desc")}</p>
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
          <h2 className="text-3xl font-display font-bold text-white mb-4">{t("about.join_title")}</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            {t("about.getinvolved_desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join"    className="btn-gold btn-lg"><Users size={18} /> {t("about.join_cta")}</Link>
            <Link href="/contact" className="btn-outline btn-lg">{t("about.contact_cta")}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
