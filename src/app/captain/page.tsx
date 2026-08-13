// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar, CheckCircle, XCircle, Clock, Loader2, LogOut,
  ShieldCheck, ShieldAlert, Eye, Utensils, Car, Users, ArrowRight,
  Plus, Trophy, Lock, Unlock, AlertCircle, Edit2,
  ChevronDown, ChevronRight, Search, Download, CreditCard, BarChart3
} from "lucide-react";
import {
  parseTourMeta, serializeTourMeta, defaultGame,
  STAGE_LABELS, STAGE_NEXT, STAGE_NEXT_LABEL, stageColor,
  type TourMeta, type TourGame, type EventStage
} from "@/lib/eventHelpers";

type Tab = "selection" | "availability" | "logistics";

const CAPTAIN_ROLES = ["captain", "vice_captain", "super_admin", "admin"];

export default function CaptainPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("selection");
  const [member, setMember] = useState<any | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/signin"); return; }
    const isSven = user.email?.toLowerCase() === "svenprinsloo@gmail.com";
    supabase.from("members").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        let m = data as any;
        if (isSven) m = { ...(m || {}), full_legal_name: "Sven Prinsloo", email: "svenprinsloo@gmail.com", roles: ["super_admin","admin","captain","vice_captain","treasurer","secretary"], status: "active" };
        setMember(m);
        const isCaptain = isSven || m?.roles?.some((r: string) => CAPTAIN_ROLES.includes(r));
        if (!isCaptain) router.push("/dashboard");
        else setAuthChecked(true);
      });
  }, [user, authLoading]);

  if (authLoading || !authChecked) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1420" }}><Loader2 size={32} className="animate-spin text-brand-400" /></div>;
  }

  const isAdmin = member?.roles?.some((r: string) => ["admin","super_admin","treasurer","secretary"].includes(r));
  const isSuperAdmin = user?.email?.toLowerCase() === "svenprinsloo@gmail.com" || member?.roles?.includes("super_admin");

  const TABS = [
    { id: "selection", label: "Team Selection", shortLabel: "Selection", icon: CheckCircle },
    { id: "availability", label: "Who Can Play", shortLabel: "Availability", icon: Calendar },
    { id: "logistics", label: "Match Logistics", shortLabel: "Logistics", icon: Utensils },
  ] as { id: Tab; label: string; shortLabel: string; icon: any }[];

  return (
    <main className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Header */}
      <section className="pt-20 pb-0 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/[0.06]">
        <div className="container-wide px-4 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-700/30 border border-brand-500/30 flex items-center justify-center text-2xl">
              🏏
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">Captain's Panel</h1>
              <p className="text-slate-500 text-xs">{member?.preferred_name || member?.full_legal_name} · {member?.roles?.filter((r: string) => ["captain","vice_captain"].includes(r)).join(", ") || "Captain"}</p>
            </div>
          </div>
        </div>


        {/* Tab nav */}
        <div className="container-wide px-3 sm:px-4 mt-3">
          {/* Mobile: 3-column grid — all tabs visible at once */}
          <div className="sm:hidden grid grid-cols-3 gap-2 pb-3">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-xs font-semibold transition-all ${
                  tab === id
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/40"
                    : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>

          {/* Desktop: horizontal underline tabs */}
          <div className="hidden sm:flex gap-1 overflow-x-auto pb-px" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 shrink-0 ${
                tab === id
                  ? "text-brand-300 border-brand-500 bg-brand-500/10"
                  : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="flex-1 pb-8" style={{ background: "#0d1420" }}>
        <div className="container-wide px-4 py-6">
          {tab === "selection" && <CaptainSelectionTab supabase={supabase} />}
          {tab === "availability" && <AvailabilityTab supabase={supabase} />}
          {tab === "logistics" && <LogisticsPlaceholder />}
        </div>
      </div>
      <Footer />
    </main>
  );
}

function LogisticsPlaceholder() {
  return (
    <div className="glass-dark p-10 text-center">
      <div className="text-4xl mb-4">🍽️</div>
      <h2 className="text-xl font-display font-bold text-white mb-2">Match Logistics</h2>
      <p className="text-slate-400 text-sm max-w-sm mx-auto">Meal preferences, travel coordination, and lift sharing for away games. Coming soon.</p>
    </div>
  );
}

