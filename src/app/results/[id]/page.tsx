import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { EVENTS } from "@/lib/mock-data";
import { formatDate, resultClass, resultLabel } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  return EVENTS.filter((e) => e.status === "completed").map((e) => ({ id: e.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const event = EVENTS.find((e) => e.id === params.id);
  if (!event) return { title: "Match Not Found" };
  return {
    title: event.title,
    description: event.result?.summary || `${event.title} — Madrid Cricket Club`,
  };
}

export default function MatchDetailPage({ params }: Props) {
  const event = EVENTS.find((e) => e.id === params.id);
  if (!event || !event.result) notFound();

  const { result } = event;

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-10 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-content px-4">
          <Link href="/results" className="btn-ghost btn-sm mb-6 -ml-2">
            <ArrowLeft size={16} /> Back to Results
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`badge text-sm ${result.result === "won" ? "badge-green" : result.result === "lost" ? "badge-red" : "badge-gold"}`}>
              {resultLabel(result.result)}
              {result.margin && ` · by ${result.margin}`}
            </span>
            {event.competition && <span className="badge badge-slate">{event.competition}</span>}
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">{event.title}</h1>

          <div className="flex flex-wrap gap-5 text-slate-400 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-brand-400" />
              {formatDate(event.date, "en", "d MMMM yyyy")}
            </span>
            {event.venue && (
              <a
                href={event.venue.map_link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <MapPin size={14} className="text-brand-400" />
                {event.venue.name}
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="section bg-slate-950">
        <div className="container-content px-4">

          {/* Scoreboard */}
          <div className="glass-dark p-8 mb-8 text-center">
            <div className="flex items-center justify-center gap-8 md:gap-16">
              <div>
                <div className="text-5xl font-display font-bold text-white">{result.our_score}</div>
                <div className="text-slate-400 mt-1 font-medium">Madrid CC</div>
              </div>
              <div className="text-center">
                <div className="text-slate-600 text-sm font-bold mb-1">vs</div>
                {result.overs && <div className="text-slate-500 text-xs">{result.overs} overs</div>}
                <div className={`text-2xl font-display font-bold mt-2 ${resultClass(result.result)}`}>
                  {resultLabel(result.result)}
                </div>
              </div>
              <div>
                <div className="text-5xl font-display font-bold text-slate-300">{result.opposition_score}</div>
                <div className="text-slate-400 mt-1 font-medium">{event.opponent}</div>
              </div>
            </div>
          </div>

          {/* Match summary */}
          {result.summary && (
            <div className="glass-dark p-6 mb-8">
              <h2 className="text-xl font-display font-bold text-white mb-3">Match Report</h2>
              <p className="text-slate-300 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* External links */}
          {result.cricclubs_link && (
            <div className="glass-dark p-5 mb-8 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Official Scorecard</p>
                <p className="text-slate-400 text-sm">Full scorecard on CricClubs</p>
              </div>
              <a
                href={result.cricclubs_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline btn-sm"
              >
                View on CricClubs <ExternalLink size={13} />
              </a>
            </div>
          )}

          {/* Scorecard images */}
          {event.scorecard?.images && event.scorecard.images.length > 0 && (
            <div className="glass-dark p-6">
              <h2 className="text-xl font-display font-bold text-white mb-4">Scorebook</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.scorecard.images.map((img) => (
                  <div key={img.id} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-800">
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      Scorecard image would appear here
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Umpires / scorers */}
          {(result.umpires || result.scorers) && (
            <div className="mt-6 text-slate-500 text-sm">
              {result.umpires && <p>Umpires: {result.umpires}</p>}
              {result.scorers && <p>Scorers: {result.scorers}</p>}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
