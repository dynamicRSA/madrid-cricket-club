import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { EVENTS } from "@/lib/mock-data";
import { formatDateShort } from "@/lib/utils";
import { CalendarDays, CreditCard, User, Shield, CheckCircle, Clock, AlertCircle, ChevronRight, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Dashboard",
  description: "Madrid Cricket Club member dashboard — availability, statement, membership.",
};

// Mock logged-in member data
const MOCK_MEMBER = {
  name: "Tom Harris",
  email: "tom.harris@example.com",
  membership_status: "active",
  membership_category: "Senior Full Year",
  member_since: "2022-09-01",
  registration_status: "submitted",
  balance_owing: 35.0,
};

const MOCK_AVAILABILITY = [
  { event_id: "e1", status: "available", event_title: "MCC vs Valencia CC", date: "2026-08-23" },
  { event_id: "e2", status: "no_response", event_title: "MCC vs Alicante CC", date: "2026-09-06" },
  { event_id: "e3", status: "not_available", event_title: "MCC vs Cataluña CC", date: "2026-09-20" },
];

const MOCK_CHARGES = [
  { id: "c1", event: "MCC vs Madrid CC", type: "Match fee", amount: 15, status: "confirmed" },
  { id: "c2", event: "MCC vs Madrid CC", type: "Tea/meal", amount: 10, status: "declared_paid" },
  { id: "c3", event: "MCC vs Valencia CC (Jun)", type: "Match fee", amount: 15, status: "raised" },
  { id: "c4", event: "MCC vs Valencia CC (Jun)", type: "Accommodation", amount: 70, status: "raised" },
];

const availClass = (s: string) => ({
  available: "avail-yes border",
  not_available: "avail-no border",
  maybe: "avail-maybe border",
  no_response: "avail-none border",
}[s] || "avail-none border");

const availLabel = (s: string) => ({
  available: "✓ Available",
  not_available: "✗ Not available",
  maybe: "? Maybe",
  no_response: "— No response",
}[s] || "—");

const chargeStatusLabel = (s: string) => ({
  raised: { label: "Outstanding", cls: "badge-red" },
  declared_paid: { label: "Declared paid", cls: "badge-gold" },
  confirmed: { label: "Confirmed", cls: "badge-green" },
  settled: { label: "Settled", cls: "badge-slate" },
}[s] || { label: s, cls: "badge-slate" });

export default function DashboardPage() {
  const outstanding = MOCK_CHARGES.filter((c) => c.status !== "confirmed" && c.status !== "settled");
  const totalOwing = outstanding.reduce((s, c) => s + c.amount, 0);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-10 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-wide px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-1">Member Area</p>
              <h1 className="text-4xl font-display font-bold text-white">Welcome back, {MOCK_MEMBER.name.split(" ")[0]}!</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/members/profile" className="btn-outline btn-sm">
                <User size={14} /> Profile
              </Link>
              <Link href="/members/membership" className="btn-outline btn-sm">
                <Shield size={14} /> Membership
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-slate-950 pt-0">
        <div className="container-wide px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Availability */}
              <div className="glass-dark p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <CalendarDays size={20} className="text-brand-400" /> My Availability
                  </h2>
                  <Link href="/fixtures" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors flex items-center gap-1">
                    All fixtures <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {MOCK_AVAILABILITY.map((a) => (
                    <div key={a.event_id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <div>
                        <p className="text-white font-medium text-sm">{a.event_title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{formatDateShort(a.date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge text-xs px-3 py-1 ${availClass(a.status)}`}>
                          {availLabel(a.status)}
                        </span>
                        <button className="btn-ghost btn-sm py-1.5">Change</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statement */}
              <div className="glass-dark p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    <CreditCard size={20} className="text-gold-400" /> My Statement
                  </h2>
                  <span className="text-slate-400 text-sm">All amounts in EUR</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Charge</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_CHARGES.map((c) => {
                        const s = chargeStatusLabel(c.status);
                        return (
                          <tr key={c.id}>
                            <td className="text-slate-300">{c.event}</td>
                            <td className="text-slate-400">{c.type}</td>
                            <td className="text-white font-semibold">€{c.amount.toFixed(2)}</td>
                            <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                            <td>
                              {c.status === "raised" && (
                                <button className="btn-primary btn-sm text-xs py-1">Declare paid</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Outstanding balance</span>
                  <span className={`text-lg font-bold font-display ${totalOwing > 0 ? "text-amber-400" : "text-brand-400"}`}>
                    €{totalOwing.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Membership card */}
              <div className="glass-dark p-6 border border-brand-800/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-700/50 flex items-center justify-center">
                    <Shield size={18} className="text-brand-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{MOCK_MEMBER.membership_category}</p>
                    <span className="badge badge-green text-xs">Active</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registration</span>
                    <span className="badge badge-gold text-xs">Submitted</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Member since</span>
                    <span className="text-slate-300">{formatDateShort(MOCK_MEMBER.member_since)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Season ends</span>
                    <span className="text-slate-300">31 Oct 2026</span>
                  </div>
                </div>
                <Link href="/members/membership" className="btn-outline btn-sm w-full justify-center mt-4">
                  View Membership
                </Link>
              </div>

              {/* Balance card */}
              <div className={`glass-dark p-5 border ${MOCK_MEMBER.balance_owing > 0 ? "border-amber-800/40" : "border-brand-800/30"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={18} className={MOCK_MEMBER.balance_owing > 0 ? "text-amber-400" : "text-brand-400"} />
                  <p className="text-white font-semibold text-sm">Outstanding balance</p>
                </div>
                <p className={`text-3xl font-display font-bold ${MOCK_MEMBER.balance_owing > 0 ? "text-amber-400" : "text-brand-400"}`}>
                  €{totalOwing.toFixed(2)}
                </p>
                {totalOwing > 0 && (
                  <p className="text-slate-400 text-xs mt-1">
                    Settle by Bizum, cash or bank transfer. See statement above.
                  </p>
                )}
              </div>

              {/* Quick actions */}
              <div className="glass-dark p-5">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="space-y-2">
                  {[
                    { icon: CalendarDays, label: "Set availability", href: "/fixtures" },
                    { icon: User, label: "Update profile", href: "/members/profile" },
                    { icon: CreditCard, label: "Pay membership fee", href: "/members/membership" },
                    { icon: Shield, label: "View registration status", href: "/members/membership" },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <Icon size={15} className="text-brand-400" />
                      <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{label}</span>
                      <ChevronRight size={14} className="text-slate-600 ml-auto" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sign out */}
              <button className="btn-ghost btn-sm w-full justify-center text-slate-400">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
