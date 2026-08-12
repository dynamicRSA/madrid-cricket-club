import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Clock, Trophy, Users, Calendar, Info } from "lucide-react";

// ─── Real data from cricketinmadrid.com calendar ─────────────────────────────

const fixtures = [
  {
    id: "u18-menorca-aug26",
    date: "2026-08-28",
    displayDate: "Fri 28 – Sun 30 Aug 2026",
    title: "Spanish Under-18 Championship",
    type: "tournament",
    competition: "Cricket España — Junior",
    location: "Menorca Cricket Club, Camino Biniparrell 55, 07711 Biniparrell, Illes Balears",
    team: "Junior",
    notes: "Full weekend tournament. Travel & accommodation details TBC.",
  },
  {
    id: "senior-net-6sep",
    date: "2026-09-06",
    displayDate: "Sun 6 Sep 2026",
    title: "Senior Net Practice",
    type: "training",
    time: "10:00 – 13:00",
    location: "Madrid Cricket Club, Av. Complutense, Moncloa-Aravaca, 28040 Madrid",
    team: "Senior",
  },
  {
    id: "net-practice-9sep",
    date: "2026-09-09",
    displayDate: "Wed 9 Sep 2026",
    title: "Net Practice",
    type: "training",
    time: "18:00 – 20:00",
    location: "Madrid Cricket Club, Av. Complutense, Moncloa-Aravaca, 28040 Madrid",
    team: "Senior",
  },
  {
    id: "junior-cricket-18sep",
    date: "2026-09-18",
    displayDate: "Fri 18 Sep 2026",
    title: "Junior Cricket",
    type: "training",
    time: "18:00 – 20:00",
    location: "Centro Deportivo Municipal La Elipa, C. del Alcalde Garrido Juaristi 17, Moratalaz, 28030 Madrid",
    team: "Junior",
  },
  {
    id: "senior-net-20sep",
    date: "2026-09-20",
    displayDate: "Sun 20 Sep 2026",
    title: "Senior Net Practice",
    type: "training",
    time: "10:00 – 13:00",
    location: "Madrid Cricket Club, Av. Complutense, Moncloa-Aravaca, 28040 Madrid",
    team: "Senior",
  },
  {
    id: "net-practice-23sep",
    date: "2026-09-23",
    displayDate: "Wed 23 Sep 2026",
    title: "Net Practice",
    type: "training",
    time: "18:00 – 20:00",
    location: "Madrid Cricket Club, Av. Complutense, Moncloa-Aravaca, 28040 Madrid",
    team: "Senior",
  },
  // Placeholder slots
  {
    id: "placeholder-fixture-1",
    date: "2026-10-01",
    displayDate: "Oct 2026 — TBC",
    title: "Fixture — To Be Confirmed",
    type: "placeholder",
    team: "Senior",
    notes: "Details to be added by the committee.",
  },
];

const typeConfig: Record<string, { label: string; className: string; icon: any }> = {
  tournament: { label: "Tournament", className: "bg-gold-500/20 text-gold-400 border border-gold-500/30", icon: Trophy },
  training:   { label: "Training",   className: "bg-brand-600/20 text-brand-300 border border-brand-600/30", icon: Users },
  match:      { label: "Match",      className: "bg-blue-500/20 text-blue-300 border border-blue-500/30", icon: Calendar },
  placeholder:{ label: "TBC",        className: "bg-slate-700/50 text-slate-400 border border-white/[0.1]", icon: Info },
};

const teamConfig: Record<string, string> = {
  Senior: "bg-brand-600/20 text-brand-300",
  Junior: "bg-purple-600/20 text-purple-300",
  Women: "bg-pink-600/20 text-pink-300",
};

