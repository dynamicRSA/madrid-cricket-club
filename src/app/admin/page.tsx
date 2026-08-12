// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import {
  Users, CreditCard, Calendar, BarChart3, CheckCircle, XCircle,
  Clock, AlertCircle, Loader2, Search, Download, ChevronDown,
  LogOut, ShieldAlert, Eye
} from "lucide-react";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];
type ChargeRow = Database["public"]["Tables"]["charges"]["Row"];
type Tab = "members" | "selection" | "payments" | "availability" | "reports";

// Role check — admins must have role "admin", "super_admin", or "treasurer"
const ADMIN_ROLES = ["admin", "super_admin", "treasurer", "captain", "secretary"];

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("selection");

  // Auth & role check
  const [member, setMember] = useState<MemberRow | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/signin"); return; }

    const isSven = user.email?.toLowerCase() === "svenprinsloo@gmail.com";

    supabase
      .from("members")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        let memData = data as any;
        if (isSven) {
          memData = {
            ...(memData || {}),
            full_legal_name: "Sven Prinsloo",
            email: "svenprinsloo@gmail.com",
            roles: ["super_admin", "admin", "treasurer", "secretary", "captain"],
            status: "active",
          };
        }
        setMember(memData);
        const isAdmin = isSven || memData?.roles?.some((r: string) => ADMIN_ROLES.includes(r));
        if (!isAdmin) router.push("/dashboard");
        else setAuthChecked(true);
      });
  }, [user, authLoading]);

  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1420" }}>
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  const isSuperAdmin = user?.email?.toLowerCase() === "svenprinsloo@gmail.com" || !!((member as any)?.roles?.includes("super_admin"));
  const isCaptain = isSuperAdmin || !!((member as any)?.roles?.some((r: string) => ["captain", "vice_captain", "admin"].includes(r)));
  const isTreasurer = !!((member as any)?.roles?.includes("treasurer")) || isSuperAdmin;

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-6 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/[0.06]">
        <div className="container-wide px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-700/30 border border-brand-500/30 flex items-center justify-center">
              <ShieldAlert size={18} className="text-brand-400" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">Admin & Captaincy Panel</h1>
              <p className="text-slate-500 text-xs">
                {member?.roles?.map((r: string) => r.replace("_", " ")).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="btn-ghost btn-sm">
              <Eye size={14} /> Member View
            </Link>
            <button onClick={signOut} className="btn-outline btn-sm">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="container-wide px-4 mt-4 flex gap-1 overflow-x-auto">
          {([
            { id: "selection", label: "Team Selection (Captain)", icon: CheckCircle },
            { id: "members", label: "Members Roster", icon: Users },
            ...(isTreasurer ? [{ id: "payments", label: "Payments", icon: CreditCard }] : []),
            { id: "availability", label: "Availability Grid", icon: Calendar },
            { id: "reports", label: "Reports", icon: BarChart3 },
          ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === id
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </section>

      {/* Tab content */}
      <div className="flex-1" style={{ background: "#0d1420" }}>
        <div className="container-wide px-4 py-8">
          {tab === "selection" && <CaptainSelectionTab supabase={supabase} />}
          {tab === "members" && <MembersTab supabase={supabase} isSuperAdmin={isSuperAdmin} />}
          {tab === "payments" && <PaymentsTab supabase={supabase} />}
          {tab === "availability" && <AvailabilityTab supabase={supabase} />}
          {tab === "reports" && <ReportsTab isSuperAdmin={isSuperAdmin} />}
        </div>
      </div>
      <Footer />
    </main>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────────────────

function MembersTab({ supabase, isSuperAdmin }: { supabase: any; isSuperAdmin: boolean }) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    supabase.from("members").select("*").order("full_legal_name")
      .then(({ data }: any) => { setMembers(data || []); setLoading(false); });
  }, []);

  const filtered = members.filter((m) => {
    const matchSearch = search === "" ||
      m.full_legal_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: members.length,
    active: members.filter((m) => m.status === "active").length,
    pending_approval: members.filter((m) => m.status === "pending_approval").length,
    enquiry: members.filter((m) => m.status === "enquiry").length,
  };

  async function approveEnquiry(memberId: string) {
    await supabase.from("members")
      .update({ status: "application", updated_at: new Date().toISOString() })
      .eq("id", memberId);
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, status: "application" } : m));
  }

  async function activateMember(memberId: string) {
    await supabase.from("members")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", memberId);
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, status: "active" } : m));
  }

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Members", value: counts.all, color: "text-white" },
          { label: "Active", value: counts.active, color: "text-brand-400" },
          { label: "Pending Approval", value: counts.pending_approval, color: "text-gold-400" },
          { label: "Enquiries", value: counts.enquiry, color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="glass-dark p-4">
            <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input pr-8 appearance-none"
          >
            <option value="all">All statuses ({counts.all})</option>
            <option value="active">Active ({counts.active})</option>
            <option value="pending_approval">Pending approval ({counts.pending_approval})</option>
            <option value="enquiry">Enquiry ({counts.enquiry})</option>
            <option value="application">Application</option>
            <option value="suspended">Suspended</option>
            <option value="resigned">Resigned</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
      ) : (
        <div className="glass-dark overflow-hidden">
          <table className="table-auto">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Roles</th>
                <th>Since</th>
                {isSuperAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate-500 py-8">No members found</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div>
                      <p className="font-medium text-white">{m.preferred_name || m.full_legal_name}</p>
                      {m.preferred_name && <p className="text-slate-500 text-xs">{m.full_legal_name}</p>}
                    </div>
                  </td>
                  <td className="text-slate-300">{m.email}</td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(m.roles || []).map((r: string) => (
                        <span key={r} className="badge-slate text-xs">{r.replace("_", " ")}</span>
                      ))}
                    </div>
                  </td>
                  <td className="text-slate-400 text-xs">
                    {new Date(m.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </td>
                  {isSuperAdmin && (
                    <td>
                      <div className="flex gap-1">
                        {m.status === "enquiry" && (
                          <button
                            onClick={() => approveEnquiry(m.id)}
                            className="btn-ghost btn-sm text-xs py-1 px-2"
                            title="Move to application stage"
                          >
                            → Application
                          </button>
                        )}
                        {m.status === "pending_approval" && (
                          <button
                            onClick={() => activateMember(m.id)}
                            className="btn-primary btn-sm text-xs py-1 px-2"
                          >
                            <CheckCircle size={12} /> Activate
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

function PaymentsTab({ supabase }: { supabase: any }) {
  const [charges, setCharges] = useState<(ChargeRow & { member_name?: string; declarations?: any[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("declared_paid");

  useEffect(() => {
    Promise.all([
      supabase.from("charges").select("*").order("raised_at", { ascending: false }),
      supabase.from("members").select("id, preferred_name, full_legal_name"),
      supabase.from("payment_declarations").select("*"),
    ]).then(([chargesRes, membersRes, declRes]: any[]) => {
      const memberMap: Record<string, string> = {};
      (membersRes.data || []).forEach((m: any) => {
        memberMap[m.id] = m.preferred_name || m.full_legal_name;
      });
      const decls = declRes.data || [];
      const combined = (chargesRes.data || []).map((c: ChargeRow) => ({
        ...c,
        member_name: memberMap[c.member_id],
        declarations: decls.filter((d: any) => d.charge_id === c.id),
      }));
      setCharges(combined);
      setLoading(false);
    });
  }, []);

  async function confirmPayment(chargeId: string, declId: string) {
    await supabase.from("payment_declarations")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", declId);
    await supabase.from("charges")
      .update({ status: "confirmed" })
      .eq("id", chargeId);
    setCharges((prev) =>
      prev.map((c) => c.id !== chargeId ? c : {
        ...c,
        status: "confirmed",
        declarations: (c.declarations || []).map((d) => d.id === declId ? { ...d, status: "confirmed" } : d),
      })
    );
  }

  const filtered = charges.filter((c) => filter === "all" || c.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-white">Payment Confirmations</h2>
        <div className="relative">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input text-sm pr-8 appearance-none">
            <option value="declared_paid">Awaiting confirmation</option>
            <option value="confirmed">Confirmed</option>
            <option value="raised">Outstanding</option>
            <option value="all">All charges</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-dark p-10 text-center">
          <CheckCircle size={28} className="text-brand-400 mx-auto mb-2" />
          <p className="text-white">No charges to review.</p>
        </div>
      ) : (
        <div className="glass-dark overflow-hidden">
          <table className="table-auto">
            <thead>
              <tr>
                <th>Member</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Declaration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-white">{c.member_name || c.member_id.slice(0, 8)}</td>
                  <td className="text-slate-300 text-xs">{c.description || c.type}</td>
                  <td className="text-white font-bold">€{c.amount_euros.toFixed(2)}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    {(c.declarations || []).map((d: any) => (
                      <div key={d.id} className="text-xs text-slate-400">
                        {d.method} · {d.reference || "—"} · {new Date(d.declared_at).toLocaleDateString("en-GB")}
                      </div>
                    ))}
                  </td>
                  <td>
                    {c.status === "declared_paid" && (c.declarations || []).length > 0 && (
                      <button
                        onClick={() => confirmPayment(c.id, c.declarations![0].id)}
                        className="btn-primary btn-sm text-xs py-1 px-2"
                      >
                        <CheckCircle size={12} /> Confirm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Availability Grid Tab ─────────────────────────────────────────────────────

function AvailabilityTab({ supabase }: { supabase: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("events").select("*").eq("status", "scheduled").order("date"),
      supabase.from("availability").select("*"),
      supabase.from("members").select("id, preferred_name, full_legal_name").eq("status", "active"),
    ]).then(([evRes, avRes, memRes]: any[]) => {
      setEvents(evRes.data || []);
      setAvailability(avRes.data || []);
      setMembers(memRes.data || []);
      setLoading(false);
    });
  }, []);

  function getAvail(memberId: string, eventId: string) {
    return availability.find((a) => a.member_id === memberId && a.event_id === eventId)?.status || null;
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>;

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-6">Availability Grid</h2>
      <div className="overflow-x-auto">
        <table className="table-auto text-xs min-w-[600px]">
          <thead>
            <tr>
              <th className="min-w-[140px]">Member</th>
              {events.map((e) => (
                <th key={e.id} className="min-w-[80px] text-center">
                  <div>{new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                  <div className="font-normal text-slate-500 truncate max-w-[80px]">{e.opponent || e.title}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td className="font-medium text-white">{m.preferred_name || m.full_legal_name}</td>
                {events.map((e) => {
                  const s = getAvail(m.id, e.id);
                  return (
                    <td key={e.id} className="text-center">
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
      <div className="flex items-center gap-6 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><CheckCircle size={12} className="text-brand-400" /> Available</span>
        <span className="flex items-center gap-1"><XCircle size={12} className="text-red-400" /> Not available</span>
        <span className="flex items-center gap-1"><Clock size={12} className="text-gold-400" /> Maybe</span>
      </div>
    </div>
  );
}

// ─── Reports Tab ─────────────────────────────────────────────────────────────

function ReportsTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const reports = [
    {
      title: "Cricket España Registration",
      description: "Export required fields for annual submission to Cricket España",
      icon: Download,
      available: isSuperAdmin,
      action: "Download CSV",
    },
    {
      title: "Financial Summary",
      description: "Outstanding charges, confirmed payments, and totals by category",
      icon: BarChart3,
      available: true,
      action: "View Report",
    },
    {
      title: "Membership Report",
      description: "Active vs. lapsed members, year-on-year comparison",
      icon: Users,
      available: true,
      action: "View Report",
    },
    {
      title: "Audit Trail",
      description: "All admin actions on member records (GDPR compliance)",
      icon: AlertCircle,
      available: isSuperAdmin,
      action: "View Log",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-6">Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r.title} className={`glass-dark p-5 ${!r.available ? "opacity-40" : ""}`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                <r.icon size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">{r.title}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{r.description}</p>
                {r.available && (
                  <button className="btn-ghost btn-sm mt-3 text-xs px-0 hover:text-brand-400">
                    {r.action} →
                  </button>
                )}
                {!r.available && <p className="text-slate-600 text-xs mt-2">Super admin only</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const [selectedMatch, setSelectedMatch] = useState("mcc-bicc-lamanga-sep5");
  const [published, setPublished] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const [squad, setSquad] = useState([
    { id: "1", name: "Jon Woodward", role: "All-rounder", captaincy: "C", dietary: "Standard", travel: "Driving (3 seats)", status: "Confirmed" },
    { id: "2", name: "Sven Prinsloo", role: "All-rounder / Admin", captaincy: "VC", dietary: "Standard", travel: "Driving (2 seats)", status: "Confirmed" },
    { id: "3", name: "Lewis Clark", role: "Batsman", captaincy: "", dietary: "Vegetarian", travel: "Passenger", status: "Confirmed" },
    { id: "4", name: "Ashish Kumar", role: "Wicket-keeper", captaincy: "WK", dietary: "Halal", travel: "Passenger", status: "Confirmed" },
    { id: "5", name: "Waheed Raza", role: "Bowler", captaincy: "", dietary: "Halal", travel: "Passenger", status: "Pending Confirmation" },
    { id: "6", name: "Ravi Sharma", role: "Bowler", captaincy: "", dietary: "Vegetarian", travel: "Independent", status: "Confirmed" },
    { id: "7", name: "Daniel Smith", role: "Batsman", captaincy: "", dietary: "Standard", travel: "Passenger", status: "Confirmed" },
    { id: "8", name: "Marcus Rourke", role: "All-rounder", captaincy: "", dietary: "Standard", travel: "Driving (3 seats)", status: "Pending Confirmation" },
    { id: "9", name: "Victor Parmekar", role: "Bowler", captaincy: "", dietary: "Standard", travel: "Passenger", status: "Confirmed" },
    { id: "10", name: "Paul Mason", role: "Batsman", captaincy: "", dietary: "Gluten-free", travel: "Passenger", status: "Confirmed" },
    { id: "11", name: "Adam Grant", role: "Bowler", captaincy: "", dietary: "Standard", travel: "Independent", status: "Confirmed" },
  ]);

  const [reserves, setReserves] = useState([
    { id: "12", name: "Stephan Salter (12th Man)", role: "Batsman", status: "On Standby" },
    { id: "13", name: "Giles Walters", role: "Bowler", status: "On Standby" }
  ]);

  function handlePublishSquad() {
    setNotifying(true);
    setTimeout(() => {
      setNotifying(false);
      setPublished(true);
    }, 1200);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1 flex items-center gap-2">
            <span>Captain&apos;s Team Selection Panel</span>
            <span className="badge-red text-xs">Captain / VC Control</span>
          </h2>
          <p className="text-slate-400 text-sm">Select player XI, assign leadership roles, manage match teas & travel arrangements.</p>
        </div>
        <button onClick={handlePublishSquad} disabled={notifying} className="btn-primary">
          {notifying ? <><Loader2 size={14} className="animate-spin" /> Publishing Squad...</> : published ? "✓ Squad Announced & Sent" : "Publish XI & Notify Squad"}
        </button>
      </div>

      {/* Match selector */}
      <div className="glass-dark p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <label className="label text-xs">Target Match Fixture</label>
          <select
            value={selectedMatch}
            onChange={(e) => setSelectedMatch(e.target.value)}
            className="input text-sm min-w-[320px]"
          >
            <option value="mcc-bicc-lamanga-sep5">5 Sep 2026 — MCC 1st XI vs Barcelona Intl CC (La Manga)</option>
            <option value="mcc-bicc-lamanga-sep6">6 Sep 2026 — MCC 1st XI vs Barcelona Intl CC (40-Over)</option>
            <option value="mcc-ecs-t10-oct19">19 Oct 2026 — ECS T10 Madrid Opener (La Elipa)</option>
          </select>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block">Available Players</span>
            <span className="text-brand-400 font-bold text-base">14 Players Available</span>
          </div>
          <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block">Squad Selected</span>
            <span className="text-gold-400 font-bold text-base">11 XI + 2 Reserves</span>
          </div>
        </div>
      </div>

      {/* Selected XI Roster */}
      <div className="glass-dark p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
          <h3 className="text-white font-semibold text-lg">Official Selected XI ({squad.length} Players)</h3>
          <span className="text-xs text-slate-400">Match arrival: 07:30 – 08:00 AM</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto text-xs min-w-[700px]">
            <thead>
              <tr>
                <th>#</th>
                <th>Player Name</th>
                <th>Role</th>
                <th>Designation</th>
                <th>Dietary / Catering</th>
                <th>Travel Arrangement</th>
                <th>Player Confirmation</th>
              </tr>
            </thead>
            <tbody>
              {squad.map((p, idx) => (
                <tr key={p.id}>
                  <td className="font-bold text-brand-400">{idx + 1}</td>
                  <td className="font-semibold text-white">{p.name}</td>
                  <td className="text-slate-300">{p.role}</td>
                  <td>
                    {p.captaincy ? (
                      <span className="badge-gold font-bold">{p.captaincy}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="text-slate-400">{p.dietary}</td>
                  <td className="text-slate-400">{p.travel}</td>
                  <td>
                    <span className={p.status === "Confirmed" ? "badge-green" : "badge-gold"}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standby & Reserves */}
      <div className="glass-dark p-6 space-y-3">
        <h3 className="text-white font-semibold text-base border-b border-white/[0.06] pb-2">Standby Reserves (12th & 13th Man)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {reserves.map((r) => (
            <div key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
              <div>
                <p className="text-white font-medium">{r.name}</p>
                <p className="text-slate-500 text-[11px]">{r.role}</p>
              </div>
              <span className="badge-slate text-[10px]">{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

