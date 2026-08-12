"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EVENTS } from "@/lib/mock-data";
import { MapPin, Clock, Users, Info, Radio } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function FixturesPage() {
  const { t } = useLanguage();

  const upcoming = EVENTS
    .filter((e) => e.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const typeConfig: Record<string, { label: () => string; className: string }> = {
    match:      { label: () => t("fixtures.type.match"),      className: "bg-brand-600/20 text-brand-300 border border-brand-600/30" },
    nets:       { label: () => t("fixtures.type.training"),   className: "bg-gold-500/20 text-gold-400 border border-gold-500/30" },
    tournament: { label: () => t("fixtures.type.tournament"), className: "bg-purple-500/20 text-purple-300 border border-purple-500/30" },
  };

  const formatLabel: Record<string, string> = {
    "40_over": "40 Overs",
    "t20": "T20",
    "t10": "T10",
  };

  const MEMBERS_ONLY_TYPES = ["nets", "match", "tournament"];

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-28 pb-12 px-4" style={{ background: "linear-gradient(135deg, #1a0505 0%, #120808 100%)" }}>
        <div className="container-wide">
          <p className="text-brand-400 text-xs uppercase tracking-widest mb-2">{t("fixtures.season")}</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">{t("fixtures.title")}</h1>
          <p className="text-slate-400 max-w-xl">{t("fixtures.desc")}</p>
        </div>
      </section>

      <div className="px-4 py-4 border-b border-white/[0.06]" style={{ background: "#1a0505" }}>
        <div className="container-wide flex flex-wrap gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-brand-400" />
            <span><strong className="text-slate-300">{t("fixtures.ground.madrid")}:</strong> Centro Deportivo La Elipa, Moratalaz</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-brand-400" />
            <span><strong className="text-slate-300">{t("fixtures.ground.coastal")}:</strong> Sporting Alfaz Cricket Ground, Alicante</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3" style={{ background: "#1a0505" }}>
        <div className="container-wide">
          <div className="glass-dark p-4 flex flex-wrap gap-4 items-center border border-brand-700/30">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-brand-400 animate-pulse" />
              <span className="text-brand-300 text-xs font-semibold uppercase tracking-widest">{t("fixtures.ecs.coming")}</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">ECS T10 Tournament in Madrid — 19 October 2026</p>
              <p className="text-slate-400 text-xs">{t("fixtures.ecs.desc")}</p>
            </div>
            <span className="badge-gold text-xs">Live on ECN</span>
          </div>
        </div>
      </div>

      <section className="section px-4" style={{ background: "#120808" }}>
        <div className="container-wide max-w-4xl space-y-3">
          {upcoming.map((e) => {
            const cfg = typeConfig[e.type] || typeConfig.match;
            const d = new Date(e.date);
            return (
              <div key={e.id} className="glass-dark p-5 flex flex-wrap gap-4 items-start">
                <div className="w-14 text-center flex-shrink-0">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">
                    {d.toLocaleString("en", { month: "short" })}
                  </div>
                  <div className="text-2xl font-bold text-white leading-none">{d.getDate()}</div>
                  <div className="text-[10px] text-slate-600">{d.getFullYear()}</div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-white font-semibold text-sm">{e.title}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                      {cfg.label()}
                    </span>
                    {e.format && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-900/30 text-brand-400 border border-brand-800/40">
                        {formatLabel[e.format] || e.format}
                      </span>
                    )}
                    {e.team === "juniors" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-300 border border-purple-800/40">{t("fixtures.type.junior")}</span>
                    )}
                    {e.id === "e-ecs-oct" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center gap-1">
                        <Radio size={8} /> Live on ECN
                      </span>
                    )}
                  </div>

                  {e.competition && <p className="text-slate-500 text-xs mb-1.5">{e.competition}</p>}

                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {e.start_time && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {e.start_time}{e.meet_time ? ` (meet ${e.meet_time})` : ""}
                      </span>
                    )}
                    {e.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} className="flex-shrink-0 text-brand-500" /> {e.venue.name}
                      </span>
                    )}
                  </div>

                  {MEMBERS_ONLY_TYPES.includes(e.type) && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gold-500/80">
                      <Users size={10} />
                      <span>{t("fixtures.members_only")} <a href="/join" className="underline hover:text-gold-400">{t("fixtures.members_only_link")}</a> {t("fixtures.members_only_suffix")}</span>
                    </div>
                  )}

                  {e.notes && (
                    <p className="text-slate-500 text-xs mt-1.5 italic leading-relaxed">{e.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="pb-12 px-4 space-y-3" style={{ background: "#120808" }}>
        <div className="container-wide max-w-4xl space-y-3">
          <div className="glass-dark p-4 flex gap-3 items-start border border-gold-500/20">
            <Users size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gold-300 font-semibold text-xs mb-0.5">{t("fixtures.info.training_title")}</p>
              <p className="text-slate-400 text-xs">
                {t("fixtures.info.training_desc")}{" "}
                <a href="/join" className="text-brand-400 hover:underline">{t("fixtures.info.join_link")}</a>{" "}
                {t("fixtures.info.or")}{" "}
                <a href="/contact" className="text-brand-400 hover:underline">{t("fixtures.info.contact_link")}</a>{" "}
                {t("fixtures.info.contact_suffix")}
              </p>
            </div>
          </div>
          <div className="glass-dark p-4 flex gap-3 items-start">
            <Info size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-400 text-xs">
              {t("fixtures.info.updates")}{" "}
              <a href="https://cricketinmadrid.com" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">cricketinmadrid.com</a>{" "}
              {t("fixtures.info.follow")}{" "}
              <a href="https://www.instagram.com/madridcricketclub" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">@madridcricketclub</a>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
