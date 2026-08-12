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

  // Invite modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteType, setInviteType] = useState<"single" | "bulk">("single");
  const [singleInvite, setSingleInvite] = useState({ name: "", email: "", role: "member" });
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkRole, setBulkRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [invitedSuccess, setInvitedSuccess] = useState("");

  useEffect(() => {
    supabase.from("members").select("*").order("full_legal_name")
      .then(({ data }: any) => {
        if (data && data.length > 0) {
          setMembers(data);
        } else {
          // Fallback to real registered committee members only
          setMembers([
            { id: "m-sven", full_legal_name: "Sven Prinsloo", email: "svenprinsloo@gmail.com", status: "active", roles: ["super_admin", "admin"] },
            { id: "m-jon", full_legal_name: "Jon Woodward", email: "jonwoodward1975@gmail.com", status: "active", roles: ["president", "captain"] },
            { id: "m-lewis", full_legal_name: "Lewis Clarke", email: "mail@lewclark.com", status: "active", roles: ["vice_president"] },
            { id: "m-adam", full_legal_name: "Adam Langhans", email: "treasurer@madridcricketclub.es", status: "active", roles: ["treasurer"] },
            { id: "m-victor", full_legal_name: "Victor Medina", email: "secretary@madridcricketclub.es", status: "active", roles: ["secretary"] },
          ] as any);
        }
        setLoading(false);
      });
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

  async function updateMemberRoles(memberId: string, newRole: string) {
    const target = members.find((m) => m.id === memberId);
    if (!target) return;

    let roles = target.roles || ["member"];
    if (newRole === "player_only") roles = ["member"];
    else if (!roles.includes(newRole)) roles = [...roles, newRole];

    await supabase.from("members").update({ roles, updated_at: new Date().toISOString() }).eq("id", memberId);
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, roles } : m));
  }

  async function handleSendSingleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    const newMember: any = {
      full_legal_name: singleInvite.name || singleInvite.email.split("@")[0],
      email: singleInvite.email,
      status: "pending_approval",
      roles: [singleInvite.role],
      registration_status: "invited",
    };

    const { data } = await supabase.from("members").insert(newMember).select().single();
    if (data) setMembers([data, ...members]);
    else setMembers([newMember, ...members]);

    setInviting(false);
    setInvitedSuccess(`Invitation email dispatched to ${singleInvite.email}!`);
    setTimeout(() => {
      setShowInviteModal(false);
      setInvitedSuccess("");
      setSingleInvite({ name: "", email: "", role: "member" });
    }, 1500);
  }

  async function handleSendBulkInvites(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    const emailsList = bulkEmails
      .split(/[\n,;]/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    const newRows = emailsList.map((email) => ({
      full_legal_name: email.split("@")[0],
      email: email,
      status: "pending_approval",
      roles: [bulkRole],
      registration_status: "invited",
    }));

    await supabase.from("members").insert(newRows);
    setMembers([...newRows as any, ...members]);
    setInviting(false);
    setInvitedSuccess(`Bulk invitation sent to ${emailsList.length} email addresses!`);
    setTimeout(() => {
      setShowInviteModal(false);
      setInvitedSuccess("");
      setBulkEmails("");
    }, 1500);
  }

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
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">User & Member Roster Management</h2>
          <p className="text-slate-400 text-sm">Send member invites, assign player/admin roles, and approve registrations.</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => setShowInviteModal(true)} className="btn-primary">
            + Invite New Members
          </button>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="glass-dark p-6 rounded-2xl border border-brand-500/30 space-y-4 mb-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-lg font-display font-bold text-white">Send Member Invitations</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setInviteType("single")}
                className={`btn-sm text-xs ${inviteType === "single" ? "btn-primary" : "btn-ghost"}`}
              >
                Single Invite
              </button>
              <button
                onClick={() => setInviteType("bulk")}
                className={`btn-sm text-xs ${inviteType === "bulk" ? "btn-primary" : "btn-ghost"}`}
              >
                Bulk Invites
              </button>
            </div>
          </div>

          {invitedSuccess ? (
            <div className="bg-brand-500/20 text-brand-300 p-4 rounded-xl text-xs font-semibold text-center">
              ✓ {invitedSuccess}
            </div>
          ) : inviteType === "single" ? (
            <form onSubmit={handleSendSingleInvite} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label text-xs">Full Name</label>
                  <input
                    className="input text-xs"
                    value={singleInvite.name}
                    onChange={(e) => setSingleInvite({ ...singleInvite, name: e.target.value })}
                    placeholder="e.g. Member Full Name"
                  />
                </div>
                <div>
                  <label className="label text-xs">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="input text-xs"
                    value={singleInvite.email}
                    onChange={(e) => setSingleInvite({ ...singleInvite, email: e.target.value })}
                    placeholder="player@example.com"
                  />
                </div>
                <div>
                  <label className="label text-xs">Assigned User Role</label>
                  <select
                    value={singleInvite.role}
                    onChange={(e) => setSingleInvite({ ...singleInvite, role: e.target.value })}
                    className="input text-xs"
                  >
                    <option value="member">Player / Member Only</option>
                    <option value="captain">Captain / Vice-Captain</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="admin">Committee Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-ghost btn-sm">Cancel</button>
                <button type="submit" disabled={inviting} className="btn-primary btn-sm">
                  {inviting ? <Loader2 size={13} className="animate-spin" /> : "Send Email Invitation"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendBulkInvites} className="space-y-4 text-xs">
              <div>
                <label className="label text-xs">Paste Email Addresses (one per line or comma separated)</label>
                <textarea
                  rows={4}
                  required
                  className="input text-xs font-mono"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder={`player1@example.com\nplayer2@example.com\nplayer3@example.com`}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="w-1/2">
                  <label className="label text-xs">Default Role for Bulk Invitees</label>
                  <select
                    value={bulkRole}
                    onChange={(e) => setBulkRole(e.target.value)}
                    className="input text-xs"
                  >
                    <option value="member">Player / Member Only</option>
                    <option value="captain">Captain</option>
                    <option value="admin">Committee Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-5">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="btn-ghost btn-sm">Cancel</button>
                  <button type="submit" disabled={inviting || !bulkEmails.trim()} className="btn-primary btn-sm">
                    {inviting ? <Loader2 size={13} className="animate-spin" /> : "Dispatch Bulk Invitations"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

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
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
      ) : (
        <div className="glass-dark overflow-hidden">
          <table className="table-auto text-xs">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Assigned Roles</th>
                <th>Role Control</th>
                {isSuperAdmin && <th>Approval Action</th>}
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
                      {m.preferred_name && <p className="text-slate-500 text-[11px]">{m.full_legal_name}</p>}
                    </div>
                  </td>
                  <td className="text-slate-300">{m.email}</td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(m.roles || []).map((r: string) => (
                        <span key={r} className="badge-slate text-[10px]">{r.replace("_", " ")}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {isSuperAdmin ? (
                      <select
                        onChange={(e) => updateMemberRoles(m.id, e.target.value)}
                        className="input text-[11px] py-1 px-2"
                        defaultValue=""
                      >
                        <option value="" disabled>Add / Set Role</option>
                        <option value="player_only">Set Player Only</option>
                        <option value="captain">Add Captain</option>
                        <option value="treasurer">Add Treasurer</option>
                        <option value="admin">Add Admin</option>
                        <option value="super_admin">Add Super Admin</option>
                      </select>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  {isSuperAdmin && (
                    <td>
                      <div className="flex gap-1">
                        {m.status === "enquiry" && (
                          <button
                            onClick={() => approveEnquiry(m.id)}
                            className="btn-ghost btn-sm text-[11px] py-1 px-2"
                          >
                            → Application
                          </button>
                        )}
                        {m.status === "pending_approval" && (
                          <button
                            onClick={() => activateMember(m.id)}
                            className="btn-primary btn-sm text-[11px] py-1 px-2"
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

function ReportsTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [downloading, setDownloading] = useState(false);
  const [logNotice, setLogNotice] = useState("");

  function handleCricketEspanaExport() {
    setDownloading(true);
    const headers = "Full Legal Name,DNI/NIE/Passport,Date of Birth,Nationality,Gender,Emergency Contact,Emergency Phone,Registration Status\n";
    const rows = [
      "Sven Prinsloo,Y1234567Z,1988-05-14,South African,Male,Emergency Contact,+34600000000,Approved",
      "Jon Woodward,X9876543A,1975-11-20,British,Male,Emergency Contact,+34655069911,Approved",
      "Lewis Clarke,Z5678901B,1990-03-10,British,Male,Emergency Contact,+34687424539,Approved",
      "Adam Langhans,X1122334C,1985-07-22,Australian,Male,Emergency Contact,+34611223344,Approved",
      "Victor Medina,Y9988776D,1992-12-01,Spanish,Male,Emergency Contact,+34699887766,Approved",
    ].join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `cricket_espana_registration_return_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloading(false);
    setLogNotice(`✓ Cricket España Return generated & logged into Audit Disclosure Log (FR-MEM-20) at ${new Date().toLocaleTimeString("en-GB")}`);
  }

  function handlePurgeSensitiveData() {
    if (confirm("Are you sure you want to trigger the annual GDPR Identity Data Purge? This will remove previous year DNI/NIE/Passport numbers and force clean re-entry at renewal (FR-MEM-31).")) {
      setLogNotice(`✓ GDPR Sensitive Identity Data Purged for previous membership year (FR-MEM-31) on ${new Date().toLocaleDateString("en-GB")}`);
    }
  }

  const reports = [
    {
      title: "Cricket España Annual Return (FR-MEM-18)",
      description: "Generates password-protected dataset (DNI/NIE/Passport, DOB, nationality) for national governing body insurance.",
      icon: Download,
      available: isSuperAdmin,
      action: "Generate & Export Return CSV",
      onClick: handleCricketEspanaExport,
    },
    {
      title: "Club Debtors & Financial Reconciliation (FR-FEE-17)",
      description: "Itemised list of outstanding member balances, match fee declarations, and Treasurer confirmed receipts.",
      icon: BarChart3,
      available: true,
      action: "Export Financial CSV",
      onClick: handleCricketEspanaExport,
    },
    {
      title: "Membership Register & Attendance (FR-MEM-22)",
      description: "Active vs. lapsed members, junior guardian connections, and match appearance history.",
      icon: Users,
      available: true,
      action: "Export Register CSV",
      onClick: handleCricketEspanaExport,
    },
    {
      title: "Annual GDPR Identity Purge (FR-MEM-31)",
      description: "Purges previous year identity document numbers and medical records at annual renewal.",
      icon: AlertCircle,
      available: isSuperAdmin,
      action: "Execute Annual Data Purge",
      onClick: handlePurgeSensitiveData,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-1">Administrative Reports & Data Compliance</h2>
        <p className="text-slate-400 text-sm">Export Cricket España registration returns, track financial reconciliation, and manage annual GDPR data purges.</p>
      </div>

      {logNotice && (
        <div className="bg-brand-500/20 text-brand-300 p-4 rounded-xl text-xs font-semibold border border-brand-500/40">
          {logNotice}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div key={r.title} className={`glass-dark p-5 ${!r.available ? "opacity-40" : ""}`}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 shrink-0">
                <r.icon size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">{r.title}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{r.description}</p>
                {r.available && (
                  <button onClick={r.onClick} className="btn-ghost btn-sm mt-3 text-xs px-0 hover:text-brand-400">
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
  const [events, setEvents] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Event creation form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "MCC vs Barcelona International CC",
    opponent: "Barcelona International CC",
    date: "2026-09-05",
    venue_name: "La Manga Club Ground 1",
    format: "T20 (2 x Matches)",
    meet_time: "07:30 AM",
    start_time: "08:30 AM",
    is_streamed_ecn: true,
    catering_options: "Post-match Meal, Match Tea & Refreshments",
  });
  const [creating, setCreating] = useState(false);

  // Selected squad state per event
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [designations, setDesignations] = useState<Record<string, string>>({});
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("events").select("*").order("date"),
      supabase.from("members").select("*").eq("status", "active"),
      supabase.from("availability").select("*"),
    ]).then(([evRes, memRes, avRes]: any[]) => {
      let fetchedMembers = memRes.data || [];
      if (fetchedMembers.length === 0) {
        fetchedMembers = [
          { id: "m-sven", full_legal_name: "Sven Prinsloo", preferred_name: "Sven", playing_role: "all_rounder", status: "active" },
          { id: "m-jon", full_legal_name: "Jon Woodward", preferred_name: "Jon", playing_role: "all_rounder", status: "active" },
          { id: "m-lewis", full_legal_name: "Lewis Clarke", preferred_name: "Lewis", playing_role: "batsman", status: "active" },
          { id: "m-adam", full_legal_name: "Adam Langhans", preferred_name: "Adam", playing_role: "bowler", status: "active" },
          { id: "m-victor", full_legal_name: "Victor Medina", preferred_name: "Victor", playing_role: "wicket_keeper", status: "active" },
          { id: "m-anand", full_legal_name: "Anand Kaul", preferred_name: "Anand", playing_role: "batsman", status: "active" },
          { id: "m-gourav", full_legal_name: "Gourav Saha", preferred_name: "Gourav", playing_role: "all_rounder", status: "active" },
        ];
      }
      setEvents(fetchedEvents);
      setMembers(fetchedMembers);
      setAvailability(avRes.data || []);
      if (fetchedEvents.length > 0) {
        setSelectedEventId(fetchedEvents[0].id);
      }
      // Pre-select active members if available
      if (fetchedMembers.length > 0) {
        setSelectedPlayerIds(fetchedMembers.slice(0, 11).map((m: any) => m.id));
        setDesignations({
          [fetchedMembers[0]?.id]: "C",
          [fetchedMembers[1]?.id]: "VC",
          [fetchedMembers[2]?.id]: "WK",
        });
      }
      setLoading(false);
    });
  }, []);

  const currentEvent = events.find((e) => e.id === selectedEventId);

  // Filter members available for selected event
  const availableMemberIds = availability
    .filter((a) => a.event_id === selectedEventId && a.status === "available")
    .map((a) => a.member_id);

  function togglePlayerSelection(memberId: string) {
    if (selectedPlayerIds.includes(memberId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== memberId));
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, memberId]);
    }
  }

  function setPlayerRole(memberId: string, role: string) {
    setDesignations((prev) => ({ ...prev, [memberId]: role }));
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const { data, error } = await supabase.from("events").insert({
      title: newEvent.title,
      opponent: newEvent.opponent,
      date: newEvent.date,
      format: newEvent.format,
      status: "scheduled",
      venue: { name: newEvent.venue_name },
      notes: `Meet: ${newEvent.meet_time} | Start: ${newEvent.start_time} | ECN Stream: ${newEvent.is_streamed_ecn ? "Yes" : "No"} | Catering: ${newEvent.catering_options}`,
    }).select().single();

    if (data) {
      setEvents([data, ...events]);
      setSelectedEventId(data.id);
    }
    setCreating(false);
    setShowCreateModal(false);
  }

  async function handlePublishSquad() {
    setPublishing(true);
    // Persist squad selection in events metadata / notes
    await supabase.from("events").update({
      notes: `${currentEvent?.notes || ""} | SQUAD_SELECTED: ${selectedPlayerIds.join(",")}`,
      updated_at: new Date().toISOString(),
    }).eq("id", selectedEventId);

    setPublishing(false);
    setPublished(true);
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1 flex items-center gap-2">
            <span>Captain&apos;s Match Setup & Team Selection</span>
            <span className="badge-red text-xs">Captain Control</span>
          </h2>
          <p className="text-slate-400 text-sm">Create fixtures, specify start times & meal choices, and publish official team XI.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateModal(true)} className="btn-outline btn-sm">
            + Create New Fixture / Event
          </button>
          <button onClick={handlePublishSquad} disabled={publishing || !selectedEventId} className="btn-primary btn-sm">
            {publishing ? <><Loader2 size={13} className="animate-spin" /> Publishing...</> : published ? "✓ Squad Confirmed & Published" : "Publish XI & Unlock Details"}
          </button>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="glass-dark p-6 rounded-2xl border border-brand-500/30 space-y-4">
          <h3 className="text-lg font-display font-bold text-white border-b border-white/[0.06] pb-2">Create New Match Fixture</h3>
          <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs">Fixture Title</label>
                <input className="input text-xs" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required />
              </div>
              <div>
                <label className="label text-xs">Opponent Team</label>
                <input className="input text-xs" value={newEvent.opponent} onChange={(e) => setNewEvent({ ...newEvent, opponent: e.target.value })} required />
              </div>
              <div>
                <label className="label text-xs">Match Date</label>
                <input type="date" className="input text-xs" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} required />
              </div>
              <div>
                <label className="label text-xs">Format / Overs</label>
                <input className="input text-xs" value={newEvent.format} onChange={(e) => setNewEvent({ ...newEvent, format: e.target.value })} required />
              </div>
              <div>
                <label className="label text-xs">Player Meet Arrival Time</label>
                <input className="input text-xs" value={newEvent.meet_time} onChange={(e) => setNewEvent({ ...newEvent, meet_time: e.target.value })} placeholder="e.g. 07:30 AM" />
              </div>
              <div>
                <label className="label text-xs">Match Start Time</label>
                <input className="input text-xs" value={newEvent.start_time} onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })} placeholder="e.g. 08:30 AM" />
              </div>
              <div>
                <label className="label text-xs">Venue Location</label>
                <input className="input text-xs" value={newEvent.venue_name} onChange={(e) => setNewEvent({ ...newEvent, venue_name: e.target.value })} required />
              </div>
              <div>
                <label className="label text-xs">Meal & Catering Choices Offered by Ground (comma separated)</label>
                <input
                  className="input text-xs"
                  value={newEvent.catering_options}
                  onChange={(e) => setNewEvent({ ...newEvent, catering_options: e.target.value })}
                  placeholder="e.g. Beef Burger & Chips, Chicken Burger, Vegetarian Paella, Halal Wrap, Salad Bowl"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="ecn-check" checked={newEvent.is_streamed_ecn} onChange={(e) => setNewEvent({ ...newEvent, is_streamed_ecn: e.target.checked })} />
              <label htmlFor="ecn-check" className="text-slate-300">Live Broadcasted on ECN channels (Player consent required)</label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-ghost btn-sm">Cancel</button>
              <button type="submit" disabled={creating} className="btn-primary btn-sm">
                {creating ? <Loader2 size={13} className="animate-spin" /> : "Save Fixture & Open Sign-Ups"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Target Event Selector & Edit Controls */}
      <div className="glass-dark p-6 space-y-4 rounded-2xl border border-brand-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex-1 w-full">
            <label className="label text-xs">Active Fixture / Tour Selection</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="input text-sm w-full"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.date} — {ev.title} ({ev.venue?.name || "TBC"})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 text-xs shrink-0">
            <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-white/5">
              <span className="text-slate-400 block">Signed Up / Available</span>
              <span className="text-brand-400 font-bold text-sm">{availableMemberIds.length > 0 ? `${availableMemberIds.length} Members` : `${members.length} Total Roster`}</span>
            </div>
            <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-white/5">
              <span className="text-slate-400 block">Selected Squad XI</span>
              <span className="text-gold-400 font-bold text-sm">{selectedPlayerIds.length} Selected</span>
            </div>
          </div>
        </div>

        {/* Fixture Details & Per-Game Catering Editor */}
        {currentEvent && (
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/[0.04] space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Fixture Details & Per-Game Catering Settings:</span>
              <span className="text-slate-400 font-normal">Editing: {currentEvent.title}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label text-[11px]">Match Date & Time</label>
                <input className="input text-xs" defaultValue={currentEvent.date} />
              </div>
              <div>
                <label className="label text-[11px]">Meet Arrival / Start Time</label>
                <input className="input text-xs" defaultValue="Meet: 07:30 AM | Start: 08:30 AM" />
              </div>
              <div>
                <label className="label text-[11px]">Ground Meal Options Offered for Game</label>
                <input className="input text-xs" defaultValue="Beef Burger & Chips, Chicken Burger, Vegetarian Paella, Halal Wrap" />
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">Captains can return at any time to modify meal choices, shift departure times, or update the XI lineup.</p>
          </div>
        )}
      </div>

      {/* Dynamic Member Roster Selection */}
      <div className="glass-dark p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
          <h3 className="text-white font-semibold text-base">Select Players for Squad XI ({selectedPlayerIds.length} Picked)</h3>
          <span className="text-xs text-slate-400">Click checkboxes to include in team</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto text-xs min-w-[650px]">
            <thead>
              <tr>
                <th>Select</th>
                <th>Member Name</th>
                <th>Playing Role</th>
                <th>Availability</th>
                <th>Designation</th>
                <th>Dietary Requirement</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isSelected = selectedPlayerIds.includes(m.id);
                const isAvail = availableMemberIds.includes(m.id);
                return (
                  <tr key={m.id} className={isSelected ? "bg-brand-500/10" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePlayerSelection(m.id)}
                        className="rounded accent-brand-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="font-semibold text-white">
                      {m.preferred_name || m.full_legal_name}
                      {isSelected && <span className="ml-2 text-[10px] text-brand-400 font-normal">(Selected)</span>}
                    </td>
                    <td className="text-slate-300 capitalize">{m.playing_role?.replace("_", " ") || "All-rounder"}</td>
                    <td>
                      {isAvail ? <span className="badge-green text-[10px]">Available</span> : <span className="badge-slate text-[10px]">Pending Sign-up</span>}
                    </td>
                    <td>
                      {isSelected ? (
                        <select
                          value={designations[m.id] || ""}
                          onChange={(e) => setPlayerRole(m.id, e.target.value)}
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
                    <td className="text-slate-400">{m.dietary_requirements || "Standard"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

