import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { NEWS } from "@/lib/mock-data";
import { formatDate, truncate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news, match reports and club updates from Madrid Cricket Club.",
};

export default function NewsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container-wide px-4">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Club Updates</p>
          <h1 className="text-5xl font-display font-bold text-white mb-4">News & Reports</h1>
          <p className="text-slate-400 text-lg">Match reports, announcements and club news from Madrid Cricket Club.</p>
        </div>
      </section>

      <section className="section bg-slate-950">
        <div className="container-wide px-4">

          {/* Featured article */}
          {NEWS[0] && (
            <Link href={`/news/${NEWS[0].slug}`} className="block glass-dark card-hover mb-10 group overflow-hidden rounded-2xl">
              <div className="flex flex-col lg:flex-row">
                {NEWS[0].hero_image_url && (
                  <div className="relative lg:w-1/2 h-64 lg:h-auto">
                    <Image
                      src={NEWS[0].hero_image_url}
                      alt={NEWS[0].title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/50" />
                  </div>
                )}
                <div className="p-8 lg:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="badge badge-gold">Featured</span>
                    {NEWS[0].is_match_report && <span className="badge badge-green">Match Report</span>}
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{formatDate(NEWS[0].published_at, "en", "d MMMM yyyy")}</p>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4 group-hover:text-brand-300 transition-colors leading-snug">
                    {NEWS[0].title}
                  </h2>
                  <p className="text-slate-300 leading-relaxed mb-6">{NEWS[0].excerpt}</p>
                  <div className="flex items-center gap-2 text-brand-400 font-semibold">
                    Read full article <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid of remaining articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NEWS.slice(1).map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="glass-dark card-hover flex flex-col overflow-hidden group rounded-2xl"
              >
                {article.hero_image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.hero_image_url}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    {article.is_match_report && (
                      <span className="absolute bottom-3 left-3 badge badge-green text-xs">Match Report</span>
                    )}
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-slate-500 text-xs mb-2">{formatDate(article.published_at, "en", "d MMMM yyyy")}</p>
                  <h3 className="text-white font-display font-bold text-lg mb-2 group-hover:text-brand-300 transition-colors leading-snug flex-1">
                    {article.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{truncate(article.excerpt, 100)}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag) => (
                      <span key={tag} className="badge badge-slate">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-brand-400 text-sm font-medium mt-auto">
                    Read more <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
