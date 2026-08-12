"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { imgSrc } from "@/lib/imgSrc";
import { Trophy, Users, MapPin, ChevronRight, ChevronDown, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const upcomingEvents = [
  { month: "Aug", day: "28", title: "Spanish Under-18 Championship", location: "Menorca Cricket Club, Biniparrell, Illes Balears", type: "tournament" },
  { month: "Sep", day: "6",  title: "Senior Net Practice", time: "10am – 1pm", location: "Av. Complutense, Moncloa-Aravaca, Madrid", type: "training" },
  { month: "Sep", day: "9",  title: "Net Practice",        time: "6pm – 8pm",  location: "Av. Complutense, Moncloa-Aravaca, Madrid", type: "training" },
  { month: "Sep", day: "18", title: "Junior Cricket",      time: "6pm – 8pm",  location: "Centro Deportivo Municipal La Elipa, Moratalaz", type: "junior" },
];

const recentResults = [
  { date: "19 Jul 2026", competition: "ECCL 40 Overs 2026", opponent: "La Manga Torrevieja CC", score: "272/10 (37.4 ov)", result: "Won by 26 Runs",   won: true  },
  { date: "21 Jun 2026", competition: "ECCL 40 Overs 2026", opponent: "Sporting Alfas CC",      score: "246/10 (39 ov)",  result: "Lost by 8 Wickets", won: false },
  { date: "20 Jun 2026", competition: "ECCL T20 2026",       opponent: "Sporting Alfas CC",      score: "191/9 (20 ov)",   result: "Lost by 61 Runs",   won: false },
  { date: "30 May 2026", competition: "ECCL T20 2026",       opponent: "La Manga Torrevieja CC", score: "216/8 (20 ov)",   result: "Won by 72 Runs",    won: true  },
];

const socialPosts = [
  { image: "/images/real/mcc-ecn-lineup.jpg",    caption: "ECS T10 Tournament coming to Madrid this October: all matches live streamed on ECN! 🏏", date: "12 August 2026", likes: 68 },
  { image: "/images/real/mcc-juniors.jpg",        caption: "Youth & Junior Squad showing incredible form in regional competition 🏆",                date: "5 August 2026",  likes: 54 },
  { image: "/images/real/mcc-batting-cages.jpg",  caption: "Weekly training sessions under way at CDM La Elipa municipal sports ground 🏏",         date: "28 July 2026",   likes: 42 },
];

export default function HomePage() {
  const { t } = useLanguage();

  const eventTypeLabel = (type: string) => {
    if (type === "tournament") return t("home.tournament_type");
    if (type === "junior")     return t("home.junior_type");
    return t("home.training_type");
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imgSrc("/images/real/mcc-team-alicante.jpg")})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#120808]/95 via-[#120808]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120808]/80 via-transparent to-[#1a0505]/40" />
        </div>
        <div className="relative z-10 container-wide px-6 pb-20 w-full">
          <div className="max-w-xl animate-fade-up">
            <p className="text-gold-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">{t("home.hero.tag")}</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              Madrid<br /><span className="gradient-text-gold">Cricket Club</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-md mb-8">{t("home.hero.subtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/join"     className="btn-primary btn-lg">{t("home.hero.join")}</Link>
              <Link href="/fixtures" className="btn-outline btn-lg">{t("home.hero.fixtures")}</Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 animate-float opacity-40">
          <div className="w-px h-6 bg-gradient-to-b from-transparent to-red-600/60" />
          <ChevronDown size={16} className="text-red-500" />
        </div>
      </section>

      {/* Latest Result bar */}
      <section className="py-8 px-4" style={{ background: "linear-gradient(135deg, #1a0505 0%, #200808 100%)" }}>
        <div className="container-wide">
          <div className="flex flex-wrap items-center gap-6 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Trophy size={18} className="text-gold-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest">{t("home.result.label")}: ECCL 40 Overs</p>
                <p className="text-white font-bold text-sm">
                  MCC 272/10 vs La Manga Torrevieja CC 246/9:{" "}
                  <span className="text-gold-400">{t("home.result.won")} by 26 Runs</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center">
                <Star size={18} className="text-brand-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-widest">{t("home.25th_anniversary")}</p>
                <p className="text-white font-bold text-sm">{t("home.25th_desc")}</p>
              </div>
            </div>
            <Link href="/results" className="btn-gold btn-sm whitespace-nowrap">{t("home.full_results")} →</Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section px-4" style={{ background: "#120808" }}>
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-brand-400 text-xs uppercase tracking-widest mb-1">{t("home.whats_on")}</p>
              <h2 className="text-3xl font-display font-bold text-white">{t("home.upcoming_events")}</h2>
            </div>
            <Link href="/fixtures" className="btn-ghost text-sm flex items-center gap-1">
              {t("home.all_fixtures")} <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingEvents.map((e) => (
              <div key={e.title} className="glass-dark card-hover p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-14 rounded-lg bg-brand-600/20 border border-brand-600/30 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-brand-400 text-[10px] uppercase tracking-wide font-semibold">{e.month}</span>
                    <span className="text-white text-xl font-bold leading-none">{e.day}</span>
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      e.type === "tournament" ? "bg-gold-500/20 text-gold-400" :
                      e.type === "junior"     ? "bg-blue-500/20 text-blue-300" :
                                                "bg-brand-600/20 text-brand-300"
                    }`}>{eventTypeLabel(e.type)}</span>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{e.title}</h3>
                {"time" in e && e.time && <p className="text-slate-400 text-xs mb-1">{e.time}</p>}
                <p className="text-slate-500 text-xs flex items-start gap-1">
                  <MapPin size={10} className="mt-0.5 flex-shrink-0 text-brand-500" />{e.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Strip — 25 years, not 50 */}
      <section className="py-16 px-4" style={{ background: "linear-gradient(135deg, #1a0505, #120808)" }}>
        <div className="container-wide grid md:grid-cols-3 gap-8">
          <div className="glass-dark p-6 text-center card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center mx-auto mb-4">
              <Trophy size={24} className="text-brand-400" />
            </div>
            <h3 className="text-white font-display font-bold text-lg mb-2">{t("home.25years")}</h3>
            <p className="text-slate-400 text-sm">{t("home.25years_desc")}</p>
          </div>
          <div className="glass-dark p-6 text-center card-hover">
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-gold-400" />
            </div>
            <h3 className="text-white font-display font-bold text-lg mb-2">{t("home.multicultural_h")}</h3>
            <p className="text-slate-400 text-sm">{t("home.multicultural_d")}</p>
          </div>
          <div className="glass-dark p-6 text-center card-hover">
            <div className="w-12 h-12 rounded-xl bg-brand-600/20 flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-brand-300" />
            </div>
            <h3 className="text-white font-display font-bold text-lg mb-2">{t("home.community")}</h3>
            <p className="text-slate-400 text-sm">{t("home.community_desc")}</p>
          </div>
        </div>
      </section>

      {/* Recent Results */}
      <section className="section px-4" style={{ background: "#120808" }}>
        <div className="container-wide">
          <div className="mb-8">
            <p className="text-brand-400 text-xs uppercase tracking-widest mb-1">{t("home.season")}</p>
            <h2 className="text-3xl font-display font-bold text-white">{t("home.recent_results")}</h2>
          </div>
          <div className="space-y-3">
            {recentResults.map((r) => (
              <div key={r.date} className="glass-dark p-4 sm:p-5 flex flex-wrap items-center gap-4">
                <div className="text-xs text-slate-500 w-24 flex-shrink-0">{r.date}</div>
                <div className="flex-1 min-w-[200px]">
                  <p className="text-slate-400 text-xs">{r.competition}</p>
                  <p className="text-white font-medium text-sm">MCC vs {r.opponent}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{r.score}</p>
                  <p className={`text-sm font-bold ${r.won ? "text-gold-400" : "text-red-400"}`}>{r.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="section px-4" style={{ background: "linear-gradient(to bottom, #120808, #1a0505)" }}>
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-brand-400 text-xs uppercase tracking-widest mb-1">{t("home.social_label")}</p>
              <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
                <InstagramIcon /> @madridcricketclub
              </h2>
            </div>
            <a href="https://www.instagram.com/madridcricketclub" target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
              {t("home.follow_us")}
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialPosts.map((p) => (
              <a key={p.date} href="https://www.instagram.com/madridcricketclub" target="_blank" rel="noopener noreferrer" className="glass-dark overflow-hidden card-hover group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgSrc(p.image)} alt={p.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120808]/70 to-transparent" />
                </div>
                <div className="p-4">
                  <p className="text-slate-300 text-xs line-clamp-2 mb-2">{p.caption}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs">{p.date}</span>
                    <span className="text-gold-400 text-xs">♥ {p.likes}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section px-4 text-center" style={{ background: "linear-gradient(135deg, #330000 0%, #1a0505 100%)" }}>
        <div className="container-content">
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            {t("home.cta_title")}
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">{t("home.cta_sub")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/join"    className="btn-primary btn-lg">{t("nav.join_cta")}</Link>
            <Link href="/contact" className="btn-outline btn-lg">{t("home.cta_contact")}</Link>
          </div>
          <p className="text-slate-500 text-sm mt-6">
            {t("home.cta_questions")}{" "}
            <a href="mailto:jonwoodward1975@gmail.com" className="text-brand-400 hover:underline">jonwoodward1975@gmail.com</a>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
