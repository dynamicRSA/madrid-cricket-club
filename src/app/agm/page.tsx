import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AGM_DOCS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { FileText, Download, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGM & Club Records",
  description: "Madrid Cricket Club Annual General Meeting minutes, accounts and official documents.",
};

const TYPE_LABELS: Record<string, string> = {
  minutes: "Minutes",
  accounts: "Accounts",
  agenda: "Agenda",
  other: "Document",
};

export default function AGMPage() {
  const years = [...new Set(AGM_DOCS.map((d) => d.year))].sort((a, b) => b - a);

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-wide px-4">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Club Governance</p>
          <h1 className="text-5xl font-display font-bold text-white mb-4">AGM & Club Records</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Annual General Meeting minutes, accounts and official club documents. Private team and AGM documents are available to members in the member area.
          </p>
        </div>
      </section>

      <section className="section bg-slate-950">
        <div className="container-wide px-4">
          {years.map((year) => {
            const docs = AGM_DOCS.filter((d) => d.year === year && d.is_public);
            if (docs.length === 0) return null;
            return (
              <div key={year} className="mb-12">
                <div className="flex items-center gap-4 mb-5">
                  <h2 className="text-3xl font-display font-bold text-white">AGM {year}</h2>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => (
                    <div key={doc.id} className="glass-dark p-5 card-hover flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-brand-900/60 flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="badge badge-slate text-xs mb-1">{TYPE_LABELS[doc.type] || doc.type}</span>
                        <p className="text-white font-semibold text-sm truncate">{doc.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {formatDate(doc.uploaded_at, "en", "d MMM yyyy")}
                        </p>
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline btn-sm mt-3 text-xs"
                        >
                          <Download size={12} /> Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Members note */}
          <div className="glass-dark p-6 flex items-center gap-4 mt-8">
            <div className="w-12 h-12 rounded-xl bg-gold-900/40 flex items-center justify-center shrink-0">
              <Lock size={20} className="text-gold-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Additional documents available to members</p>
              <p className="text-slate-400 text-sm mt-0.5">
                Committee meeting minutes, financial summaries and team documents are available in the{" "}
                <a href="/auth/signin" className="text-brand-400 hover:text-brand-300 underline">
                  member area
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
