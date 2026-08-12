import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Users, CalendarDays, CreditCard, FileText, Settings, BarChart2, Shield, AlertTriangle, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Area",
  description: "Madrid Cricket Club administration dashboard.",
};

const SECTIONS = [
  {
    href: "/admin/members",
    icon: Users,
    label: "Members",
    description: "View and manage the member register, approve applications, export data",
    stats: "62 active members",
    color: "brand",
  },
  {
    href: "/admin/events",
    icon: CalendarDays,
    label: "Events & Fixtures",
    description: "Create and manage fixtures, nets, and other events",
    stats: "5 upcoming",
    color: "gold",
  },
  {
    href: "/admin/fees",
    icon: CreditCard,
    label: "Fees & Payments",
    description: "View and confirm payments, manage charges, export financial data",
    stats: "€1,240 outstanding",
    color: "gold",
  },
  {
    href: "/admin/scorecards",
    icon: FileText,
    label: "Scorecards",
    description: "Publish results, upload scorecard images, enter structured data",
    stats: "3 results this season",
    color: "brand",
  },
  {
    href: "/admin/registration",
    icon: Shield,
    label: "Cricket España Registration",
    description: "Generate and send registration returns, view disclosure log",
    stats: "58 registered",
    color: "brand",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "Site Settings",
    description: "Membership year dates and fees, notification recipients, bank details",
    stats: "Super admin only",
    color: "slate",
  },
];

const ALERTS = [
  { type: "warning", message: "4 membership applications awaiting committee review" },
  { type: "info", message: "Availability deadline for MCC vs Valencia CC is in 6 days (18 Aug)" },
  { type: "warning", message: "3 members have outstanding balances over 30 days" },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-28 pb-10 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-wide px-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-1">Administration</p>
              <h1 className="text-4xl font-display font-bold text-white">Admin Dashboard</h1>
            </div>
            <span className="badge badge-gold">Admin</span>
          </div>
        </div>
      </section>

      <section className="section bg-slate-950 pt-0">
        <div className="container-wide px-4">

          {/* Alerts */}
          <div className="space-y-2 mb-8">
            {ALERTS.map((alert, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
                  alert.type === "warning"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-brand-500/10 border-brand-500/30 text-brand-300"
                }`}
              >
                <AlertTriangle size={16} className="shrink-0" />
                {alert.message}
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Members", value: "62" },
              { label: "Active + Paid", value: "54" },
              { label: "Registered CE", value: "58" },
              { label: "Outstanding (€)", value: "1,240" },
            ].map((s) => (
              <div key={s.label} className="glass-dark p-5 text-center">
                <p className="text-3xl font-display font-bold text-white mb-1">{s.value}</p>
                <p className="text-slate-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Admin sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="glass-dark p-6 card-hover group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    section.color === "brand" ? "bg-brand-900/60" : section.color === "gold" ? "bg-gold-900/40" : "bg-slate-800/60"
                  }`}>
                    <section.icon size={22} className={
                      section.color === "brand" ? "text-brand-400" : section.color === "gold" ? "text-gold-400" : "text-slate-400"
                    } />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{section.stats}</span>
                </div>
                <h3 className="text-white font-display font-bold text-lg mb-1 group-hover:text-brand-300 transition-colors">
                  {section.label}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{section.description}</p>
                <div className="flex items-center gap-1 mt-4 text-brand-400 text-sm font-medium">
                  Open <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>

          {/* Audit trail link */}
          <div className="mt-8 glass-dark p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart2 size={18} className="text-slate-400" />
              <span className="text-slate-300 text-sm">Audit trail — all role changes, payments and status changes recorded here</span>
            </div>
            <Link href="/admin/audit" className="btn-ghost btn-sm">View <ChevronRight size={13} /></Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
