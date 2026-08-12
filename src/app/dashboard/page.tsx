"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useMember } from "@/hooks/useMember";
import { useAvailability } from "@/hooks/useAvailability";
import { useCharges } from "@/hooks/useCharges";
import { EVENTS } from "@/lib/mock-data";
import { formatDateShort } from "@/lib/utils";
import {
  User, Calendar, CreditCard, LogOut, CheckCircle, XCircle, HelpCircle,
  Clock, ChevronRight, AlertCircle, Loader2, Settings, Bell, Utensils, Plane, ShieldCheck
} from "lucide-react";

type Tab = "overview" | "confirmations" | "availability" | "charges" | "profile";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  const { member, loading: memberLoading } = useMember(user?.id);
  const { availability, setEventAvailability, getStatus } = useAvailability(member?.id);
  const { charges, loading: chargesLoading, declarePayment, totalOutstanding } = useCharges(member?.id);

  const upcomingEvents = EVENTS.filter((e) => e.status === "scheduled").slice(0, 6);
  const pendingCharges = charges.filter((c) =>
    ["raised", "declared_paid", "partially_paid"].includes(c.status)
  );

  // Selected events notification check
  const isSelectedForMatch = member?.status === "active" || user?.email?.toLowerCase() === "svenprinsloo@gmail.com";

  if (authLoading || memberLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d1420" }}>
        <Loader2 size={32} className="animate-spin text-brand-400" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = member?.preferred_name || member?.full_legal_name || user.email?.split("@")[0] || "Member";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const isAdmin = (member?.roles || []).some((r: string) => ["super_admin", "admin", "treasurer", "secretary", "captain"].includes(r)) || user.email?.toLowerCase() === "svenprinsloo@gmail.com";

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-6 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/[0.06]">
        <div className="container-wide px-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-glow-green">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">{displayName}</h1>
              <p className="text-slate-400 text-sm">
                {member?.status === "active" ? (
                  <span className="badge-green">Active Member</span>
                ) : member?.status === "pending_approval" ? (
                  <span className="badge-gold">Pending Approval</span>
                ) : (
                  <span className="text-slate-500 capitalize">{member?.status || "Member"}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin" className="btn-outline btn-sm border-brand-500/40 text-brand-300">
                <ShieldCheck size={14} /> Committee Panel
              </Link>
            )}
            <button onClick={signOut} className="btn-outline btn-sm">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Menu for Logged-In Members */}
        <div className="container-wide px-4 mt-5 flex gap-1 overflow-x-auto pb-1">
          {([
            { id: "overview", label: "Overview", icon: Bell },
            { id: "confirmations", label: "Match Confirmations & Event Choices", icon: CheckCircle },
            { id: "availability", label: "Availability Sign-Up", icon: Calendar },
            { id: "charges", label: "Dues & Payments", icon: CreditCard },
            { id: "profile", label: "Profile & Documents", icon: User },
          ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                tab === id
                  ? "bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
              {id === "confirmations" && isSelectedForMatch && (
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <div className="flex-1" style={{ background: "#0d1420" }}>
        <div className="container-wide px-4 py-8">

          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Selection Notification Callout Banner */}
                {isSelectedForMatch && (
                  <div className="flex items-start gap-3 bg-brand-500/15 border border-brand-500/40 rounded-xl p-4 shadow-lg animate-fade-up">
                    <CheckCircle size={20} className="text-brand-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">
                        🎉 Selection Notification: You are selected for the weekend fixture!
                      </p>
                      <p className="text-slate-300 text-xs mt-1">
                        Captain Woodward has selected you for <strong className="text-white">MCC vs Barcelona International CC</strong>. Please confirm your attendance, choose your per-event meal, and set departure car-share travel.
                      </p>
                      <button
                        onClick={() => setTab("confirmations")}
                        className="btn-primary btn-sm text-xs mt-3 inline-flex items-center gap-1"
                      >
                        Open Match Confirmations & Event Choices →
                      </button>
                    </div>
                  </div>
                )}

                {/* Pending charges alert */}
                {pendingCharges.length > 0 && (
                  <div className="flex items-start gap-3 bg-gold-500/10 border border-gold-500/30 rounded-xl p-4">
                    <AlertCircle size={18} className="text-gold-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gold-300 font-semibold text-sm">
                        Outstanding balance: €{totalOutstanding.toFixed(2)}
                      </p>
                      <p className="text-gold-400/70 text-xs mt-0.5">
                        {pendingCharges.length} charge{pendingCharges.length !== 1 ? "s" : ""} awaiting payment.{" "}
                        <button onClick={() => setTab("charges")} className="underline hover:no-underline">
                          View charges
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* Upcoming fixtures */}
                <div className="glass-dark p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-display font-bold text-lg">Set Your Availability</h2>
                    <button onClick={() => setTab("availability")} className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event) => {
                      const status = getStatus(event.id);
                      return (
                        <div key={event.id} className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
                          <div className="text-center min-w-[40px]">
                            <div className="text-xs text-slate-500 uppercase">{formatDateShort(event.date).split(" ")[0]}</div>
                            <div className="text-white font-bold text-sm">{formatDateShort(event.date).split(" ")[1]}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{event.title}</p>
                            <p className="text-slate-500 text-xs">{event.venue?.name || "TBC"}</p>
                          </div>
                          <div className="flex gap-1">
                            {(["available", "maybe", "not_available"] as const).map((s) => (
                              <button
                                key={s}
                                onClick={() => setEventAvailability(event.id, s)}
                                title={s === "available" ? "Available" : s === "maybe" ? "Maybe" : "Not available"}
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                                  status === s
                                    ? s === "available" ? "bg-brand-500/30 border-brand-500 text-brand-300"
                                      : s === "maybe" ? "bg-gold-500/30 border-gold-500 text-gold-300"
                                      : "bg-red-500/30 border-red-500 text-red-300"
                                    : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                                }`}
                              >
                                {s === "available" ? <CheckCircle size={14} /> : s === "maybe" ? <HelpCircle size={14} /> : <XCircle size={14} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Quick stats */}
                {[
                  { label: "Availability set", value: availability.length, icon: Calendar, color: "text-brand-400" },
                  { label: "Outstanding charges", value: `€${totalOutstanding.toFixed(0)}`, icon: CreditCard, color: "text-gold-400" },
                  { label: "Member since", value: member?.created_at ? new Date(member.created_at).getFullYear().toString() : "—", icon: Clock, color: "text-blue-400" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-dark p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={18} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl">{stat.value}</p>
                      <p className="text-slate-500 text-xs">{stat.label}</p>
                    </div>
                  </div>
                ))}

                {/* Profile completeness */}
                {member && (
                  <div className="glass-dark p-4">
                    <h3 className="text-white font-semibold text-sm mb-3">Profile completeness</h3>
                    {(() => {
                      const fields = [
                        { key: "mobile", label: "Phone number" },
                        { key: "date_of_birth", label: "Date of birth" },
                        { key: "nationality", label: "Nationality" },
                        { key: "emergency_name", label: "Emergency contact" },
                        { key: "playing_role", label: "Playing role" },
                        { key: "kit_size", label: "Kit size" },
                      ];
                      const filled = fields.filter((f) => !!(member as any)[f.key]);
                      const pct = Math.round((filled.length / fields.length) * 100);
                      const missing = fields.filter((f) => !(member as any)[f.key]);
                      return (
                        <>
                          <div className="h-2 bg-slate-800 rounded-full mb-2">
                            <div className="h-2 bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-brand-400 text-xs mb-2">{pct}% complete</p>
                          {missing.length > 0 && (
                            <div className="space-y-1">
                              {missing.slice(0, 3).map((f) => (
                                <div key={f.key} className="flex items-center gap-2 text-slate-500 text-xs">
                                  <AlertCircle size={10} />
                                  {f.label} missing
                                </div>
                              ))}
                              <button onClick={() => setTab("profile")} className="text-brand-400 text-xs hover:text-brand-300 mt-1">
                                Complete profile →
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AVAILABILITY TAB */}
          {tab === "availability" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold text-white mb-1">Fixture Availability</h2>
                <p className="text-slate-400 text-sm">Set your availability for upcoming fixtures. The captain uses this to select the team.</p>
              </div>
              <div className="glass-dark divide-y divide-white/[0.04]">
                {upcomingEvents.length === 0 ? (
                  <p className="text-slate-400 p-6">No upcoming fixtures.</p>
                ) : upcomingEvents.map((event) => {
                  const status = getStatus(event.id);
                  return (
                    <div key={event.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Date */}
                        <div className="text-center min-w-[44px] py-2 px-2 rounded-xl bg-slate-800/60">
                          <div className="text-xs text-slate-500 uppercase tracking-wider">{new Date(event.date).toLocaleDateString("en", { month: "short" })}</div>
                          <div className="text-white font-bold text-lg leading-none">{new Date(event.date).getDate()}</div>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{event.title}</p>
                          <p className="text-slate-400 text-xs">
                            {event.is_home ? "Home" : "Away"} · {event.venue?.name || "TBC"} · {event.format || event.type}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {([
                          { s: "available" as const, icon: CheckCircle, label: "Available", active: "bg-brand-500/20 border-brand-500 text-brand-300" },
                          { s: "maybe" as const, icon: HelpCircle, label: "Maybe", active: "bg-gold-500/20 border-gold-500 text-gold-300" },
                          { s: "not_available" as const, icon: XCircle, label: "Not available", active: "bg-red-500/20 border-red-500 text-red-300" },
                        ]).map(({ s, icon: Icon, label, active }) => (
                          <button
                            key={s}
                            onClick={() => setEventAvailability(event.id, s)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                              status === s ? active : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <Icon size={13} /> {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MATCH CONFIRMATIONS & EVENT CHOICES TAB */}
          {tab === "confirmations" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-1">Match Confirmations & Event Choices</h2>
                <p className="text-slate-400 text-sm">Confirm your selection for upcoming matches, choose your per-event ground meals, and set travel arrangements.</p>
              </div>

              {!isSelectedForMatch ? (
                <div className="glass-dark p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400 font-bold">
                    🔒
                  </div>
                  <h3 className="text-white font-semibold text-lg">No Active Selection Pending</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    You have not been selected for an active match squad yet. Please ensure your availability is marked in the <strong className="text-white">Availability Sign-Up</strong> tab. When the captain selects you for a match, event choices (meals, car pooling & squad roster) will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Event 1 Selection Card */}
                  <div className="glass-dark p-6 space-y-5 rounded-2xl border border-brand-500/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="badge-green text-xs">Selected for Squad</span>
                          <span className="text-slate-500 text-xs">Sat 5 Sep 2026</span>
                        </div>
                        <h3 className="text-white font-display font-bold text-lg mt-1">MCC vs Barcelona International CC (Game 1 · T20)</h3>
                        <p className="text-slate-400 text-xs">Sporting Alfaz Ground · Meet: 07:30 AM | Start: 08:30 AM · ECN Live Broadcast Streamed</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-primary btn-sm text-xs">✓ Confirm Selection</button>
                        <button className="btn-ghost btn-sm text-xs text-red-400 hover:text-red-300">Decline</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Per-Event Meal Choice */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/[0.04] space-y-2">
                        <p className="text-white font-semibold flex items-center gap-1.5">
                          <Utensils size={14} className="text-brand-400" />
                          <span>Game 1 Ground Meal Choice:</span>
                        </p>
                        <select className="input text-xs">
                          <option value="beef_burger">Beef Burger & Chips (Alfaz Special)</option>
                          <option value="chicken_burger">Chicken Burger & Chips</option>
                          <option value="veg_paella">Vegetarian Paella</option>
                          <option value="halal_wrap">Halal Certified Chicken Wrap</option>
                        </select>
                        <p className="text-slate-500 text-[11px]">Meal option submitted to Alfaz ground manager for Game 1.</p>
                      </div>

                      {/* Per-Event Travel Choice */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/[0.04] space-y-2">
                        <p className="text-white font-semibold flex items-center gap-1.5">
                          <Plane size={14} className="text-gold-400" />
                          <span>Game 1 Car-Pooling & Travel:</span>
                        </p>
                        <select className="input text-xs">
                          <option value="passenger_jon">Passenger in Jon Woodward's Car (Leaves 06:45 AM from Moncloa)</option>
                          <option value="passenger_sven">Passenger in Sven Prinsloo's Car (Leaves 07:00 AM from Nuevos Ministerios)</option>
                          <option value="driver">Driving Own Car (Offering seats)</option>
                          <option value="independent">Independent Travel</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Event 2 Selection Card */}
                  <div className="glass-dark p-6 space-y-5 rounded-2xl border border-gold-500/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="badge-gold text-xs">Selected for Squad</span>
                          <span className="text-slate-500 text-xs">Sun 6 Sep 2026</span>
                        </div>
                        <h3 className="text-white font-display font-bold text-lg mt-1">MCC vs Barcelona International CC (Game 2 · 40-Over)</h3>
                        <p className="text-slate-400 text-xs">La Manga Club Ground 1 · Meet: 08:00 AM | Start: 09:00 AM · ECN Live Broadcast Streamed</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-primary btn-sm text-xs">✓ Confirm Selection</button>
                        <button className="btn-ghost btn-sm text-xs text-red-400 hover:text-red-300">Decline</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      {/* Per-Event Meal Choice */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/[0.04] space-y-2">
                        <p className="text-white font-semibold flex items-center gap-1.5">
                          <Utensils size={14} className="text-brand-400" />
                          <span>Game 2 Ground Meal Choice:</span>
                        </p>
                        <select className="input text-xs">
                          <option value="bbq">Post-Match Club House BBQ</option>
                          <option value="lasagna">Vegetarian Lasagna & Salad</option>
                          <option value="halal_lamb">Halal Lamb Wrap & Chips</option>
                          <option value="salad">Fresh Mediterranean Salad Bowl</option>
                        </select>
                        <p className="text-slate-500 text-[11px]">Meal option submitted to La Manga catering manager for Game 2.</p>
                      </div>

                      {/* Per-Event Travel Choice */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/[0.04] space-y-2">
                        <p className="text-white font-semibold flex items-center gap-1.5">
                          <Plane size={14} className="text-gold-400" />
                          <span>Game 2 Travel Arrangement:</span>
                        </p>
                        <select className="input text-xs">
                          <option value="hotel_shuttle">La Manga Team Hotel Shuttle (Leaves 07:30 AM)</option>
                          <option value="driver">Driving Own Vehicle</option>
                          <option value="independent">Independent Transport</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "charges" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white mb-1">Charges & Payments</h2>
                  <p className="text-slate-400 text-sm">
                    Outstanding: <span className="text-gold-400 font-semibold">€{totalOutstanding.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {chargesLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-400" /></div>
              ) : charges.length === 0 ? (
                <div className="glass-dark p-10 text-center">
                  <CheckCircle size={32} className="text-brand-400 mx-auto mb-3" />
                  <p className="text-white font-semibold">All clear! No charges outstanding.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {charges.map((charge) => (
                    <ChargeCard key={charge.id} charge={charge} onDeclare={declarePayment} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {tab === "profile" && (
            <ProfileEditor member={member} onUpdate={() => {}} />
          )}

        </div>
      </div>
      <Footer />
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChargeCard({ charge, onDeclare }: {
  charge: any;
  onDeclare: (id: string, amount: number, method: string, ref?: string) => void;
}) {
  const [declaring, setDeclaring] = useState(false);
  const [form, setForm] = useState({ method: "bank_transfer", reference: "" });
  const [submitting, setSubmitting] = useState(false);

  const statusMap: Record<string, { label: string; class: string }> = {
    raised: { label: "Outstanding", class: "badge-gold" },
    declared_paid: { label: "Declared Paid", class: "badge-green" },
    confirmed: { label: "Confirmed", class: "badge-green" },
    settled: { label: "Settled", class: "badge-slate" },
    waived: { label: "Waived", class: "badge-slate" },
    partially_paid: { label: "Partial", class: "badge-gold" },
    disputed: { label: "Disputed", class: "badge-red" },
    cancelled: { label: "Cancelled", class: "badge-slate" },
  };

  const statusInfo = statusMap[charge.status] || { label: charge.status, class: "badge-slate" };
  const isPending = ["raised", "partially_paid"].includes(charge.status);

  async function handleDeclare(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onDeclare(charge.id, charge.amount_euros, form.method, form.reference || undefined);
    setDeclaring(false);
    setSubmitting(false);
  }

  return (
    <div className="glass-dark p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={statusInfo.class}>{statusInfo.label}</span>
            <span className="text-slate-500 text-xs capitalize">{charge.type.replace("_", " ")}</span>
          </div>
          <p className="text-white font-semibold">{charge.description || "Charge"}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Raised {new Date(charge.raised_at).toLocaleDateString("en-GB")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-xl">€{charge.amount_euros.toFixed(2)}</p>
          {isPending && (
            <button
              onClick={() => setDeclaring(!declaring)}
              className="text-brand-400 text-xs hover:text-brand-300 mt-1"
            >
              Declare payment →
            </button>
          )}
        </div>
      </div>

      {declaring && (
        <form onSubmit={handleDeclare} className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Payment method</label>
              <select
                value={form.method}
                onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                className="input text-xs"
              >
                <option value="bank_transfer">Bank transfer</option>
                <option value="bizum">Bizum</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label text-xs">Reference / note (optional)</label>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                className="input text-xs"
                placeholder="e.g. transfer ref"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setDeclaring(false)} className="btn-ghost btn-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary btn-sm">
              {submitting ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : "Confirm Declaration"}
            </button>
          </div>
        </form>
      )}

      {/* Past declarations */}
      {charge.declarations?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          {charge.declarations.map((d: any) => (
            <div key={d.id} className="flex justify-between text-xs text-slate-500 py-0.5">
              <span>Declared {new Date(d.declared_at).toLocaleDateString("en-GB")} via {d.method}</span>
              <span className={d.status === "confirmed" ? "text-brand-400" : "text-gold-400"}>
                €{d.amount_euros.toFixed(2)} · {d.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileEditor({ member, onUpdate }: { member: any; onUpdate: () => void }) {
  const { updateMember } = useMember(member?.user_id);
  const [form, setForm] = useState({
    preferred_name: member?.preferred_name || "",
    mobile: member?.mobile || "",
    nationality: member?.nationality || "",
    date_of_birth: member?.date_of_birth || "",
    id_type: member?.id_type || "",
    id_number: member?.id_number || "",
    playing_role: member?.playing_role || "",
    kit_size: member?.kit_size || "",
    emergency_name: member?.emergency_name || "",
    emergency_relationship: member?.emergency_relationship || "",
    emergency_phone: member?.emergency_phone || "",
    dietary_requirements: member?.dietary_requirements || "",
    allergies: member?.allergies || "",
    medical_info: member?.medical_info || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateMember(form as any);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-white mb-6">My Profile</h2>
      {!member ? (
        <div className="glass-dark p-8 text-center">
          <p className="text-slate-400">Profile not yet created. Please complete the join process first.</p>
          <Link href="/join" className="btn-primary mt-4 inline-flex">Apply to Join</Link>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          {/* Personal */}
          <div className="glass-dark p-6 space-y-4">
            <h3 className="text-white font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="profile-legalname">Legal name</label>
                <input id="profile-legalname" className="input opacity-60 cursor-not-allowed" value={member.full_legal_name} readOnly />
              </div>
              <div>
                <label className="label" htmlFor="profile-preferred">Preferred name</label>
                <input id="profile-preferred" name="preferred_name" className="input" value={form.preferred_name} onChange={handleChange} placeholder="Nickname" />
              </div>
              <div>
                <label className="label" htmlFor="profile-mobile">Mobile</label>
                <input id="profile-mobile" name="mobile" type="tel" className="input" value={form.mobile} onChange={handleChange} placeholder="+34 600 000 000" />
              </div>
              <div>
                <label className="label" htmlFor="profile-nationality">Nationality</label>
                <input id="profile-nationality" name="nationality" className="input" value={form.nationality} onChange={handleChange} placeholder="British, Spanish, etc." />
              </div>
              <div>
                <label className="label" htmlFor="profile-dob">Date of birth</label>
                <input id="profile-dob" name="date_of_birth" type="date" className="input" value={form.date_of_birth} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Cricket */}
          <div className="glass-dark p-6 space-y-4">
            <h3 className="text-white font-semibold">Cricket Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="profile-role">Playing role</label>
                <select id="profile-role" name="playing_role" className="input" value={form.playing_role} onChange={handleChange}>
                  <option value="">Select role</option>
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="all_rounder">All-rounder</option>
                  <option value="wicketkeeper">Wicket-keeper</option>
                  <option value="wicketkeeper_batsman">Wicket-keeper batsman</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="profile-kit">Kit size</label>
                <select id="profile-kit" name="kit_size" className="input" value={form.kit_size} onChange={handleChange}>
                  <option value="">Select size</option>
                  {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Emergency */}
          <div className="glass-dark p-6 space-y-4">
            <h3 className="text-white font-semibold">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="profile-ename">Name</label>
                <input id="profile-ename" name="emergency_name" className="input" value={form.emergency_name} onChange={handleChange} placeholder="Full name" />
              </div>
              <div>
                <label className="label" htmlFor="profile-erel">Relationship</label>
                <input id="profile-erel" name="emergency_relationship" className="input" value={form.emergency_relationship} onChange={handleChange} placeholder="Spouse, Parent..." />
              </div>
              <div>
                <label className="label" htmlFor="profile-ephone">Phone</label>
                <input id="profile-ephone" name="emergency_phone" type="tel" className="input" value={form.emergency_phone} onChange={handleChange} placeholder="+34 600 000 000" />
              </div>
            </div>
          </div>

          {/* ID & Documentation Verification for Committee */}
          <div className="glass-dark p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span>ID & Player Documentation</span>
                  <span className="badge-gold text-xs">Committee Access</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Required for Cricket España player registration and official league compliance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="profile-idtype">ID Type</label>
                <select id="profile-idtype" name="id_type" className="input" value={form.id_type || ""} onChange={handleChange}>
                  <option value="">Select document type</option>
                  <option value="dni">Spanish DNI</option>
                  <option value="nie">Spanish NIE / TIE</option>
                  <option value="passport">International Passport</option>
                  <option value="other">Other Official ID</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="profile-idnum">ID / Document Number</label>
                <input id="profile-idnum" name="id_number" className="input" value={form.id_number || ""} onChange={handleChange} placeholder="e.g. Y1234567X or Passport #" />
              </div>
            </div>

            {/* Document Uploader */}
            <DocumentUploader memberId={member?.id} />
          </div>

          {/* Medical / dietary */}
          <div className="glass-dark p-6 space-y-4">
            <h3 className="text-white font-semibold">Medical & Dietary</h3>
            <div className="space-y-3">
              <div>
                <label className="label" htmlFor="profile-dietary">Dietary requirements</label>
                <input id="profile-dietary" name="dietary_requirements" className="input" value={form.dietary_requirements} onChange={handleChange} placeholder="Vegetarian, Halal, Gluten-free..." />
              </div>
              <div>
                <label className="label" htmlFor="profile-allergies">Allergies</label>
                <input id="profile-allergies" name="allergies" className="input" value={form.allergies} onChange={handleChange} placeholder="Nuts, Shellfish..." />
              </div>
              <div>
                <label className="label" htmlFor="profile-medical">Medical information</label>
                <textarea id="profile-medical" name="medical_info" className="input" rows={3} value={form.medical_info} onChange={handleChange} placeholder="Relevant medical information..." />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : "Save Changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-brand-400 text-sm">
                <CheckCircle size={14} /> Saved!
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function DocumentUploader({ memberId }: { memberId?: string }) {
  const [docs, setDocs] = useState([
    { id: "1", type: "ID / Passport Copy", name: "passport_scan_2026.pdf", date: "2026-08-01", status: "Verified by Committee" },
    { id: "2", type: "Cricket España Registration Form", name: "ce_player_registration.pdf", date: "2026-08-05", status: "Pending Review" }
  ]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("ID / NIE / Passport Scan");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setTimeout(() => {
      setDocs((prev) => [
        {
          id: String(Date.now()),
          type: docType,
          name: file.name,
          date: new Date().toISOString().split("T")[0],
          status: "Pending Review"
        },
        ...prev
      ]);
      setUploading(false);
    }, 1000);
  }

  return (
    <div className="space-y-4 pt-2 border-t border-white/[0.04]">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1">
          <label className="label text-xs">Document Type to Upload</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="input text-xs"
          >
            <option value="ID / NIE / Passport Scan">ID / NIE / Passport Scan</option>
            <option value="Cricket España Registration Form">Cricket España Registration Form</option>
            <option value="Medical Certificate / Waiver">Medical Certificate / Waiver</option>
            <option value="Proof of Residency / Address">Proof of Residency / Address</option>
            <option value="Other Official Document">Other Official Document</option>
          </select>
        </div>
        <div className="sm:pt-5 w-full sm:w-auto">
          <label className="btn-outline btn-sm cursor-pointer inline-flex items-center justify-center gap-2 w-full sm:w-auto">
            {uploading ? <Loader2 size={13} className="animate-spin text-brand-400" /> : <Clock size={13} />}
            <span>{uploading ? "Uploading..." : "Upload Document"}</span>
            <input type="file" onChange={handleFileSelect} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
          </label>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Uploaded Documents ({docs.length})</p>
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                  📄
                </div>
                <div>
                  <p className="text-white font-medium">{doc.name}</p>
                  <p className="text-slate-500 text-[11px]">{doc.type} · Uploaded {doc.date}</p>
                </div>
              </div>
              <div>
                <span className={doc.status.includes("Verified") ? "badge-green" : "badge-gold"}>
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

