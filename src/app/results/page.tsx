"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EVENTS } from "@/lib/mock-data";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

function resultClass(r: string) {
  if (r === "won") return "text-gold-400";
  if (r === "lost") return "text-red-400";
  return "text-slate-400";
}

export default function ResultsPage() {
  const { t } = useLanguage();

  const results = EVENTS
    .filter((e) => e.status === "completed" && e.result)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const won = results.filter((e) => e.result?.result === "won").length;
  const lost = results.filter((e) => e.result?.result === "lost").length;

  const byComp: Record<string, typeof results> = {};
  for (const r of results) {
    const key = r.competition || "Other";
    if (!byComp[key]) byComp[key] = [];
    byComp[key].push(r);
  }

  const resultLabel = (r: string) => {
    if (r === "won") return t("results.won").toUpperCase();
    if (r === "lost") return t("results.lost").toUpperCase();
    return t("results.drawn").toUpperCase();
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-28 pb-12 px-4" style={{ background: "linear-gradient(135deg, #1a0505 0%, #120808 100%)" }}>
        <div className="container-wide">
          <p className="text-brand-400 text-xs uppercase tracking-widest mb-2">{t("results.season")}</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">{t("results.title")}</h1>
          <p className="text-slate-400 max-w-xl">{t("results.desc")}</p>
        </div>
      </section>

      <div className="px-4 py-5 border-b border-white/[0.06]" style={{ background: "#1a0505" }}>
        <div className="container-wide flex flex-wrap gap-3">
          <div className="badge-slate px-4 py-2 text-sm">{results.length} {t("results.season").includes("2026") ? "Played" : "Jugados"}</div>
          <div className="badge-gold px-4 py-2 text-sm">{won} {t("results.won")}</div>
          <div className="badge-red px-4 py-2 text-sm">{lost} {t("results.lost")}</div>
        </div>
      </div>

      <section className="section px-4" style={{ background: "#120808" }}>
        <div className="container-wide max-w-4xl space-y-10">
          {Object.entries(byComp).map(([comp, matches]) => (
            <div key={comp}>
              <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-brand-600 rounded-full inline-block" />
                {comp}
              </h2>
              <div className="space-y-3">
                {matches.map((event) => (
                  <div key={event.id} className="glass-dark p-5 flex flex-wrap gap-4 items-start">
                    <div className="w-14 text-center flex-shrink-0">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">
                        {new Date(event.date).toLocaleString("en", { month: "short" })}
                      </div>
                      <div className="text-2xl font-bold text-white leading-none">
                        {new Date(event.date).getDate()}
                      </div>
                    </div>

                    <div className="w-14 text-center flex-shrink-0">
                      <div className={`text-lg font-display font-bold ${resultClass(event.result!.result)}`}>
                        {resultLabel(event.result!.result)}
                      </div>
                      {event.result?.margin && (
                        <p className="text-slate-500 text-[10px] leading-tight">by {event.result.margin}</p>
                      )}
                    </div>

                    <div className="flex-1 min-w-[180px]">
                      <h3 className="text-white font-semibold text-sm mb-1">{event.title}</h3>
                      {event.venue && (
                        <p className="text-slate-500 text-xs flex items-center gap-1 mb-2">
                          <MapPin size={10} /> {event.venue.name}
                        </p>
                      )}
                      <div className="flex items-center gap-5 flex-wrap">
                        <div>
                          <p className="text-2xl font-display font-bold text-white">{event.result?.our_score}</p>
                          <p className="text-[10px] text-slate-500">MCC</p>
                        </div>
                        <div className="text-slate-600 text-sm font-bold">vs</div>
                        <div>
                          <p className="text-2xl font-display font-bold text-slate-300">{event.result?.opposition_score}</p>
                          <p className="text-[10px] text-slate-500">{event.opponent || "Opponent"}</p>
                        </div>
                        {event.result?.overs && (
                          <p className="text-slate-500 text-xs">({event.result.overs} ov)</p>
                        )}
                      </div>
                      {event.result?.summary && (
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed border-l-2 border-brand-700 pl-2">
                          {event.result.summary}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-900/30 text-brand-400 border border-brand-800/40 font-medium uppercase">
                        {event.format === "40_over" ? "40 Ov" : event.format === "t20" ? "T20" : event.format === "t10" ? "T10" : event.format}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="glass-dark p-5 opacity-40 border border-dashed border-white/[0.1]">
            <p className="text-slate-500 text-sm text-center">{t("results.more_note")}</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