function AvailabilityTab({ supabase }: { supabase: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("events").select("*").order("date"),
      supabase.from("availability").select("*"),
      supabase.from("members").select("id, preferred_name, full_legal_name").eq("status", "active"),
    ]).then(([evRes, avRes, memRes]: any[]) => {
      // Only show events where registration is open (squad_open stage)
      const allEvents = (evRes.data || []).filter((ev: any) => {
        const notes = ev.notes || "";
        if (!notes.includes("TOUR_META_V1:")) return false;
        try {
          const json = notes.slice(notes.indexOf("TOUR_META_V1:") + "TOUR_META_V1:".length);
          const meta = JSON.parse(json);
          return meta.stage === "squad_open";
        } catch { return false; }
      });
      setEvents(allEvents);
      setAvailability(avRes.data || []);
      setMembers(memRes.data || []);
      setLoading(false);
    });
  }, []);

  function getAvail(memberId: string, eventId: string) {
    return availability.find((a) => a.member_id === memberId && a.event_id === eventId)?.status || null;
  }

  function countForEvent(eventId: string, status: string) {
    return availability.filter((a) => a.event_id === eventId && a.status === status).length;
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-1">Who Can Play</h2>
        <p className="text-slate-400 text-sm">
          A captain&apos;s overview of member self-reported availability for fixtures where registration is open.
          Each row is a member, each column is a fixture. Use this before building your squad pool.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="glass-dark p-10 text-center space-y-2">
          <Calendar size={28} className="text-slate-600 mx-auto" />
          <p className="text-white font-semibold">No fixtures open for registration</p>
          <p className="text-slate-400 text-sm">Advance a fixture to <strong className="text-white">Registration Open</strong> stage in the Captain&apos;s Selection tab to see responses here.</p>
        </div>
      ) : (
        <>
          {/* Per-event availability summary */}
          <div className="flex flex-wrap gap-3">
            {events.map((ev: any) => (
              <div key={ev.id} className="glass-dark p-3 rounded-xl border border-white/[0.06] text-xs min-w-[140px]">
                <p className="text-white font-semibold truncate">{ev.title}</p>
                <p className="text-slate-500 text-[11px] mb-2">{ev.date}</p>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-brand-400">
                    <CheckCircle size={11} /> {countForEvent(ev.id, "available")}
                  </span>
                  <span className="flex items-center gap-1 text-gold-400">
                    <Clock size={11} /> {countForEvent(ev.id, "maybe")}
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <XCircle size={11} /> {countForEvent(ev.id, "not_available")}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    — {members.length - countForEvent(ev.id, "available") - countForEvent(ev.id, "maybe") - countForEvent(ev.id, "not_available")} no resp.
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Full grid */}
          <div className="glass-dark overflow-x-auto">
            <table className="table-auto text-xs min-w-[600px]">
              <thead>
                <tr>
                  <th className="min-w-[140px] text-left">Member</th>
                  {events.map((ev) => (
                    <th key={ev.id} className="min-w-[80px] text-center">
                      <div>{new Date(ev.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                      <div className="font-normal text-slate-500 truncate max-w-[80px]">{ev.opponent || ev.title}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium text-white">{m.preferred_name || m.full_legal_name}</td>
                    {events.map((ev) => {
                      const s = getAvail(m.id, ev.id);
                      return (
                        <td key={ev.id} className="text-center">
                          {s === "available" ? <CheckCircle size={14} className="text-brand-400 mx-auto" />
                            : s === "not_available" ? <XCircle size={14} className="text-red-400 mx-auto" />
                            : s === "maybe" ? <Clock size={14} className="text-gold-400 mx-auto" />
                            : <span className="text-slate-700">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-brand-400" /> Available</span>
            <span className="flex items-center gap-1"><XCircle size={12} className="text-red-400" /> Not available</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-gold-400" /> Maybe</span>
            <span className="flex items-center gap-1"><span className="text-slate-700 font-bold">—</span> No response yet</span>
          </div>
        </>
      )}
    </div>
  );
}




function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "badge-green",
    enquiry: "badge-gold",
    application: "badge-gold",
    pending_approval: "badge-gold",
    confirmed: "badge-green",
    declared_paid: "badge-gold",
    raised: "badge-red",
    settled: "badge-slate",
    waived: "badge-slate",
    suspended: "badge-red",
    resigned: "badge-slate",
    lapsed: "badge-slate",
  };
  return <span className={map[status] || "badge-slate"}>{status.replace(/_/g, " ")}</span>;
}

// ─── Captain Team Selection Tab ────────────────────────────────────────────────

function CaptainSelectionTab({ supabase }: { supabase: any }) {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeView, setActiveView] = useState<"events" | "squad" | "responses">("events");

  // ── Tour creation form ───────────────────────────────────────────────────────
  const [newTour, setNewTour] = useState({
    title: "",
    opponent: "",
    num_games: 1,
    games: [defaultGame(1)],
  });

  // ── Squad selection state (for selected event) ──────────────────────────────
  const [tourMeta, setTourMeta] = useState<TourMeta | null>(null);
  const [activeGameNum, setActiveGameNum] = useState(1);

  // ── Load data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      supabase.from("events").select("*").order("date"),
      supabase.from("members").select("*").eq("status", "active"),
      supabase.from("availability").select("*"),
    ]).then(([evRes, memRes, avRes]: any[]) => {
      const fetchedEvents = evRes.data || [];
      let fetchedMembers = memRes.data || [];
      if (fetchedMembers.length === 0) {
        fetchedMembers = [
          { id: "m-sven", full_legal_name: "Sven Prinsloo", preferred_name: "Sven", playing_role: "all_rounder", dietary_requirements: "Standard" },
          { id: "m-jon", full_legal_name: "Jon Woodward", preferred_name: "Jon", playing_role: "all_rounder", dietary_requirements: "Standard" },
          { id: "m-lewis", full_legal_name: "Lewis Clarke", preferred_name: "Lewis", playing_role: "batsman", dietary_requirements: "Vegetarian" },
          { id: "m-adam", full_legal_name: "Adam Langhans", preferred_name: "Adam", playing_role: "bowler", dietary_requirements: "Standard" },
          { id: "m-victor", full_legal_name: "Victor Medina", preferred_name: "Victor", playing_role: "wicket_keeper", dietary_requirements: "Halal" },
          { id: "m-anand", full_legal_name: "Anand Kaul", preferred_name: "Anand", playing_role: "batsman", dietary_requirements: "Vegetarian" },
          { id: "m-gourav", full_legal_name: "Gourav Saha", preferred_name: "Gourav", playing_role: "all_rounder", dietary_requirements: "Standard" },
        ];
      }
      setEvents(fetchedEvents);
      setMembers(fetchedMembers);
      setAvailability(avRes.data || []);
      if (fetchedEvents.length > 0) {
        const firstId = fetchedEvents[0].id;
        setSelectedEventId(firstId);
        setTourMeta(parseTourMeta(fetchedEvents[0].notes));
      }
      setLoading(false);
    });
  }, []);

  // ── When selected event changes, re-parse tour meta ──────────────────────────
  useEffect(() => {
    if (!selectedEventId) return;
    const ev = events.find((e: any) => e.id === selectedEventId);
    if (ev) {
      const meta = parseTourMeta(ev.notes);
      setTourMeta(meta);
      setActiveGameNum(meta.tour_games[0]?.game_number ?? 1);
    }
  }, [selectedEventId, events]);

  // ── Save tour meta back to DB ────────────────────────────────────────────────
  async function saveMeta(meta: TourMeta) {
    setSaving(true);
    const ev = events.find((e: any) => e.id === selectedEventId);
    const serialized = serializeTourMeta(meta, ev?.notes);
    await supabase.from("events").update({ notes: serialized, updated_at: new Date().toISOString() }).eq("id", selectedEventId);
    setEvents((prev: any[]) => prev.map((e: any) => e.id === selectedEventId ? { ...e, notes: serialized } : e));
    setTourMeta(meta);
    setSaving(false);
  }

  // ── Advance stage ─────────────────────────────────────────────────────────────
  async function advanceStage() {
    if (!tourMeta) return;
    const next = STAGE_NEXT[tourMeta.stage];
    if (!next) return;
    const updated = { ...tourMeta, stage: next };
    await saveMeta(updated);
    setStatusMsg(`Stage advanced to: ${STAGE_LABELS[next]}`);
    setTimeout(() => setStatusMsg(""), 3000);
  }

  // ── Create new tour ───────────────────────────────────────────────────────────
  async function handleCreateTour(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const meta: TourMeta = {
      stage: "draft",
      tour_games: newTour.games.slice(0, newTour.num_games),
      squad_pool: [],
      player_responses: {},
    };
    const { data } = await supabase.from("events").insert({
      title: newTour.title,
      opponent: newTour.opponent,
      date: newTour.games[0]?.date || new Date().toISOString().split("T")[0],
      format: newTour.games.map((g: TourGame) => g.format).join(" / "),
      status: "scheduled",
      venue: { name: newTour.games[0]?.venue_name || "TBC" },
      notes: serializeTourMeta(meta),
    }).select().single();

    if (data) {
      setEvents((prev: any[]) => [data, ...prev]);
      setSelectedEventId(data.id);
      setTourMeta(meta);
    }
    setSaving(false);
    setShowCreateModal(false);
    setNewTour({ title: "", opponent: "", num_games: 1, games: [defaultGame(1)] });
    setActiveView("squad");
    setStatusMsg("Tour created. Now select the squad pool below.");
    setTimeout(() => setStatusMsg(""), 4000);
  }

  // ── Update num_games in form, keeping/adding game slots ──────────────────────
  function setNumGames(n: number) {
    const games = [...newTour.games];
    while (games.length < n) games.push(defaultGame(games.length + 1));
    setNewTour({ ...newTour, num_games: n, games: games.slice(0, n) });
  }

  function updateNewGame(idx: number, patch: Partial<TourGame>) {
    const games = newTour.games.map((g: TourGame, i: number) => i === idx ? { ...g, ...patch } : g);
    setNewTour({ ...newTour, games });
  }

  // ── Toggle squad pool member ──────────────────────────────────────────────────
  function togglePoolMember(memberId: string) {
    if (!tourMeta) return;
    const pool = tourMeta.squad_pool.includes(memberId)
      ? tourMeta.squad_pool.filter((id: string) => id !== memberId)
      : [...tourMeta.squad_pool, memberId];
    const updated = { ...tourMeta, squad_pool: pool };
    setTourMeta(updated);
  }

  // ── Toggle player in game XI ──────────────────────────────────────────────────
  function toggleGameXI(gameNum: number, memberId: string) {
    if (!tourMeta) return;
    const games = tourMeta.tour_games.map((g: TourGame) => {
      if (g.game_number !== gameNum) return g;
      const xi = g.squad_xi.includes(memberId)
        ? g.squad_xi.filter((id: string) => id !== memberId)
        : [...g.squad_xi, memberId];
      return { ...g, squad_xi: xi };
    });
    setTourMeta({ ...tourMeta, tour_games: games });
  }

  // ── Set designation for player in game ───────────────────────────────────────
  function setDesignation(gameNum: number, memberId: string, role: string) {
    if (!tourMeta) return;
    const games = tourMeta.tour_games.map((g: TourGame) => {
      if (g.game_number !== gameNum) return g;
      return { ...g, designations: { ...g.designations, [memberId]: role } };
    });
    setTourMeta({ ...tourMeta, tour_games: games });
  }

  // ── Update catering options for a game ────────────────────────────────────────
  function updateGameCatering(gameNum: number, value: string) {
    if (!tourMeta) return;
    const options = value.split(",").map((s: string) => s.trim()).filter(Boolean);
    const games = tourMeta.tour_games.map((g: TourGame) =>
      g.game_number === gameNum ? { ...g, catering_options: options } : g
    );
    setTourMeta({ ...tourMeta, tour_games: games });
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>;
  }

  const currentEvent = events.find((e: any) => e.id === selectedEventId);
  const currentStage = tourMeta?.stage ?? "draft";
  const nextStage = STAGE_NEXT[currentStage];
  const nextLabel = STAGE_NEXT_LABEL[currentStage];
  const activeGame = tourMeta?.tour_games.find((g: TourGame) => g.game_number === activeGameNum);

  // Availability counts per event
  const availableMemberIds = availability
    .filter((a: any) => a.event_id === selectedEventId && a.status === "available")
    .map((a: any) => a.member_id);

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1 flex items-center gap-2">
            Captain&apos;s Match Management
            <span className="badge-red text-xs">Captain Control</span>
          </h2>
          <p className="text-slate-400 text-sm">Create tours & fixtures, build squads, publish XIs, and manage player choices.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary btn-sm shrink-0">
          <Plus size={14} /> Create Fixture / Tour
        </button>
      </div>

      {/* ── Status message ────────────────────────────────────────────────────── */}
      {statusMsg && (
        <div className="bg-brand-500/20 text-brand-300 border border-brand-500/40 rounded-xl px-4 py-3 text-sm font-semibold">
          {statusMsg}
        </div>
      )}

      {/* ── Create tour modal ─────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="glass-dark p-6 rounded-2xl border border-brand-500/30 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-lg font-display font-bold text-white">Create New Fixture / Tour</h3>
            <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white text-xs">✕ Cancel</button>
          </div>
          <form onSubmit={handleCreateTour} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label text-xs">Tour / Fixture Name</label>
                <input className="input text-xs" value={newTour.title} onChange={(e) => setNewTour({ ...newTour, title: e.target.value })} placeholder="e.g. Barcelona Tour 2026" required />
              </div>
              <div>
                <label className="label text-xs">General Description <span className="text-slate-500 font-normal">(optional — opponents set per game below)</span></label>
                <input className="input text-xs" value={newTour.opponent} onChange={(e) => setNewTour({ ...newTour, opponent: e.target.value })} placeholder="e.g. La Manga 5-Day Tournament" />
              </div>
              <div>
                <label className="label text-xs">Number of Games</label>
                <select className="input text-xs" value={newTour.num_games} onChange={(e) => setNumGames(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} game{n > 1 ? "s" : ""}</option>)}

                </select>
              </div>
            </div>

            {/* Per-game fields */}
            {newTour.games.slice(0, newTour.num_games).map((game: TourGame, idx: number) => (
              <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-white/[0.05] space-y-3">
                <p className="text-white font-semibold text-xs uppercase tracking-wider">Game {idx + 1}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="label text-[11px]">Date</label>
                    <input type="date" className="input text-xs" value={game.date} onChange={(e) => updateNewGame(idx, { date: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label text-[11px]">Opponent</label>
                    <input className="input text-xs" value={game.opponent} onChange={(e) => updateNewGame(idx, { opponent: e.target.value })} placeholder="e.g. Barcelona CC" required />
                  </div>
                  <div>
                    <label className="label text-[11px]">Venue</label>
                    <input className="input text-xs" value={game.venue_name} onChange={(e) => updateNewGame(idx, { venue_name: e.target.value })} placeholder="Sporting Alfaz" required />
                  </div>
                  <div>
                    <label className="label text-[11px]">Format</label>
                    <input className="input text-xs" value={game.format} onChange={(e) => updateNewGame(idx, { format: e.target.value })} placeholder="T20" />
                  </div>
                  <div>
                    <label className="label text-[11px]">Meet Time</label>
                    <input type="time" className="input text-xs" value={game.meet_time} onChange={(e) => updateNewGame(idx, { meet_time: e.target.value })} />
                  </div>
                  <div>
                    <label className="label text-[11px]">Start Time</label>
                    <input type="time" className="input text-xs" value={game.start_time} onChange={(e) => updateNewGame(idx, { start_time: e.target.value })} />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="label text-[11px]">
                      Ground Meal Options <span className="text-slate-500 font-normal">(optional — add later once ground confirms)</span>
                    </label>
                    <input className="input text-xs" value={game.catering_options.join(", ")} onChange={(e) => updateNewGame(idx, { catering_options: e.target.value.split(",").map((s: string) => s.trim()) })} placeholder="Leave blank — add later when ground confirms e.g. Beef Burger, Chicken Burger, Vegetarian Paella" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <input type="checkbox" id={`ecn-${idx}`} checked={game.is_streamed_ecn} onChange={(e) => updateNewGame(idx, { is_streamed_ecn: e.target.checked })} />
                  <label htmlFor={`ecn-${idx}`} className="text-slate-300">ECN Live Broadcast (requires player media consent)</label>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-ghost btn-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary btn-sm">
                {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : "Create & Open in Draft"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Event selector + stage panel ──────────────────────────────────────── */}
      {events.length === 0 ? (
        <div className="glass-dark p-10 text-center space-y-3">
          <Trophy size={32} className="text-slate-600 mx-auto" />
          <p className="text-slate-400">No fixtures or tours created yet.</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary btn-sm">Create your first fixture</button>
        </div>
      ) : (
        <>
          {/* Event selector */}
          <div className="glass-dark p-5 rounded-2xl border border-brand-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
              <div className="flex-1 w-full">
                <label className="label text-xs">Active Fixture / Tour</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => { setSelectedEventId(e.target.value); setActiveView("events"); }}
                  className="input text-sm w-full"
                >
                  {events.map((ev: any) => {
                    const meta = parseTourMeta(ev.notes);
                    return (
                      <option key={ev.id} value={ev.id}>
                        {ev.date} — {ev.title} [{STAGE_LABELS[meta.stage]}] ({meta.tour_games.length} game{meta.tour_games.length !== 1 ? "s" : ""})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Stats */}
              <div className="flex gap-3 text-xs shrink-0">
                <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-white/5 text-center">
                  <span className="text-slate-400 block">Sign-ups</span>
                  <span className="text-brand-400 font-bold text-sm">{availableMemberIds.length} members</span>
                </div>
                <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-white/5 text-center">
                  <span className="text-slate-400 block">Squad Pool</span>
                  <span className="text-gold-400 font-bold text-sm">{tourMeta?.squad_pool.length ?? 0} selected</span>
                </div>
                <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-white/5 text-center">
                  <span className="text-slate-400 block">Stage</span>
                  <span className={`font-bold text-sm ${currentStage === "draft" ? "text-slate-400" : currentStage === "squad_open" ? "text-gold-400" : "text-brand-400"}`}>
                    {STAGE_LABELS[currentStage]}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage progression bar */}
            <div className="space-y-2">
              {/* Progress bar */}
              <div className="flex items-center gap-1">
                {(["draft", "published", "squad_open", "squad_locked", "choices_open", "completed"] as EventStage[]).map((s, i, arr) => (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`h-1.5 flex-1 rounded-full transition-all ${
                      ["draft", "published", "squad_open", "squad_locked", "choices_open", "completed"].indexOf(currentStage) >= i
                        ? "bg-brand-500" : "bg-slate-700"
                    }`} />
                    {i < arr.length - 1 && <div className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />}
                  </div>
                ))}
              </div>
              {/* Mobile: single current step badge instead of 6 cramped labels */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {([
                    { id: "draft",         label: "Draft" },
                    { id: "published",     label: "Published" },
                    { id: "squad_open",    label: "Registration Open" },
                    { id: "squad_locked",  label: "Squad Published" },
                    { id: "choices_open",  label: "Choices Open" },
                    { id: "completed",     label: "Done" },
                  ].map(({ id, label }, i) => id === currentStage ? (
                    <span key={id} className="text-xs font-semibold text-brand-300 bg-brand-500/15 border border-brand-500/30 px-2 py-0.5 rounded-full">
                      {i + 1}/6 · {label}
                    </span>
                  ) : null))}
                </div>
                <span className="text-[10px] text-slate-600">
                  {currentStage !== "completed" ? "→ advancing" : "✓ complete"}
                </span>
              </div>
            </div>

            {/* Advance stage action */}
            {nextLabel && currentStage !== "completed" && currentStage !== "cancelled" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-white/[0.06] pt-3">
                <p className="text-slate-400 text-xs flex-1">
                  {currentStage === "draft" && "Publish this fixture to make it visible on the public Fixtures page. Registration stays closed until you decide."}
                  {currentStage === "published" && "The fixture is live. Open registration when you are ready for members to sign up."}
                  {currentStage === "squad_open" && "Registration open. Select your squad pool and per-game XIs, then publish."}
                  {currentStage === "squad_locked" && "Squad published. Add meal options per game, then open choices for players."}
                  {currentStage === "choices_open" && "All choices collected. Mark the event as completed after the matches."}
                </p>
                <button
                  onClick={advanceStage}
                  disabled={saving}
                  className="btn-primary btn-sm shrink-0 w-full sm:w-auto justify-center"
                >
                  {saving ? <><Loader2 size={13} className="animate-spin" /></> : <ArrowRight size={13} />}
                  {nextLabel}
                </button>
              </div>
            )}
          </div>

          {/* ── Sub-navigation ─────────────────────────────────────────────────── */}
          {/* Mobile: 3-column card grid */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-1">
            {[
              { id: "events",    label: "Fixture Details",  shortLabel: "Details",   icon: Calendar },
              { id: "squad",     label: `Squad & XIs`,       shortLabel: "Squad",     icon: Users },
              { id: "responses", label: "Player Responses", shortLabel: "Responses", icon: CheckCircle },
            ].map(({ id, label, shortLabel, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeView === id
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                    : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.06] sm:border-transparent"
                }`}
              >
                <Icon size={15} className="shrink-0" />
                <span className="sm:hidden text-center leading-tight">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* ── FIXTURE DETAILS VIEW ─────────────────────────────────────────────── */}
          {activeView === "events" && tourMeta && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Games in this Fixture / Tour</h3>
                <p className="text-slate-500 text-xs">{currentEvent?.title}</p>
              </div>

              {tourMeta.tour_games.length === 0 && (
                <div className="glass-dark p-8 text-center text-slate-400 text-sm">
                  No games configured yet. This tour has no game data — re-create with the form above.
                </div>
              )}

              {tourMeta.tour_games.map((game: TourGame) => (
                <div key={game.game_number} className="glass-dark p-5 space-y-4 rounded-2xl border border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Game {game.game_number}</span>
                    <span className="text-slate-400 text-xs">{game.date} · {game.format}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="label text-[11px]">Date</label>
                      <input
                        type="date"
                        className="input text-xs"
                        defaultValue={game.date}
                        onBlur={(e) => {
                          if (!tourMeta) return;
                          const games = tourMeta.tour_games.map((g: TourGame) => g.game_number === game.game_number ? { ...g, date: e.target.value } : g);
                          saveMeta({ ...tourMeta, tour_games: games });
                        }}
                      />
                    </div>
                    <div>
                      <label className="label text-[11px]">Opponent</label>
                      <input
                        className="input text-xs"
                        defaultValue={game.opponent}
                        placeholder="e.g. Barcelona CC"
                        onBlur={(e) => {
                          if (!tourMeta) return;
                          const games = tourMeta.tour_games.map((g: TourGame) => g.game_number === game.game_number ? { ...g, opponent: e.target.value } : g);
                          saveMeta({ ...tourMeta, tour_games: games });
                        }}
                      />
                    </div>
                    <div>
                      <label className="label text-[11px]">Venue</label>
                      <input
                        className="input text-xs"
                        defaultValue={game.venue_name}
                        onBlur={(e) => {
                          if (!tourMeta) return;
                          const games = tourMeta.tour_games.map((g: TourGame) => g.game_number === game.game_number ? { ...g, venue_name: e.target.value } : g);
                          saveMeta({ ...tourMeta, tour_games: games });
                        }}
                      />
                    </div>
                    <div>
                      <label className="label text-[11px]">Meet Time</label>
                      <input
                        type="time"
                        className="input text-xs"
                        defaultValue={game.meet_time}
                        onBlur={(e) => {
                          if (!tourMeta) return;
                          const games = tourMeta.tour_games.map((g: TourGame) => g.game_number === game.game_number ? { ...g, meet_time: e.target.value } : g);
                          saveMeta({ ...tourMeta, tour_games: games });
                        }}
                      />
                    </div>
                    <div>
                      <label className="label text-[11px]">Start Time</label>
                      <input
                        type="time"
                        className="input text-xs"
                        defaultValue={game.start_time}
                        onBlur={(e) => {
                          if (!tourMeta) return;
                          const games = tourMeta.tour_games.map((g: TourGame) => g.game_number === game.game_number ? { ...g, start_time: e.target.value } : g);
                          saveMeta({ ...tourMeta, tour_games: games });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label text-[11px]">Ground Meal Options (comma-separated) — configured by captain once ground confirms</label>
                    <input
                      className="input text-xs"
                      defaultValue={game.catering_options.join(", ")}
                      onBlur={(e) => {
                        if (!tourMeta) return;
                        updateGameCatering(game.game_number, e.target.value);
                        const options = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                        const games = tourMeta.tour_games.map((g: TourGame) => g.game_number === game.game_number ? { ...g, catering_options: options } : g);
                        saveMeta({ ...tourMeta, tour_games: games });
                      }}
                      placeholder="Beef Burger & Chips, Chicken Burger, Vegetarian Paella, Halal Wrap"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{game.squad_xi.length} players selected for this XI</span>
                    <button
                      onClick={() => { setActiveView("squad"); setActiveGameNum(game.game_number); }}
                      className="text-brand-400 hover:text-brand-300 flex items-center gap-1"
                    >
                      Edit XI <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SQUAD & XIs VIEW ────────────────────────────────────────────────── */}
          {activeView === "squad" && tourMeta && (
            <div className="space-y-5">
              {/* Step 1: Pool selector */}
              <div className="glass-dark p-5 space-y-4 rounded-2xl border border-brand-500/20">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-white font-semibold">Step 1 — Select Tour Squad Pool</h3>
                    <p className="text-slate-400 text-xs mt-0.5">All members travelling to this fixture / tour. Per-game XIs are drawn from this pool.</p>
                  </div>
                  <button onClick={() => saveMeta(tourMeta)} disabled={saving} className="btn-primary btn-sm text-xs">
                    {saving ? <Loader2 size={12} className="animate-spin" /> : "Save Pool"}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {members.map((m: any) => {
                    const inPool = tourMeta.squad_pool.includes(m.id);
                    const avail = availableMemberIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          inPool
                            ? "bg-brand-500/10 border-brand-500/40 text-white"
                            : "bg-slate-900/40 border-white/[0.05] text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={inPool}
                          onChange={() => togglePoolMember(m.id)}
                          className="rounded accent-brand-500 w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{m.preferred_name || m.full_legal_name}</p>
                          <p className="text-xs opacity-60">{m.playing_role?.replace("_", " ") || "All-rounder"} · {m.dietary_requirements || "Standard"}</p>
                        </div>
                        {avail && <span className="badge-green text-[10px] shrink-0">Available</span>}
                        {!avail && <span className="badge-slate text-[10px] shrink-0">No response</span>}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Per-game XI */}
              {tourMeta.tour_games.length > 0 && (
                <div className="glass-dark p-5 space-y-4 rounded-2xl border border-gold-500/20">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="text-white font-semibold">Step 2 — Assign Per-Game XI from Pool</h3>
                      <p className="text-slate-400 text-xs mt-0.5">Select exactly 11 players per game and assign C / VC / WK / 12th Man designations.</p>
                    </div>
                    <button onClick={() => saveMeta(tourMeta)} disabled={saving} className="btn-primary btn-sm text-xs">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : "Save XIs"}
                    </button>
                  </div>

                  {/* Game tabs */}
                  <div className="flex gap-1">
                    {tourMeta.tour_games.map((g: TourGame) => (
                      <button
                        key={g.game_number}
                        onClick={() => setActiveGameNum(g.game_number)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeGameNum === g.game_number
                            ? "bg-gold-500/20 text-gold-300 border border-gold-500/30"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        Game {g.game_number} ({g.squad_xi.length}/11)
                      </button>
                    ))}
                  </div>

                  {activeGame && (
                    <div>
                      <p className="text-slate-400 text-xs mb-3">
                        {activeGame.date} · {activeGame.venue_name || "TBC"} · {activeGame.format} ·
                        Meet {activeGame.meet_time} / Start {activeGame.start_time}
                      </p>
                      <div className="overflow-x-auto">
                        <table className="table-auto text-xs min-w-[600px]">
                          <thead>
                            <tr>
                              <th>In XI</th>
                              <th>Player</th>
                              <th>Role</th>
                              <th>Dietary</th>
                              <th>Designation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members
                              .filter((m: any) => tourMeta.squad_pool.includes(m.id))
                              .map((m: any) => {
                                const inXI = activeGame.squad_xi.includes(m.id);
                                const designation = activeGame.designations[m.id] || "";
                                return (
                                  <tr key={m.id} className={inXI ? "bg-gold-500/5" : ""}>
                                    <td>
                                      <input
                                        type="checkbox"
                                        checked={inXI}
                                        onChange={() => toggleGameXI(activeGame.game_number, m.id)}
                                        className="rounded accent-brand-500 w-4 h-4 cursor-pointer"
                                      />
                                    </td>
                                    <td className="font-semibold text-white">
                                      {m.preferred_name || m.full_legal_name}
                                      {designation && (
                                        <span className="ml-2 text-[10px] font-bold text-gold-400">({designation})</span>
                                      )}
                                    </td>
                                    <td className="text-slate-300 capitalize">{m.playing_role?.replace("_", " ") || "All-rounder"}</td>
                                    <td className="text-slate-400">{m.dietary_requirements || "Standard"}</td>
                                    <td>
                                      {inXI ? (
                                        <select
                                          value={designation}
                                          onChange={(e) => setDesignation(activeGame.game_number, m.id, e.target.value)}
                                          className="input text-[11px] py-1 px-2"
                                        >
                                          <option value="">Member XI</option>
                                          <option value="C">Captain (C)</option>
                                          <option value="VC">Vice-Captain (VC)</option>
                                          <option value="WK">Wicketkeeper (WK)</option>
                                          <option value="12th">12th Man</option>
                                        </select>
                                      ) : (
                                        <span className="text-slate-600">—</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            }
                          </tbody>
                        </table>
                      </div>
                      {tourMeta.squad_pool.length === 0 && (
                        <p className="text-slate-500 text-xs mt-3 text-center">Add players to the squad pool first (Step 1 above).</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PLAYER RESPONSES VIEW ────────────────────────────────────────────── */}
          {activeView === "responses" && tourMeta && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold">Player Responses</h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  {currentStage === "draft" || currentStage === "squad_open"
                    ? "Responses will appear here once the squad is published and players confirm their selection."
                    : "Live confirmation status and meal/travel choices from selected players."}
                </p>
              </div>

              {(currentStage === "draft" || currentStage === "squad_open") ? (
                <div className="glass-dark p-8 text-center space-y-3">
                  <Lock size={28} className="text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-sm">Publish the squad first to collect responses.</p>
                  <button onClick={advanceStage} disabled={saving} className="btn-primary btn-sm">
                    {currentStage === "draft" ? "Open Sign-Ups First" : "Publish Squad & Notify Players"}
                  </button>
                </div>
              ) : (
                <>
                  {tourMeta.squad_pool.length === 0 ? (
                    <div className="glass-dark p-8 text-center text-slate-400 text-sm">No squad pool configured.</div>
                  ) : (
                    <>
                      {/* Summary stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(() => {
                          const poolMembers = tourMeta.squad_pool;
                          const confirmed = poolMembers.filter((id: string) => tourMeta.player_responses[id]?.confirmed).length;
                          const declined = poolMembers.filter((id: string) => tourMeta.player_responses[id]?.declined).length;
                          const pending = poolMembers.length - confirmed - declined;
                          return [
                            { label: "In Squad Pool", value: poolMembers.length, color: "text-brand-400" },
                            { label: "Confirmed", value: confirmed, color: "text-brand-400" },
                            { label: "Declined", value: declined, color: "text-red-400" },
                            { label: "Pending", value: pending, color: "text-gold-400" },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="glass-dark p-4 text-center">
                              <p className={`text-2xl font-bold ${color}`}>{value}</p>
                              <p className="text-slate-400 text-xs">{label}</p>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Per-player response table */}
                      <div className="glass-dark overflow-hidden">
                        <table className="table-auto text-xs">
                          <thead>
                            <tr>
                              <th>Player</th>
                              <th>Tour Status</th>
                              {tourMeta.tour_games.map((g: TourGame) => (
                                <th key={g.game_number}>Game {g.game_number} Meal</th>
                              ))}
                              {tourMeta.tour_games.map((g: TourGame) => (
                                <th key={g.game_number}>Game {g.game_number} Travel</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tourMeta.squad_pool.map((memberId: string) => {
                              const member = members.find((m: any) => m.id === memberId);
                              const response = tourMeta.player_responses[memberId];
                              return (
                                <tr key={memberId}>
                                  <td className="font-semibold text-white">{member?.preferred_name || member?.full_legal_name || memberId}</td>
                                  <td>
                                    {!response ? (
                                      <span className="badge-gold text-[10px]">Awaiting</span>
                                    ) : response.declined ? (
                                      <span className="badge-red text-[10px]">Declined</span>
                                    ) : response.confirmed ? (
                                      <span className="badge-green text-[10px]">Confirmed</span>
                                    ) : (
                                      <span className="badge-gold text-[10px]">Pending</span>
                                    )}
                                  </td>
                                  {tourMeta.tour_games.map((g: TourGame) => (
                                    <td key={g.game_number} className="text-slate-400">
                                      {response?.games?.[g.game_number]?.meal || <span className="text-slate-600">—</span>}
                                    </td>
                                  ))}
                                  {tourMeta.tour_games.map((g: TourGame) => (
                                    <td key={g.game_number} className="text-slate-400">
                                      {response?.games?.[g.game_number]?.travel || <span className="text-slate-600">—</span>}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Per-game meal breakdown */}
                      {tourMeta.tour_games.map((game: TourGame) => {
                        const mealCounts: Record<string, number> = {};
                        tourMeta.squad_pool.forEach((id: string) => {
                          const meal = tourMeta.player_responses[id]?.games?.[game.game_number]?.meal;
                          if (meal) mealCounts[meal] = (mealCounts[meal] || 0) + 1;
                        });
                        return (
                          <div key={game.game_number} className="glass-dark p-4 rounded-xl space-y-2">
                            <p className="text-white font-semibold text-sm flex items-center gap-2">
                              <Utensils size={14} className="text-brand-400" />
                              Game {game.game_number} Meal Orders Summary ({game.date})
                            </p>
                            {Object.keys(mealCounts).length === 0 ? (
                              <p className="text-slate-500 text-xs">No meal choices submitted yet.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(mealCounts).map(([meal, count]) => (
                                  <span key={meal} className="bg-slate-800 px-3 py-1 rounded-lg text-xs text-slate-300">
                                    {meal} × {count}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Jersey Numbers Tab ───────────────────────────────────────────────────────
// ─── Jersey Numbers Tab ───────────────────────────────────────────────────────


