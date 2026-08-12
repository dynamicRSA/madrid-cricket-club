import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { EVENTS } from "@/lib/mock-data";
import { formatDate, formatTime } from "@/lib/utils";
import { Calendar, MapPin, Clock, ArrowRight, Filter } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fixtures",
  description: "Madrid Cricket Club fixture list — 2026 Liga Nacional División 2 season schedule.",
};

export default function FixturesPage() {
  const matches = EVENTS.filter((e) => e.type === "match");
  const upcoming = matches.filter((e) => e.status === "scheduled");
  const past = matches.filter((e) => e.status !== "scheduled");
  const nets = EVENTS.filter((e) => e.type === "nets");

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-wide px-4">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">2026 Season</p>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Fixtures</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Liga Nacional División 2 matches and training sessions. Log in to set your availability.
          </p>
        </div>
      </section>

      <section className="section bg-slate-950">
        <div className="container-wide px-4">

          {/* Upcoming Matches */}
          <div className="mb-14">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-400 inline-block" />
              Upcoming Fixtures
            </h2>
            <div className="space-y-4">
              {upcoming.map((event) => (
                <div key={event.id} id={event.id} className="glass-dark p-5 md:p-6 card-hover">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Date block */}
                    <div className="w-20 h-20 rounded-2xl bg-brand-900/50 border border-brand-700/40 flex flex-col items-center justify-center shrink-0">
                      <span className="text-2xl font-bold font-display text-white">
                        {new Date(event.date).getDate()}
                      </span>
                      <span className="text-xs text-brand-300 font-semibold uppercase">
                        {new Date(event.date).toLocaleString("en", { month: "short" })}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`badge ${event.is_home ? "badge-green" : "badge-slate"}`}>
                          {event.is_home ? "Home" : "Away"}
                        </span>
                        {event.competition && (
                          <span className="badge badge-gold">{event.competition}</span>
                        )}
                        {event.format && (
                          <span className="badge badge-slate">{event.format.replace("_", "-over ")}</span>
                        )}
                      </div>
                      <h3 className="text-white font-display font-bold text-xl">{event.title}</h3>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                        <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                          <Clock size={13} className="text-brand-400" />
                          {event.meet_time && `Meet ${formatTime(event.meet_time)} · `}
                          Start {event.start_time ? formatTime(event.start_time) : "TBC"}
                        </span>
                        {event.venue && (
                          <a
                            href={event.venue.map_link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                          >
                            <MapPin size={13} className="text-brand-400" />
                            {event.venue.name}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-3">
                      {event.availability_deadline && (
                        <div className="text-center">
                          <p className="text-xs text-slate-500 mb-0.5">Availability by</p>
                          <p className="text-sm text-slate-300 font-medium">
                            {formatDate(event.availability_deadline, "en", "d MMM")}
                          </p>
                        </div>
                      )}
                      <Link href="/auth/signin" className="btn-primary btn-sm whitespace-nowrap">
                        Set Availability
                      </Link>
                    </div>
                  </div>

                  {event.notes && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                      <p className="text-slate-400 text-sm">{event.notes}</p>
                    </div>
                  )}
                </div>
              ))}
              {upcoming.length === 0 && (
                <p className="text-slate-400 py-8 text-center">No upcoming fixtures scheduled.</p>
              )}
            </div>
          </div>

          {/* Nets */}
          <div className="mb-14">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-gold-400 inline-block" />
              Training / Nets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nets.map((event) => (
                <div key={event.id} className="glass-dark p-4 card-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gold-900/40 border border-gold-700/30 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-white">{new Date(event.date).getDate()}</span>
                      <span className="text-xs text-gold-400">{new Date(event.date).toLocaleString("en", { month: "short" })}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-slate-400 text-sm">
                        {event.start_time} · {event.venue?.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Fixtures */}
          {past.length > 0 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                Completed Fixtures
              </h2>
              <div className="space-y-3">
                {past.map((event) => (
                  <div key={event.id} className="glass-dark p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm mb-0.5">{formatDate(event.date, "en", "d MMMM yyyy")}</p>
                      <p className="text-white font-semibold">{event.title}</p>
                      {event.venue && (
                        <p className="text-slate-500 text-sm">
                          <MapPin size={12} className="inline mr-1" />{event.venue.name}
                        </p>
                      )}
                    </div>
                    {event.result && (
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <span className={`text-sm font-bold ${event.result.result === "won" ? "text-brand-400" : event.result.result === "lost" ? "text-red-400" : "text-gold-400"}`}>
                            {event.result.result.toUpperCase()}
                          </span>
                          <div className="text-slate-300 text-sm">{event.result.our_score} vs {event.result.opposition_score}</div>
                        </div>
                        <Link href={`/results/${event.id}`} className="btn-outline btn-sm">
                          Scorecard <ArrowRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* iCal subscription */}
      <section className="py-10 bg-slate-900/40">
        <div className="container-wide px-4">
          <div className="glass-dark p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-900/50 flex items-center justify-center">
                <Calendar size={22} className="text-brand-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Subscribe to Calendar</p>
                <p className="text-slate-400 text-sm">Add MCC fixtures to your phone or desktop calendar</p>
              </div>
            </div>
            <a href="/api/calendar.ics" className="btn-outline btn-sm whitespace-nowrap">
              Subscribe (iCal)
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
