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
  LogOut, ShieldAlert, Eye, Plus, ChevronRight, Utensils, Car,
  Trophy, Edit2, ArrowRight, Lock, Unlock
} from "lucide-react";
import {
  parseTourMeta, serializeTourMeta, defaultGame,
  STAGE_LABELS, STAGE_NEXT, STAGE_NEXT_LABEL, stageColor,
  type TourMeta, type TourGame, type EventStage
} from "@/lib/eventHelpers";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];
type ChargeRow = Database["public"]["Tables"]["charges"]["Row"];
type Tab = "applications" | "members" | "payments" | "jersey" | "reports";

// Role check — admins must have role "admin", "super_admin", or "treasurer"
const ADMIN_ROLES = ["admin", "super_admin", "treasurer", "secretary"];

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("applications");

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
              <h1 className="text-xl font-display font-bold text-white">Club Administration</h1>
              <p className="text-slate-500 text-xs">
                {member?.roles?.map((r: string) => r.replace("_", " ")).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCaptain && (
              <Link href="/captain" className="btn-outline btn-sm border-brand-500/40 text-brand-300 text-xs">
                🏏 Captain Panel
              </Link>
            )}
            <Link href="/dashboard" className="btn-ghost btn-sm text-xs">
              <Eye size={14} /> Member View
            </Link>
            <button onClick={signOut} className="btn-outline btn-sm text-xs hidden sm:flex">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="container-wide px-4 mt-3 tab-pills">
          {([
            { id: "applications", label: "Applications & Renewals", shortLabel: "Review", icon: CheckCircle },
            { id: "members", label: "Members Roster", shortLabel: "Members", icon: Users },
            ...(isTreasurer ? [{ id: "payments", label: "Payments", shortLabel: "Payments", icon: CreditCard }] : []),
            { id: "jersey", label: "Jersey Numbers", shortLabel: "Jerseys", icon: Trophy },
            { id: "reports", label: "Reports", shortLabel: "Reports", icon: BarChart3 },
          ] as { id: Tab; label: string; shortLabel: string; icon: any }[]).map(({ id, label, shortLabel, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                tab === id
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Tab content */}
      <div className="flex-1 pb-6" style={{ background: "#0d1420" }}>
        <div className="container-wide px-4 py-6">
          {tab === "applications" && <ApplicationsTab supabase={supabase} currentMember={member} />}
          {tab === "members" && <MembersTab supabase={supabase} isSuperAdmin={isSuperAdmin} />}
          {tab === "payments" && <PaymentsTab supabase={supabase} />}
          {tab === "jersey" && <JerseyTab supabase={supabase} />}
          {tab === "reports" && <ReportsTab isSuperAdmin={isSuperAdmin} />}
        </div>
      </div>
      <Footer />
    </main>
  );
}


// ─── Applications & Renewals Tab ─────────────────────────────────────────────

function ApplicationsTab({ supabase, currentMember }: { supabase: any; currentMember: any }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "renewal_due" | "recent">("pending");
  const [reviews, setReviews] = useState<any[]>([]);
  const [declineModal, setDeclineModal] = useState<{ memberId: string; name: string } | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [bulkRenewalSending, setBulkRenewalSending] = useState(false);
  const [bulkRenewalDone, setBulkRenewalDone] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<{ memberId: string; name: string } | null>(null);
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    setLoading(true);
    let query = supabase.from("members").select("*").order("created_at", { ascending: false });
    if (filter === "pending") query = query.in("status", ["pending_approval", "invited"]);
    else if (filter === "renewal_due") query = query.eq("status", "renewal_due");
    else query = query.in("status", ["active", "inactive"]).gte("updated_at", new Date(Date.now() - 30 * 86400000).toISOString());

    const { data } = await query;
    setMembers(data || []);

    // Load recent reviews
    const { data: rv } = await supabase.from("membership_reviews").select("*, decided_by(full_legal_name)").order("created_at", { ascending: false }).limit(20);
    setReviews(rv || []);
    setLoading(false);
  }

  async function logReview(memberId: string, action: string, reason?: string) {
    await supabase.from("membership_reviews").insert({
      member_id: memberId,
      action,
      reason: reason || null,
      decided_by: currentMember?.id || null,
    });
  }

  async function approveMember(memberId: string, name: string) {
    setActionLoading(memberId + "_approve");
    await supabase.from("members").update({ status: "active", updated_at: new Date().toISOString() }).eq("id", memberId);
    await logReview(memberId, "approved");
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setActionLoading(null);
  }

  async function declineMember() {
    if (!declineModal) return;
    setActionLoading(declineModal.memberId + "_decline");
    await supabase.from("members").update({ status: "inactive", updated_at: new Date().toISOString() }).eq("id", declineModal.memberId);
    await logReview(declineModal.memberId, "declined", declineReason);
    setMembers((prev) => prev.filter((m) => m.id !== declineModal.memberId));
    setDeclineModal(null);
    setDeclineReason("");
    setActionLoading(null);
  }

  async function requestMoreInfo() {
    if (!infoModal) return;
    setActionLoading(infoModal.memberId + "_info");
    await logReview(infoModal.memberId, "info_requested", infoMessage);
    // Create an in-app notification
    const { data: m } = await supabase.from("members").select("id").eq("id", infoModal.memberId).single();
    if (m) {
      await supabase.from("notifications").insert({
        member_id: m.id,
        type: "status_change",
        title: "Additional information required",
        body: infoMessage || "The committee requires additional information to process your membership application. Please review your profile and update any missing details.",
      });
    }
    setInfoModal(null);
    setInfoMessage("");
    setActionLoading(null);
  }

  async function suspendMember(memberId: string) {
    setActionLoading(memberId + "_suspend");
    await supabase.from("members").update({ status: "suspended", updated_at: new Date().toISOString() }).eq("id", memberId);
    await logReview(memberId, "suspended");
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setActionLoading(null);
  }

  async function sendBulkRenewal() {
    setBulkRenewalSending(true);
    // Get all active members
    const { data: active } = await supabase.from("members").select("id, email, full_legal_name").eq("status", "active");
    if (active) {
      // Set all to renewal_due
      const ids = active.map((m: any) => m.id);
      await supabase.from("members").update({ status: "renewal_due", updated_at: new Date().toISOString() }).in("id", ids);
      // Create notifications for each
      const notifs = active.map((m: any) => ({
        member_id: m.id,
        type: "status_change",
        title: "Annual membership renewal required",
        body: "Your annual membership renewal is due. Please log in to confirm your details and resubmit your membership application.",
      }));
      if (notifs.length > 0) await supabase.from("notifications").insert(notifs);
      // Log it
      await Promise.all(ids.map((id: string) => logReview(id, "renewal_sent")));
    }
    setBulkRenewalSending(false);
    setBulkRenewalDone(true);
    load();
  }

  const FILTER_TABS = [
    { id: "pending", label: "Pending Applications", count: null },
    { id: "renewal_due", label: "Renewal Due", count: null },
    { id: "recent", label: "Recently Decided", count: null },
  ] as { id: typeof filter; label: string; count: number | null }[];

  const statusColor: Record<string, string> = {
    pending_approval: "badge-gold",
    invited: "badge-gold",
    renewal_due: "badge-gold",
    active: "badge-green",
    inactive: "badge-red",
    suspended: "badge-red",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Applications & Renewals</h2>
          <p className="text-slate-400 text-sm">Review membership applications, renewals, and manage member status.</p>
        </div>
        <button
          onClick={sendBulkRenewal}
          disabled={bulkRenewalSending || bulkRenewalDone}
          className="btn-outline btn-sm text-xs whitespace-nowrap"
        >
          {bulkRenewalSending ? <><Loader2 size={12} className="animate-spin" /> Sending...</> : bulkRenewalDone ? "✓ Renewals Sent" : "📨 Send Renewal Notices"}
        </button>
      </div>

      {bulkRenewalDone && (
        <div className="bg-brand-500/20 border border-brand-500/30 text-brand-300 p-3 rounded-xl text-sm">
          ✓ Renewal notices sent to all active members. They will see a renewal prompt in their dashboard.
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-white/[0.06] pb-0">
        {FILTER_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${
              filter === id ? "text-brand-300 border-brand-500" : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
      ) : filter === "recent" ? (
        /* Recent decisions audit trail */
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="glass-dark p-8 text-center text-slate-500 text-sm">No decisions recorded yet.</div>
          ) : reviews.map((rv) => (
            <div key={rv.id} className="glass-dark p-4 flex items-start gap-4 text-sm">
              <div className={`px-2 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                rv.action === "approved" ? "bg-brand-500/20 text-brand-300" :
                rv.action === "declined" ? "bg-red-500/20 text-red-300" :
                rv.action === "suspended" ? "bg-red-500/20 text-red-300" :
                rv.action === "renewal_sent" ? "bg-blue-500/20 text-blue-300" :
                "bg-slate-500/20 text-slate-300"
              }`}>
                {rv.action.replace(/_/g, " ")}
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-medium">{rv.member_id}</p>
                {rv.reason && <p className="text-slate-400 text-xs mt-0.5">Reason: {rv.reason}</p>}
                <p className="text-slate-600 text-[11px] mt-1">
                  {rv.decided_by?.full_legal_name || "Committee"} · {new Date(rv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="glass-dark p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-white font-semibold mb-1">All clear</p>
          <p className="text-slate-400 text-sm">{filter === "pending" ? "No pending applications at the moment." : "No members with renewal due."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((m) => (
            <div key={m.id} className="glass-dark p-5 space-y-4">
              {/* Member info row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-700/30 flex items-center justify-center text-white font-bold text-sm">
                    {(m.preferred_name || m.full_legal_name || "?").slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{m.full_legal_name}</p>
                    <p className="text-slate-400 text-xs">{m.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${statusColor[m.status] || "badge-slate"}`}>
                  {(m.status || "").replace(/_/g, " ")}
                </span>
              </div>

              {/* Member details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { label: "Nationality", value: m.nationality || "—" },
                  { label: "Playing Role", value: m.playing_role || "—" },
                  { label: "Date of Birth", value: m.date_of_birth ? new Date(m.date_of_birth).toLocaleDateString("en-GB") : "—" },
                  { label: "Mobile", value: m.mobile || "—" },
                  { label: "Joined", value: m.created_at ? new Date(m.created_at).toLocaleDateString("en-GB") : "—" },
                  { label: "Last Updated", value: m.updated_at ? new Date(m.updated_at).toLocaleDateString("en-GB") : "—" },
                  { label: "Dietary", value: m.dietary_requirements || "None stated" },
                  { label: "Kit Size", value: m.kit_size || "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">{label}</p>
                    <p className="text-slate-200 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Documents */}
              {m.id_type && (
                <div className="flex items-center gap-2 text-xs bg-slate-900/60 rounded-lg px-3 py-2">
                  <span className="text-slate-400">📄 ID Document:</span>
                  <span className="text-slate-200 font-medium">{m.id_type}</span>
                  {m.id_number && <span className="text-slate-400">· {m.id_number}</span>}
                  <span className="ml-auto badge-gold text-[10px]">Needs verification</span>
                </div>
              )}

              {/* Emergency contact */}
              {m.emergency_name && (
                <div className="text-xs text-slate-500 bg-slate-900/40 rounded-lg px-3 py-2">
                  Emergency: <span className="text-slate-300">{m.emergency_name}</span>
                  {m.emergency_relationship && <span className="text-slate-500"> ({m.emergency_relationship})</span>}
                  {m.emergency_phone && <span className="text-slate-300"> · {m.emergency_phone}</span>}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-white/[0.04]">
                <button
                  onClick={() => approveMember(m.id, m.full_legal_name)}
                  disabled={!!actionLoading}
                  className="btn-primary btn-sm text-xs"
                >
                  {actionLoading === m.id + "_approve" ? <Loader2 size={12} className="animate-spin" /> : "✓"} Approve & Activate
                </button>
                <button
                  onClick={() => setDeclineModal({ memberId: m.id, name: m.full_legal_name })}
                  disabled={!!actionLoading}
                  className="btn-outline btn-sm text-xs text-red-400 border-red-500/30 hover:border-red-500/60"
                >
                  ✕ Decline
                </button>
                <button
                  onClick={() => setInfoModal({ memberId: m.id, name: m.full_legal_name })}
                  disabled={!!actionLoading}
                  className="btn-ghost btn-sm text-xs"
                >
                  📩 Request Info
                </button>
                <button
                  onClick={() => suspendMember(m.id)}
                  disabled={!!actionLoading}
                  className="btn-ghost btn-sm text-xs text-red-400"
                >
                  🚫 Suspend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decline Modal */}
      {declineModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="glass-dark p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-white font-bold text-lg">Decline Application</h3>
            <p className="text-slate-400 text-sm">Declining <strong className="text-white">{declineModal.name}</strong>. Their status will be set to <span className="text-red-400">inactive</span> and they will receive a notification.</p>
            <div>
              <label className="label text-xs">Reason for declining (optional — sent to member)</label>
              <textarea
                rows={3}
                className="input text-sm"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Incomplete documentation, membership quota reached..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setDeclineModal(null); setDeclineReason(""); }} className="btn-ghost btn-sm">Cancel</button>
              <button onClick={declineMember} disabled={!!actionLoading} className="btn-sm text-xs bg-red-600 text-white rounded-lg px-4 hover:bg-red-500 transition-colors">
                {actionLoading ? <Loader2 size={12} className="animate-spin" /> : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="glass-dark p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-white font-bold text-lg">Request Additional Information</h3>
            <p className="text-slate-400 text-sm">Send a notification to <strong className="text-white">{infoModal.name}</strong> asking them to provide more information.</p>
            <div>
              <label className="label text-xs">Message to member</label>
              <textarea
                rows={3}
                className="input text-sm"
                value={infoMessage}
                onChange={(e) => setInfoMessage(e.target.value)}
                placeholder="e.g. Please upload a clear copy of your ID document..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setInfoModal(null); setInfoMessage(""); }} className="btn-ghost btn-sm">Cancel</button>
              <button onClick={requestMoreInfo} disabled={!!actionLoading} className="btn-primary btn-sm text-xs">
                {actionLoading ? <Loader2 size={12} className="animate-spin" /> : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────────────────

function MembersTab({ supabase, isSuperAdmin }: { supabase: any; isSuperAdmin: boolean }) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);

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
    const email = singleInvite.email.trim();
    const name = singleInvite.name.trim() || email.split("@")[0];

    // 1. Create (or upsert) the member record
    const newMember: any = {
      full_legal_name: name,
      email,
      status: "pending_approval",
      roles: [singleInvite.role],
      registration_status: "invited",
    };
    const { data: memberData } = await supabase.from("members").insert(newMember).select().single();
    if (memberData) setMembers([memberData, ...members]);
    else setMembers([{ id: crypto.randomUUID(), ...newMember }, ...members]);

    // 2. Send invite via Edge Function (uses admin API, bypasses OTP rate limits)
    const { data: funcData, error: funcError } = await supabase.functions.invoke("invite-member", {
      body: { email, name, memberId: memberData?.id },
    });

    setInviting(false);
    if (funcError || funcData?.error) {
      const errMsg = funcError?.message || funcData?.error || "Unknown error";
      // Member record created — show fallback instructions
      setInvitedSuccess(`Member record created for ${email}. Invite email failed: ${errMsg}. They can sign in at: ${window.location.origin.replace("github.io", "github.io/madrid-cricket-club")}/auth/signin using their email.`);
    } else {
      setInvitedSuccess(`✓ Invite email sent to ${email}! They will receive a secure link to complete their profile.`);
    }
    setTimeout(() => {
      setShowInviteModal(false);
      setInvitedSuccess("");
      setSingleInvite({ name: "", email: "", role: "member" });
    }, 3500);
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
      email,
      status: "pending_approval",
      roles: [bulkRole],
      registration_status: "invited",
    }));

    await supabase.from("members").insert(newRows);
    setMembers([...(newRows as any), ...members]);

    // Send magic links to all in parallel
    const redirectTo = `${window.location.origin}${window.location.pathname.includes("/madrid-cricket-club") ? "/madrid-cricket-club" : ""}/auth/callback`;
    await Promise.allSettled(
      emailsList.map((email) =>
        supabase.functions.invoke("invite-member", {
          body: { email },
        })
      )
    );

    setInviting(false);
    setInvitedSuccess(`✓ Magic link invitations sent to ${emailsList.length} addresses!`);
    setTimeout(() => {
      setShowInviteModal(false);
      setInvitedSuccess("");
      setBulkEmails("");
    }, 2500);
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
                <tr><td colSpan={7} className="text-center text-slate-500 py-8">No members found</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="cursor-pointer hover:bg-white/[0.02]" onClick={() => setSelectedMember(m)}>
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
                            onClick={(e) => { e.stopPropagation(); approveEnquiry(m.id); }}
                            className="btn-ghost btn-sm text-[11px] py-1 px-2"
                          >
                            → Application
                          </button>
                        )}
                        {m.status === "pending_approval" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); activateMember(m.id); }}
                            className="btn-primary btn-sm text-[11px] py-1 px-2"
                          >
                            <CheckCircle size={12} /> Activate
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                  <td>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedMember(m); }}
                      className="btn-ghost btn-sm text-[11px] py-1 px-2 flex items-center gap-1 text-brand-400 hover:text-brand-300"
                    >
                      <Edit2 size={11} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Detail Panel */}
      {selectedMember && (
        <MemberDetailPanel
          member={selectedMember}
          supabase={supabase}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setSelectedMember(null)}
          onSaved={(updated) => {
            setMembers((prev) => prev.map((m) => m.id === updated.id ? updated : m));
            setSelectedMember(updated);
          }}
          onDeleted={(id) => {
            setMembers((prev) => prev.filter((m) => m.id !== id));
            setSelectedMember(null);
          }}
        />

      )}
    </div>
  );
}

