import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { EVENTS } from "@/lib/mock-data";
import { formatDate, resultClass, resultLabel } from "@/lib/utils";
import { MapPin, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Results",
  description: "Madrid Cricket Club match results and scorecards — 2026 Liga Nacional División 2 season.",
};

export default function ResultsPage() {
  const results = EVENTS.filter((e) => e.status === "completed" && e.result);

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-wide px-4">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">Performance</p>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Results</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            2026 Liga Nacional División 2 season results and scorecards.
          </p>
        </div>
      </section>

      <section className="section bg-slate-950">
        <div className="container-wide px-4">

          {/* Summary pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            {[
              { label: "Played", value: results.length, cls: "badge-slate" },
              { label: "Won", value: results.filter((e) => e.result?.result === "won").length, cls: "badge-green" },
              { label: "Lost", value: results.filter((e) => e.result?.result === "lost").length, cls: "badge-red" },
              { label: "Draw", value: results.filter((e) => e.result?.result === "draw").length, cls: "badge-gold" },
            ].map((s) => (
              <div key={s.label} className={`badge ${s.cls} px-4 py-2 text-sm`}>
                {s.value} {s.label}
              </div>
            ))}
          </div>

          {results.length === 0 ? (
            <p className="text-slate-400">No results yet.</p>
          ) : (
            <div className="space-y-5">
              {results.map((event) => (
                <div key={event.id} className="glass-dark p-6 card-hover">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Result badge */}
                    <div className="md:w-28 shrink-0">
                      <div className={`text-2xl font-display font-bold ${resultClass(event.result!.result)}`}>
                        {resultLabel(event.result!.result)}
                      </div>
                      {event.result?.margin && (
                        <p className="text-slate-400 text-sm">by {event.result.margin}</p>
                      )}
                    </div>

                    {/* Scores */}
                    <div className="flex-1">
                      <h3 className="text-white font-display font-bold text-xl mb-1">{event.title}</h3>
                      <p className="text-slate-400 text-sm mb-3">
                        {formatDate(event.date, "en", "d MMMM yyyy")}
                        {event.venue && (
                          <>
                            {" · "}
                            <MapPin size={12} className="inline mr-0.5" />
                            {event.venue.name}
                          </>
                        )}
                        {event.competition && ` · ${event.competition}`}
                      </p>

                      {/* Score display */}
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-3xl font-display font-bold text-white">{event.result?.our_score}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Madrid CC</p>
                        </div>
                        <div className="text-slate-600 font-bold text-sm">vs</div>
                        <div>
                          <p className="text-3xl font-display font-bold text-slate-300">{event.result?.opposition_score}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{event.opponent}</p>
                        </div>
                        {event.result?.overs && (
                          <div className="text-slate-500 text-sm ml-4">({event.result.overs} ov)</div>
                        )}
                      </div>

                      {event.result?.summary && (
                        <p className="text-slate-300 text-sm mt-4 leading-relaxed border-l-2 border-brand-700 pl-3">
                          {event.result.summary}
                        </p>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link href={`/results/${event.id}`} className="btn-primary btn-sm">
                        Full Scorecard
                      </Link>
                      {event.result?.cricclubs_link && (
                        <a
                          href={event.result.cricclubs_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline btn-sm flex items-center gap-1"
                        >
                          CricClubs <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