export default function FixturesPage() {
  const upcoming = fixtures.filter((f) => f.type !== "placeholder");
  const placeholder = fixtures.filter((f) => f.type === "placeholder");

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-12 px-4" style={{ background: "linear-gradient(135deg, #1a0505 0%, #120808 100%)" }}>
        <div className="container-wide">
          <p className="text-brand-400 text-xs uppercase tracking-widest mb-2">Season 2026</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">Fixtures & Events</h1>
          <p className="text-slate-400 max-w-xl">
            Upcoming matches, net practice sessions, and tournaments for Madrid Cricket Club.
            Sourced from the official club calendar at{" "}
            <a href="https://cricketinmadrid.com" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
              cricketinmadrid.com
            </a>
          </p>
        </div>
      </section>

      {/* Grounds info */}
      <div className="px-4 py-4 border-b border-white/[0.06]" style={{ background: "#1a0505" }}>
        <div className="container-wide flex flex-wrap gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-brand-400" />
            <span><strong className="text-slate-300">Main Ground:</strong> Av. Complutense, Moncloa-Aravaca, 28040 Madrid</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-brand-400" />
            <span><strong className="text-slate-300">Junior Ground:</strong> Centro Deportivo La Elipa, Moratalaz, 28030 Madrid</span>
          </div>
        </div>
      </div>

      {/* Fixtures list */}
      <section className="section px-4" style={{ background: "#120808" }}>
        <div className="container-wide max-w-4xl">

          {/* Upcoming */}
          <h2 className="text-xl font-display font-bold text-white mb-5">Upcoming</h2>
          <div className="space-y-3 mb-10">
            {upcoming.map((f) => {
              const cfg = typeConfig[f.type] || typeConfig.placeholder;
              const Icon = cfg.icon;
              return (
                <div key={f.id} className="glass-dark p-5 flex flex-wrap gap-4 items-center">
                  {/* Date block */}
                  <div className="w-14 text-center flex-shrink-0">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">
                      {f.date.slice(5, 7) === "08" ? "Aug" : f.date.slice(5, 7) === "09" ? "Sep" : "Oct"}
                    </div>
                    <div className="text-2xl font-bold text-white leading-none">
                      {parseInt(f.date.slice(8, 10))}
                    </div>
                    <div className="text-[10px] text-slate-600">{f.date.slice(0, 4)}</div>
                  </div>

                  <div className="flex-1 min-w-[180px]">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm">{f.title}</h3>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                        <span className="flex items-center gap-1"><Icon size={9} /> {cfg.label}</span>
                      </span>
                      {f.team && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${teamConfig[f.team] || "bg-slate-700 text-slate-400"}`}>
                          {f.team}
                        </span>
                      )}
                    </div>
                    {f.competition && <p className="text-slate-500 text-xs mb-1">{f.competition}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      {f.time && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {f.time}
                        </span>
                      )}
                      {f.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} className="flex-shrink-0" /> {f.location}
                        </span>
                      )}
                    </div>
                    {f.notes && <p className="text-slate-500 text-xs mt-1 italic">{f.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* TBC */}
          <h2 className="text-xl font-display font-bold text-white mb-5 opacity-50">To Be Confirmed</h2>
          <div className="space-y-3 opacity-50">
            {placeholder.map((f) => (
              <div key={f.id} className="glass-dark p-5 flex flex-wrap gap-4 items-center border-dashed border-white/[0.06]">
                <div className="w-14 text-center flex-shrink-0">
                  <div className="text-2xl font-bold text-slate-600">?</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-500 font-semibold text-sm">{f.title}</h3>
                  <p className="text-slate-600 text-xs mt-0.5">{f.notes}</p>
                </div>
                <span className="badge-slate text-xs">Placeholder</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <div className="px-4 pb-12" style={{ background: "#120808" }}>
        <div className="container-wide max-w-4xl">
          <div className="glass-dark p-4 flex gap-3 items-start">
            <Info size={14} className="text-gold-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-400 text-xs">
              Fixtures are sourced from the club's official calendar. For the most up-to-date schedule and
              last-minute changes, check{" "}
              <a href="https://cricketinmadrid.com" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
                cricketinmadrid.com
              </a>{" "}
              or the{" "}
              <a href="https://www.instagram.com/madridcricketclub" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
                @madridcricketclub Instagram
              </a>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
