import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { EVENTS, NEWS, SEASON_STATS } from "@/lib/mock-data";
import { formatDateShort, resultClass, resultLabel, truncate } from "@/lib/utils";
import { ArrowRight, Calendar, Trophy, Users, MapPin, Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Madrid Cricket Club — Cricket in the Heart of Spain",
  description: "Madrid Cricket Club competes in the Liga Nacional División 2. Join our community of cricketers in Madrid — all abilities welcome.",
};

export default function HomePage() {
  const upcomingFixtures = EVENTS.filter((e) => e.status === "scheduled" && e.type === "match").slice(0, 3);
  const latestNews = NEWS.slice(0, 3);
  const recentResults = EVENTS.filter((e) => e.status === "completed" && e.result).slice(0, 4);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Madrid Cricket Club ground at sunset"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent" />
        </div>

        {/* Floating cricket ball decoration */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl animate-pulse-slow animate-delay-300" />

        {/* Content */}
        <div className="relative z-10 container-wide px-4 pt-24 pb-20 text-center lg:text-left">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge-gold px-4 py-2 mb-6 animate-fade-up">
              <Star size={12} />
              <span>Liga Nacional División 2 · Madrid, Spain</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4 animate-fade-up animate-delay-100 leading-none">
              Madrid Cricket Club
            </h1>
            <p className="text-xl md:text-2xl gradient-text font-medium mb-6 animate-fade-up animate-delay-200">
              Cricket in the Heart of Spain
            </p>
            <p className="text-slate-300 text-lg max-w-xl mb-10 animate-fade-up animate-delay-300 leading-relaxed">
              Competing in the Liga Nacional División 2 since 2008. A welcoming, multicultural club for players of all abilities.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up animate-delay-400">
              <Link href="/join" className="btn-gold btn-lg">
                Join the Club
                <ArrowRight size={18} />
              </Link>
              <Link href="/fixtures" className="btn-outline btn-lg">
                <Calendar size={18} />
                View Fixtures
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Season Stats ── */}
      <section className="bg-slate-950 py-12 -mt-1">
        <div className="container-wide px-4">
          <div className="glass border border-brand-800/30 p-6 md:p-8 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0">
              {/* Logo */}
              <div className="flex items-center gap-4 md:border-r border-white/10 md:pr-8 md:mr-8">
                <Image src="/images/logo.png" alt="MCC Logo" width={64} height={64} className="rounded-full" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">2026 Season</p>
                  <p className="text-white font-bold text-lg">Division 2 — Spain</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="flex flex-1 flex-wrap justify-center md:justify-start gap-8">
                {[
                  { label: "Played", value: SEASON_STATS.played },
                  { label: "Won", value: SEASON_STATS.won, color: "text-brand-400" },
                  { label: "Lost", value: SEASON_STATS.lost, color: "text-red-400" },
                  { label: "Position", value: `P${SEASON_STATS.position}`, color: "text-gold-400" },
                  { label: "NRR", value: SEASON_STATS.nrr, color: "text-brand-300" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-3xl font-bold font-display ${stat.color || "text-white"}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Upcoming Fixtures ── */}
      <section className="section bg-slate-950">
        <div className="container-wide px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-2">Schedule</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
                Upcoming Fixtures
              </h2>
            </div>
            <Link href="/fixtures" className="btn-ghost hidden sm:flex items-center gap-2">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {upcomingFixtures.length === 0 ? (
            <p className="text-slate-400">No upcoming fixtures scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingFixtures.map((event, i) => (
                <FixtureCard key={event.id} event={event} index={i} />
              ))}
            </div>
          )}

          <div className="sm:hidden mt-6">
            <Link href="/fixtures" className="btn-outline w-full justify-center">
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recent Results ── */}
      <section className="section bg-slate-900/30">
        <div className="container-wide px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-2">Performance</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Recent Results</h2>
            </div>
            <Link href="/results" className="btn-ghost hidden sm:flex items-center gap-2">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentResults.map((event) => (
              <div key={event.id} className="glass-dark p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 card-hover">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-sm font-bold ${resultClass(event.result!.result)}`}>
                      {resultLabel(event.result!.result)}
                    </span>
                    {event.result?.margin && (
                      <span className="text-slate-400 text-sm">by {event.result.margin}</span>
                    )}
                  </div>
                  <p className="text-white font-semibold">{event.title}</p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    <Calendar size={12} className="inline mr-1" />
                    {formatDateShort(event.date)}
                    {event.venue && (
                      <> · <MapPin size={12} className="inline ml-2 mr-1" />{event.venue.name}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-6 sm:gap-8 text-center">
                  <div>
                    <div className="text-white font-bold text-lg">{event.result?.our_score}</div>
                    <div className="text-slate-500 text-xs">MCC</div>
                  </div>
                  <div className="text-slate-600 text-sm font-bold">vs</div>
                  <div>
                    <div className="text-slate-300 font-bold text-lg">{event.result?.opposition_score}</div>
                    <div className="text-slate-500 text-xs">{event.opponent}</div>
                  </div>
                  {event.result?.cricclubs_link && (
                    <Link href={`/results/${event.id}`} className="btn-outline btn-sm whitespace-nowrap">
                      Scorecard
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest News ── */}
      <section className="section bg-slate-950">
        <div className="container-wide px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-2">Club News</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
                Latest News
              </h2>
            </div>
            <Link href="/news" className="btn-ghost hidden sm:flex items-center gap-2">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map((article, i) => (
              <NewsCard key={article.id} article={article} featured={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Join CTA ── */}
      <section className="section bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-300 rounded-full blur-3xl" />
        </div>

        <div className="container-wide px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <Image src="/images/logo.png" alt="MCC" width={56} height={56} className="rounded-full" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 text-balance">
            Ready to Play Cricket in Madrid?
          </h2>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            All abilities welcome — senior and junior. Join over 60 players from 14 nationalities competing in the Liga Nacional.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/join" className="btn-gold btn-lg">
              Join the Club <ArrowRight size={18} />
            </Link>
            <Link href="/about" className="btn-outline btn-lg">
              <Users size={18} />
              Learn About Us
            </Link>
          </div>

          {/* Perks */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Trophy, label: "Liga Nacional Cricket" },
              { icon: Users, label: "All Abilities Welcome" },
              { icon: MapPin, label: "Madrid & Away Trips" },
              { icon: Star, label: "Junior Programme" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="glass p-4 text-center">
                <Icon size={24} className="text-brand-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FixtureCard({ event, index }: { event: any; index: number }) {
  return (
    <Link
      href={`/fixtures#${event.id}`}
      className={`glass-dark p-6 card-hover block animate-fade-up`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={`badge ${event.is_home ? "badge-green" : "badge-slate"}`}>
          {event.is_home ? "Home" : "Away"}
        </span>
        {event.format && (
          <span className="text-xs text-slate-500 font-medium">{event.format.replace("_", "-")}</span>
        )}
      </div>

      {/* Match */}
      <h3 className="text-white font-display font-bold text-lg mb-1">
        {event.opponent || event.title}
      </h3>
      <p className="text-slate-400 text-sm mb-4">{event.competition}</p>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Calendar size={14} className="text-brand-400" />
          {formatDateShort(event.date)}
          {event.start_time && ` · ${event.start_time}`}
        </div>
        {event.venue && (
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <MapPin size={14} className="text-brand-400" />
            {event.venue.name}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Availability deadline: {event.availability_deadline ? formatDateShort(event.availability_deadline) : "TBC"}
        </span>
        <ArrowRight size={16} className="text-brand-400" />
      </div>
    </Link>
  );
}

function NewsCard({ article, featured }: { article: any; featured?: boolean }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="glass-dark card-hover flex flex-col overflow-hidden group"
    >
      {article.hero_image_url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={article.hero_image_url}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          {article.is_match_report && (
            <span className="absolute bottom-3 left-3 badge badge-green text-xs">Match Report</span>
          )}
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-slate-500 text-xs mb-2">
          {formatDateShort(article.published_at)}
        </p>
        <h3 className="text-white font-display font-bold text-base mb-2 leading-snug group-hover:text-brand-300 transition-colors">
          {article.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed flex-1">
          {truncate(article.excerpt, 120)}
        </p>
        <div className="mt-4 flex items-center gap-1 text-brand-400 text-sm font-medium">
          Read more <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