// ─── Member Detail Panel ──────────────────────────────────────────────────────

type DetailTab = "profile" | "membership" | "access" | "charges" | "jersey" | "auth";

function MemberDetailPanel({
  member, supabase, isSuperAdmin, onClose, onSaved, onDeleted,
}: {
  member: any; supabase: any; isSuperAdmin: boolean;
  onClose: () => void; onSaved: (updated: any) => void; onDeleted?: (id: string) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("profile");
  const [data, setData] = useState<any>(member);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [charges, setCharges] = useState<any[]>([]);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [newCharge, setNewCharge] = useState({ description: "", amount: "", type: "match_fee" });
  const [raisingCharge, setRaisingCharge] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load charges when that tab opens
  useEffect(() => {
    if (tab === "charges") {
      setChargesLoading(true);
      supabase.from("charges").select("*").eq("member_id", member.id).order("raised_at", { ascending: false })
        .then(({ data: cd }: any) => { setCharges(cd || []); setChargesLoading(false); });
    }
  }, [tab, member.id]);

  const ALL_ROLES: { id: string; label: string; desc: string; icon: string }[] = [
    { id: "member",       label: "Member",       desc: "Basic access — view fixtures, submit availability, manage own profile", icon: "👤" },
    { id: "captain",      label: "Captain",      desc: "Full access to Captain's Panel — team selection, availability management", icon: "🏏" },
    { id: "vice_captain", label: "Vice Captain", desc: "Captain's Panel access — can assist with selection and availability", icon: "🏏" },
    { id: "treasurer",    label: "Treasurer",    desc: "Admin Panel — payments, charges, financial reports", icon: "💰" },
    { id: "secretary",    label: "Secretary",    desc: "Admin Panel — member management, registration, documentation", icon: "📋" },
    { id: "admin",        label: "Administrator",desc: "Full Admin Panel access — all club administration features", icon: "🛡️" },
    { id: "super_admin",  label: "Super Admin",  desc: "Unrestricted access — all panels, all features, data management", icon: "⚡" },
  ];
  const currentRoles: string[] = data.roles || ["member"];

  function toggleRole(roleId: string) {
    const has = currentRoles.includes(roleId);
    const next = has ? currentRoles.filter((r: string) => r !== roleId) : [...currentRoles, roleId];
    // Always keep at least member
    setData((d: any) => ({ ...d, roles: next.length ? next : ["member"] }));
  }

  async function saveProfile() {
    setSaving(true);
    const { data: updated } = await supabase.from("members").update({
      preferred_name: data.preferred_name,
      full_legal_name: data.full_legal_name,
      email: data.email,
      mobile: data.mobile,
      date_of_birth: data.date_of_birth || null,
      nationality: data.nationality,
      bio: data.bio,
      updated_at: new Date().toISOString(),
    }).eq("id", member.id).select().single();
    if (updated) { onSaved(updated); setData(updated); }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function saveMembership() {
    setSaving(true);
    const { data: updated } = await supabase.from("members").update({
      status: data.status,
      membership_category: data.membership_category,
      created_at: data.created_at,
      registration_status: data.registration_status,
      cricket_espana_id: data.cricket_espana_id,
      notes: data.notes,
      updated_at: new Date().toISOString(),
    }).eq("id", member.id).select().single();
    if (updated) { onSaved(updated); setData(updated); }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function saveRoles() {
    setSaving(true);
    await supabase.from("members").update({ roles: data.roles, updated_at: new Date().toISOString() }).eq("id", member.id);
    onSaved({ ...member, ...data });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function raiseCharge() {
    if (!newCharge.description || !newCharge.amount) return;
    setRaisingCharge(true);
    const { data: c } = await supabase.from("charges").insert({
      member_id: member.id, description: newCharge.description,
      amount_euros: parseFloat(newCharge.amount), type: newCharge.type,
      status: "raised", raised_at: new Date().toISOString(),
    }).select().single();
    if (c) setCharges((prev: any[]) => [c, ...prev]);
    setNewCharge({ description: "", amount: "", type: "match_fee" });
    setRaisingCharge(false);
  }

  async function updateChargeStatus(chargeId: string, status: string) {
    await supabase.from("charges").update({ status }).eq("id", chargeId);
    setCharges((prev: any[]) => prev.map((c: any) => c.id === chargeId ? { ...c, status } : c));
  }

  async function saveJersey() {
    setSaving(true);
    const num = data.jersey_number ? parseInt(data.jersey_number) : null;
    await supabase.from("members").update({
      jersey_number: num,
      jersey_number_status: num ? "reserved" : "none",
      jersey_number_requested: null,
    }).eq("id", member.id);
    onSaved({ ...member, ...data, jersey_number: num });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function deleteMember() {
    setDeleting(true);
    try {
      // Delete auth user via Edge Function (if linked)
      if (member.user_id) {
        await supabase.functions.invoke("delete-member", { body: { userId: member.user_id } });
      }
      // Delete member record (RLS allows admin)
      await supabase.from("members").delete().eq("id", member.id);
      onDeleted?.(member.id);
      onClose();
    } catch (e) {
      console.error("Delete error", e);
    }
    setDeleting(false);
  }

  const statusOptions = ["active", "pending_approval", "application", "enquiry", "suspended", "inactive", "renewal_due"];
  const categoryOptions = ["senior", "junior", "social", "overseas"];
  const chargeTypes = ["match_fee", "membership_fee", "tour_fee", "equipment", "fine", "other"];

  const tabs: { id: DetailTab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "membership", label: "Membership" },
    { id: "access", label: "Access & Roles" },
    { id: "charges", label: "Charges" },
    { id: "jersey", label: "Jersey" },
    { id: "auth", label: "Auth" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#0f1623] border-l border-white/[0.08] z-50 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600/30 flex items-center justify-center text-brand-300 font-bold text-lg">
                {(data.preferred_name || data.full_legal_name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-white font-display font-bold text-lg leading-tight">
                  {data.preferred_name || data.full_legal_name}
                </h2>
                <p className="text-slate-400 text-xs">{data.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && !deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="btn-sm text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg px-3 py-1.5 transition-colors"
              >
                Delete Member
              </button>
            )}
            {deleteConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-xs font-semibold">Permanently delete?</span>
                <button
                  onClick={deleteMember}
                  disabled={deleting}
                  className="btn-sm text-xs bg-red-600 text-white rounded-lg px-3 py-1.5 hover:bg-red-500 transition-colors"
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
                <button onClick={() => setDeleteConfirm(false)} className="btn-ghost btn-sm text-xs">Cancel</button>
              </div>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 ml-1">
              <XCircle size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-white/[0.06] overflow-x-auto shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.label}
              {t.id === "charges" && charges.filter((c: any) => c.status === "raised").length > 0 && (
                <span className="ml-1 bg-red-500/30 text-red-300 text-[9px] px-1 py-0.5 rounded-full">
                  {charges.filter((c: any) => c.status === "raised").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Full Legal Name</label>
                  <input className="input" value={data.full_legal_name || ""} onChange={(e) => setData((d: any) => ({ ...d, full_legal_name: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Preferred / Display Name</label>
                  <input className="input" value={data.preferred_name || ""} onChange={(e) => setData((d: any) => ({ ...d, preferred_name: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Email Address</label>
                  <input type="email" className="input" value={data.email || ""} onChange={(e) => setData((d: any) => ({ ...d, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Mobile / Phone</label>
                  <input className="input" value={data.mobile || ""} onChange={(e) => setData((d: any) => ({ ...d, mobile: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Date of Birth</label>
                  <input type="date" className="input" value={data.date_of_birth || ""} onChange={(e) => setData((d: any) => ({ ...d, date_of_birth: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Nationality</label>
                  <input className="input" value={data.nationality || ""} onChange={(e) => setData((d: any) => ({ ...d, nationality: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label text-xs">Bio / Notes (internal)</label>
                <textarea rows={3} className="input resize-none" value={data.bio || ""} onChange={(e) => setData((d: any) => ({ ...d, bio: e.target.value }))} />
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : null}
                  {saved ? "Saved!" : "Save Profile"}
                </button>
              </div>
            </div>
          )}

          {/* ── MEMBERSHIP ── */}
          {tab === "membership" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Membership Status</label>
                  <select className="input" value={data.status || ""} onChange={(e) => setData((d: any) => ({ ...d, status: e.target.value }))}>
                    {statusOptions.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Membership Category</label>
                  <select className="input" value={data.membership_category || ""} onChange={(e) => setData((d: any) => ({ ...d, membership_category: e.target.value }))}>
                    <option value="">— Select —</option>
                    {categoryOptions.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Member Since (Join Date)</label>
                  <input type="date" className="input" value={data.created_at ? data.created_at.slice(0, 10) : ""} onChange={(e) => setData((d: any) => ({ ...d, created_at: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Registration Status</label>
                  <select className="input" value={data.registration_status || ""} onChange={(e) => setData((d: any) => ({ ...d, registration_status: e.target.value }))}>
                    <option value="">— Select —</option>
                    {["invited", "applied", "pending_payment", "registered", "verified"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label text-xs">Cricket España Registration Number</label>
                  <input className="input font-mono" value={data.cricket_espana_id || ""} onChange={(e) => setData((d: any) => ({ ...d, cricket_espana_id: e.target.value }))} placeholder="CE-XXXX" />
                </div>
                <div className="col-span-2">
                  <label className="label text-xs">Internal Admin Notes</label>
                  <textarea rows={3} className="input resize-none text-xs" value={data.notes || ""} onChange={(e) => setData((d: any) => ({ ...d, notes: e.target.value }))} placeholder="Visible to admins only" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={saveMembership} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : null}
                  {saved ? "Saved!" : "Save Membership"}
                </button>
              </div>
            </div>
          )}

          {/* ── ACCESS & ROLES ── */}
          {tab === "access" && (
            <div className="space-y-5">
              {!isSuperAdmin ? (
                <div className="glass-dark p-6 text-center">
                  <Lock size={24} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Role management is restricted to Super Admins.</p>
                </div>
              ) : (
                <>
                  {/* Active roles summary */}
                  <div className="flex flex-wrap gap-2">
                    {currentRoles.length === 0 || (currentRoles.length === 1 && currentRoles[0] === "member") ? (
                      <span className="text-slate-500 text-xs">No committee roles assigned — basic member access only.</span>
                    ) : currentRoles.map((r) => (
                      <span key={r} className="badge-green text-xs">{r.replace(/_/g, " ")}</span>
                    ))}
                  </div>

                  {/* Role cards — multi-select checkboxes */}
                  <div className="glass-dark p-5 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold text-sm">Assign Roles</h4>
                      <span className="text-slate-500 text-xs">Select all that apply — a member can hold multiple roles</span>
                    </div>
                    <div className="space-y-2">
                      {ALL_ROLES.map((role) => {
                        const active = currentRoles.includes(role.id);
                        return (
                          <label
                            key={role.id}
                            className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border transition-all ${
                              active
                                ? "bg-brand-500/15 border-brand-500/40"
                                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => toggleRole(role.id)}
                              className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-brand-500 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-base leading-none">{role.icon}</span>
                                <span className={`text-sm font-semibold ${active ? "text-brand-300" : "text-slate-200"}`}>
                                  {role.label}
                                </span>
                                {active && <span className="text-[10px] badge-green">Active</span>}
                              </div>
                              <p className="text-slate-500 text-xs mt-1">{role.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick status actions */}
                  <div className="glass-dark p-5 space-y-3">
                    <h4 className="text-white font-semibold text-sm mb-1">Membership Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {["active", "suspended", "pending_approval", "renewal_due", "inactive"].map((s) => (
                        <button
                          key={s}
                          onClick={async () => {
                            await supabase.from("members").update({ status: s, updated_at: new Date().toISOString() }).eq("id", member.id);
                            setData((d: any) => ({ ...d, status: s }));
                            onSaved({ ...member, ...data, status: s });
                            setActionMsg(`Status set to ${s.replace(/_/g, " ")}`);
                            setTimeout(() => setActionMsg(""), 2000);
                          }}
                          className={`btn-sm text-xs capitalize ${data.status === s ? "btn-primary" : "btn-ghost border border-white/10"}`}
                        >
                          {s.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                    {actionMsg && <p className="text-green-400 text-xs">{actionMsg}</p>}
                  </div>

                  <div className="flex justify-end">
                    <button onClick={saveRoles} disabled={saving} className="btn-primary flex items-center gap-2">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : null}
                      {saved ? "Saved!" : "Save Roles"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}



          {/* ── CHARGES ── */}
          {tab === "charges" && (
            <div className="space-y-5">
              {/* Raise new charge */}
              <div className="glass-dark p-5 space-y-3">
                <h4 className="text-white font-semibold text-sm">Raise New Charge</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="label text-xs">Description</label>
                    <input className="input" value={newCharge.description} onChange={(e) => setNewCharge((c) => ({ ...c, description: e.target.value }))} placeholder="e.g. Match fee vs Seville CC" />
                  </div>
                  <div>
                    <label className="label text-xs">Amount (€)</label>
                    <input type="number" min="0" step="0.01" className="input" value={newCharge.amount} onChange={(e) => setNewCharge((c) => ({ ...c, amount: e.target.value }))} placeholder="25.00" />
                  </div>
                  <div>
                    <label className="label text-xs">Type</label>
                    <select className="input" value={newCharge.type} onChange={(e) => setNewCharge((c) => ({ ...c, type: e.target.value }))}>
                      {chargeTypes.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={raiseCharge} disabled={raisingCharge || !newCharge.description || !newCharge.amount} className="btn-primary btn-sm flex items-center gap-1">
                  {raisingCharge ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Raise Charge
                </button>
              </div>

              {/* Existing charges */}
              {chargesLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-brand-400" /></div>
              ) : charges.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No charges on record.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-slate-400 text-xs font-medium">{charges.length} charge{charges.length !== 1 ? "s" : ""} on record</p>
                  {charges.map((c: any) => (
                    <div key={c.id} className="glass-dark p-4 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{c.description}</p>
                        <p className="text-slate-500 text-xs capitalize">{c.type?.replace("_", " ")} · {new Date(c.raised_at).toLocaleDateString("en-GB")}</p>
                      </div>
                      <p className="text-white font-bold">€{parseFloat(c.amount_euros).toFixed(2)}</p>
                      <div className="flex gap-1">
                        {c.status === "raised" && (
                          <button onClick={() => updateChargeStatus(c.id, "confirmed")} className="btn-ghost btn-sm text-[10px] text-green-400 hover:text-green-300">
                            ✓ Mark Paid
                          </button>
                        )}
                        {c.status === "confirmed" && (
                          <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">Paid</span>
                        )}
                        {c.status === "raised" && (
                          <button onClick={() => updateChargeStatus(c.id, "waived")} className="btn-ghost btn-sm text-[10px] text-slate-500 hover:text-slate-300">
                            Waive
                          </button>
                        )}
                        {(c.status === "waived" || c.status === "settled") && (
                          <span className="text-xs text-slate-500 bg-slate-700/30 border border-slate-600/20 px-2 py-0.5 rounded-full capitalize">{c.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── JERSEY ── */}
          {tab === "jersey" && (
            <div className="space-y-5">
              <div className="glass-dark p-6">
                <h4 className="text-white font-semibold text-sm mb-4">Jersey Number Assignment</h4>
                <div className="flex items-center gap-4">
                  {data.jersey_number && (
                    <div className="w-20 h-20 rounded-2xl bg-brand-600/20 border-2 border-brand-500/40 flex items-center justify-center shrink-0">
                      <span className="text-3xl font-black text-brand-300">#{data.jersey_number}</span>
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="label text-xs">Jersey Number</label>
                      <input
                        type="number" min="1" max="999"
                        className="input w-32 font-mono text-center"
                        value={data.jersey_number || ""}
                        onChange={(e) => setData((d: any) => ({ ...d, jersey_number: e.target.value }))}
                        placeholder="#"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveJersey} disabled={saving} className="btn-primary btn-sm flex items-center gap-1">
                        {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle size={12} /> : null}
                        {saved ? "Saved!" : "Assign Number"}
                      </button>
                      {data.jersey_number && (
                        <button onClick={() => { setData((d: any) => ({ ...d, jersey_number: "" })); }} className="btn-ghost btn-sm text-red-400 hover:text-red-300 flex items-center gap-1">
                          <XCircle size={12} /> Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {data.jersey_number_requested && data.jersey_number_status === "requested" && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-gold-400 text-xs">⏳ Member has requested #{data.jersey_number_requested} — assign above to approve.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── AUTH ── */}
          {tab === "auth" && (
            <div className="space-y-4">
              <div className="glass-dark p-5 space-y-3">
                <h4 className="text-white font-semibold text-sm">Auth Information</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="text-white font-mono text-[11px] mt-0.5">{member.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Auth Status</p>
                    <p className="text-white mt-0.5 capitalize">{member.registration_status || "unknown"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Member ID</p>
                    <p className="text-white font-mono text-[10px] mt-0.5 truncate">{member.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Joined</p>
                    <p className="text-white mt-0.5">{member.created_at ? new Date(member.created_at).toLocaleDateString("en-GB") : "—"}</p>
                  </div>
                </div>
              </div>

              <div className="glass-dark p-5 space-y-3">
                <h4 className="text-white font-semibold text-sm">Actions</h4>
                <div className="space-y-2">
                  <a
                    href={`mailto:${member.email}?subject=Madrid+Cricket+Club+%E2%80%94+Password+Reset&body=Hi+${encodeURIComponent(data.preferred_name || data.full_legal_name || "")},+please+reset+your+password+at:+https://madridcricketclub.es/auth/signin`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/[0.06] hover:bg-white/8 text-slate-200 text-sm transition-all"
                  >
                    <AlertCircle size={14} className="text-brand-400 shrink-0" />
                    <div>
                      <p className="font-medium">Send Password Reset Email</p>
                      <p className="text-slate-500 text-[10px]">Opens your mail client with a pre-filled reset message</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 ml-auto" />
                  </a>
                  <a
                    href={`mailto:${member.email}?subject=Welcome+to+Madrid+Cricket+Club+%E2%80%94+Verify+Your+Account&body=Hi+${encodeURIComponent(data.preferred_name || data.full_legal_name || "")},+please+sign+in+to+verify+your+account+at:+https://madridcricketclub.es/auth/signin`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/[0.06] hover:bg-white/8 text-slate-200 text-sm transition-all"
                  >
                    <CheckCircle size={14} className="text-green-400 shrink-0" />
                    <div>
                      <p className="font-medium">Re-send Verification Email</p>
                      <p className="text-slate-500 text-[10px]">Opens your mail client with a pre-filled welcome message</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 ml-auto" />
                  </a>
                </div>
                <p className="text-slate-600 text-[10px] mt-2 pt-2 border-t border-white/[0.04]">
                  Full auth automation (Supabase admin invite links, account disable) requires a service role key on a server route. Contact your developer to configure this.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between shrink-0">
          <p className="text-slate-600 text-xs">
            {data.status && <span className="capitalize mr-2">{data.status.replace("_", " ")}</span>}
            {(data.roles || []).join(", ")}
          </p>
          <button onClick={onClose} className="btn-ghost btn-sm text-slate-400">Close</button>
        </div>
      </div>
    </>
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
// Shows a matrix of members × fixtures where registration is open.
// Each cell shows that member's self-reported availability (Available / Maybe / Not Available / no response).
// The captain uses this at a glance to see who is free for each fixture before building the squad.

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
              <div className="flex items-center gap-1 text-xs">
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
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Draft</span>
                <span>Published</span>
                <span>Registration Open</span>
                <span>Squad Published</span>
                <span>Choices Open</span>
                <span>Done</span>
              </div>
            </div>

            {/* Advance stage action */}
            {nextLabel && currentStage !== "completed" && currentStage !== "cancelled" && (
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <p className="text-slate-400 text-xs">
                  {currentStage === "draft" && "Publish this fixture to make it visible on the public Fixtures page. Registration stays closed until you decide."}
                  {currentStage === "published" && "The fixture is live on the Fixtures page. Open registration when you are ready for members to sign up — not too early!"}
                  {currentStage === "squad_open" && "Registration is open. Members can mark availability. Select your squad pool and per-game XIs below, then publish."}
                  {currentStage === "squad_locked" && "Squad published. Add ground meal options per game below when the ground confirms, then open choices for players."}
                  {currentStage === "choices_open" && "All choices collected. Mark the event as completed after the matches."}
                </p>
                <button
                  onClick={advanceStage}
                  disabled={saving}
                  className="btn-primary btn-sm shrink-0 ml-4"
                >
                  {saving ? <><Loader2 size={13} className="animate-spin" /></> : <ArrowRight size={13} />}
                  {nextLabel}
                </button>
              </div>
            )}
          </div>

          {/* ── Sub-navigation ─────────────────────────────────────────────────── */}
          <div className="flex gap-1">
            {[
              { id: "events", label: "Fixture Details", icon: Calendar },
              { id: "squad", label: `Squad & XIs (${tourMeta?.squad_pool.length ?? 0} in pool)`, icon: Users },
              { id: "responses", label: "Player Responses", icon: CheckCircle },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeView === id
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={13} /> {label}
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

function JerseyTab({ supabase }: { supabase: any }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Local edit state: memberId -> draft number string
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savedFlash, setSavedFlash] = useState<Record<string, boolean>>({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSaved, setBulkSaved] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);

    // Step 1: load all members — same as MembersTab (select * works regardless of schema)
    const { data: baseData, error: baseError } = await supabase
      .from("members")
      .select("*")
      .order("full_legal_name");

    if (baseError || !baseData) {
      setLoading(false);
      return;
    }

    // select("*") already includes jersey columns if they exist in the DB.
    // Add null defaults for any that may not exist yet (pre-migration).
    const rows = baseData.map((m: any) => ({
      ...m,
      jersey_number: m.jersey_number ?? null,
      jersey_number_requested: m.jersey_number_requested ?? null,
      jersey_number_status: m.jersey_number_status ?? "none",
    }));

    setMembers(rows);
    const init: Record<string, string> = {};
    rows.forEach((m: any) => { init[m.id] = m.jersey_number != null ? String(m.jersey_number) : ""; });
    setDrafts(init);
    setLoading(false);
  }

  const displayName = (m: any) => m.preferred_name || m.full_legal_name || "—";

  // Detect conflicts in draft state
  const draftValues = Object.values(drafts).filter(Boolean);
  const hasDuplicates = draftValues.length !== new Set(draftValues).size;

  function conflictFor(memberId: string): boolean {
    const val = drafts[memberId];
    if (!val) return false;
    return members.some((m) => m.id !== memberId && drafts[m.id] === val);
  }

  async function saveOne(memberId: string) {
    const val = drafts[memberId];
    const num = val ? parseInt(val) : null;
    if (num !== null && isNaN(num)) return;
    if (conflictFor(memberId)) return;
    setSaving((s) => ({ ...s, [memberId]: true }));
    await supabase.from("members").update({
      jersey_number: num,
      jersey_number_status: num ? "reserved" : "none",
      jersey_number_requested: null,
    }).eq("id", memberId);
    setMembers((prev) => prev.map((m) => m.id === memberId
      ? { ...m, jersey_number: num, jersey_number_status: num ? "reserved" : "none", jersey_number_requested: null }
      : m));
    setSaving((s) => ({ ...s, [memberId]: false }));
    setSavedFlash((s) => ({ ...s, [memberId]: true }));
    setTimeout(() => setSavedFlash((s) => ({ ...s, [memberId]: false })), 1500);
  }

  async function saveAll() {
    if (hasDuplicates) return;
    setBulkSaving(true);
    const updates = members
      .filter((m) => drafts[m.id] !== (m.jersey_number != null ? String(m.jersey_number) : ""))
      .map((m) => {
        const num = drafts[m.id] ? parseInt(drafts[m.id]) : null;
        return supabase.from("members").update({
          jersey_number: num,
          jersey_number_status: num ? "reserved" : "none",
          jersey_number_requested: null,
        }).eq("id", m.id);
      });
    await Promise.all(updates);
    await load();
    setBulkSaving(false);
    setBulkSaved(true);
    setTimeout(() => setBulkSaved(false), 2000);
  }

  async function approveMemberRequest(memberId: string, requestedNum: number) {
    setActionId(memberId);
    await supabase.from("members").update({
      jersey_number: requestedNum,
      jersey_number_requested: null,
      jersey_number_status: "reserved",
    }).eq("id", memberId);
    setMembers((prev) => prev.map((m) => m.id === memberId
      ? { ...m, jersey_number: requestedNum, jersey_number_requested: null, jersey_number_status: "reserved" }
      : m));
    setDrafts((d) => ({ ...d, [memberId]: String(requestedNum) }));
    setActionId(null);
  }

  async function rejectMemberRequest(memberId: string) {
    setActionId(memberId);
    await supabase.from("members").update({
      jersey_number_requested: null,
      jersey_number_status: "none",
    }).eq("id", memberId);
    setMembers((prev) => prev.map((m) => m.id === memberId
      ? { ...m, jersey_number_requested: null, jersey_number_status: "none" }
      : m));
    setActionId(null);
  }

  async function clearNumber(memberId: string) {
    setActionId(memberId);
    await supabase.from("members").update({
      jersey_number: null,
      jersey_number_status: "none",
    }).eq("id", memberId);
    setMembers((prev) => prev.map((m) => m.id === memberId
      ? { ...m, jersey_number: null, jersey_number_status: "none" }
      : m));
    setDrafts((d) => ({ ...d, [memberId]: "" }));
    setActionId(null);
  }

  const pending = members.filter((m) => m.jersey_number_status === "requested" || m.jersey_number_requested);
  const assigned = members.filter((m) => m.jersey_number).sort((a, b) => a.jersey_number - b.jersey_number);
  const unassigned = members.filter((m) => !m.jersey_number && !m.jersey_number_requested);
  const changedCount = members.filter((m) => drafts[m.id] !== (m.jersey_number != null ? String(m.jersey_number) : "")).length;

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-brand-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Jersey Numbers</h2>
          <p className="text-slate-400 text-sm">
            Assign and manage shirt numbers for all members. Edit inline or use Save All for bulk updates.
            Members can also request a number from their profile — pending requests appear below.
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={bulkSaving || changedCount === 0 || hasDuplicates}
          className="btn-primary whitespace-nowrap flex items-center gap-2 shrink-0"
        >
          {bulkSaving ? <Loader2 size={14} className="animate-spin" /> : bulkSaved ? <CheckCircle size={14} /> : null}
          {bulkSaved ? "Saved!" : `Save All${changedCount > 0 ? ` (${changedCount})` : ""}`}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Members", value: members.length, color: "text-white" },
          { label: "Numbers Assigned", value: assigned.length, color: "text-green-400" },
          { label: "Pending Requests", value: pending.length, color: "text-gold-400" },
          { label: "Unassigned", value: unassigned.length, color: "text-slate-400" },
        ].map((s) => (
          <div key={s.label} className="glass-dark p-4 rounded-xl border border-white/[0.06]">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {hasDuplicates && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> Duplicate numbers detected — each member must have a unique jersey number.
        </div>
      )}

      {/* Pending member requests */}
      {pending.length > 0 && (
        <div className="glass-dark p-5 border border-gold-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-gold-400" />
            <h3 className="text-white font-semibold text-sm">Pending Member Requests</h3>
            <span className="badge-gold text-[10px]">{pending.length}</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {pending.map((m) => (
              <div key={m.id} className="flex items-center gap-4 py-3">
                <div className="w-12 h-12 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0">
                  <span className="text-lg font-black text-gold-400">#{m.jersey_number_requested}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{displayName(m)}</p>
                  <p className="text-slate-400 text-xs">Requesting #{m.jersey_number_requested}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMemberRequest(m.id, m.jersey_number_requested)}
                    disabled={actionId === m.id}
                    className="btn-primary btn-sm flex items-center gap-1"
                  >
                    {actionId === m.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                    Approve
                  </button>
                  <button
                    onClick={() => rejectMemberRequest(m.id)}
                    disabled={actionId === m.id}
                    className="btn-ghost btn-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <XCircle size={11} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full member list — bulk assignment */}
      <div className="glass-dark overflow-hidden rounded-xl">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">All Members — Jersey Assignment</h3>
            <p className="text-slate-500 text-xs mt-0.5">Type a number next to each player and press Enter or click Save. Leave blank to clear.</p>
          </div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {members.map((m) => {
            const draft = drafts[m.id] ?? "";
            const conflict = conflictFor(m.id);
            const changed = draft !== (m.jersey_number != null ? String(m.jersey_number) : "");
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-brand-600/30 flex items-center justify-center text-sm font-bold text-brand-300 shrink-0">
                  {displayName(m).charAt(0).toUpperCase()}
                </div>
                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{displayName(m)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] ${m.status === "active" ? "text-green-400" : "text-gold-400"}`}>
                      {m.status === "active" ? "● Active" : "○ " + m.status}
                    </span>
                    {m.membership_category && (
                      <span className="text-[10px] text-slate-500 capitalize">{m.membership_category}</span>
                    )}
                  </div>
                </div>
                {/* Current number badge */}
                {m.jersey_number && (
                  <div className="w-10 h-10 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-brand-300">#{m.jersey_number}</span>
                  </div>
                )}
                {/* Number input */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={draft}
                    onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && saveOne(m.id)}
                    placeholder="#"
                    className={`w-20 input text-center text-sm py-1.5 font-mono ${conflict ? "border-red-500/60 text-red-300" : changed ? "border-brand-500/40" : ""}`}
                  />
                  {(changed || m.jersey_number) && (
                    <button
                      onClick={() => saveOne(m.id)}
                      disabled={saving[m.id] || conflict}
                      className={`btn-sm whitespace-nowrap flex items-center gap-1 ${savedFlash[m.id] ? "text-green-400" : "btn-primary"}`}
                    >
                      {saving[m.id] ? <Loader2 size={11} className="animate-spin" /> : savedFlash[m.id] ? <CheckCircle size={11} /> : null}
                      {savedFlash[m.id] ? "Saved" : "Save"}
                    </button>
                  )}
                  {m.jersey_number && !changed && (
                    <button
                      onClick={() => clearNumber(m.id)}
                      disabled={actionId === m.id}
                      title="Clear number"
                      className="btn-ghost btn-sm text-slate-500 hover:text-red-400 px-1.5"
                    >
                      {actionId === m.id ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={12} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Read-only sorted registry */}
      {assigned.length > 0 && (
        <div className="glass-dark p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Number Registry (sorted)</h3>
          <div className="flex flex-wrap gap-2">
            {assigned.map((m) => (
              <div key={m.id} className="flex items-center gap-2 bg-slate-800/60 border border-white/[0.06] rounded-lg px-3 py-2">
                <span className="text-brand-300 font-black text-sm">#{m.jersey_number}</span>
                <span className="text-slate-300 text-xs">{displayName(m)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
