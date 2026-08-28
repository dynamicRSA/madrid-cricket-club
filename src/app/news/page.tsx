"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { imgSrc } from "@/lib/imgSrc";

// ─── Real & placeholder news items ─────────────────────────────────────────
// Real articles sourced from cricketinmadrid.com and @madridcricketclub Instagram
// Placeholders marked with isPlaceholder: true

import { articles } from "@/lib/articles";

const categories = ["All", "Match Report", "Club News", "Tour Report", "Women's Cricket", "Community", "Club History"];

export default function NewsPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleArticles = activeCategory === "All"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const featured = visibleArticles[0];
  const rest = visibleArticles.slice(1);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-12 px-4" style={{ background: "linear-gradient(135deg, #1a0505 0%, #120808 100%)" }}>
        <div className="container-wide">
          <p className="text-brand-400 text-xs uppercase tracking-widest mb-2">{t("news.tag")}</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">{t("news.title")}</h1>
          <p className="text-slate-400 max-w-xl">{t("news.desc")}</p>
        </div>
      </section>

      {/* Category filter */}
      <div className="px-4 py-4 border-b border-white/[0.06]" style={{ background: "#120808" }}>
        <div className="container-wide flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                cat === activeCategory
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white border border-white/[0.1] hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured article */}
      {featured && (
      <section className="px-4 py-10" style={{ background: "#120808" }}>
        <div className="container-wide">
          <div className="glass-dark overflow-hidden card-hover">
          <div className="grid md:grid-cols-2">
              <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[320px] overflow-hidden bg-[#1a0505]">
                {featured.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc(featured.image)}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-slate-600 text-xs">
                      No Image
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="badge-red">{featured.category}</span>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                  <Calendar size={12} />
                  {featured.date}
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-3">{featured.title}</h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                <Link href={`/news/${featured.id}`} className="btn-primary self-start">
                  {t("news.read_more")} <ArrowRight size={14} />
                </Link>
              </div>
          </div>
          </div>
        </div>
      </section>
      )}

      {/* No results */}
      {visibleArticles.length === 0 && (
        <section className="px-4 py-16 text-center" style={{ background: "#120808" }}>
          <p className="text-slate-400 text-sm">No articles in this category yet.</p>
        </section>
      )}

      {/* Article grid */}
      <section className="pb-16 px-4" style={{ background: "#120808" }}>
        <div className="container-wide grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((article) => (
            <article key={article.id} className={`glass-dark overflow-hidden card-hover ${article.isPlaceholder ? "opacity-40" : ""}`}>
              {/* Image */}
              <div className="relative aspect-[16/9] bg-[#1a0505]">
                {article.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc(article.image)}
                    alt={article.title}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-slate-600 text-xs">
                      No Image
                    </div>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    article.isPlaceholder ? "bg-slate-700 text-slate-400" :
                    article.category === "Match Report" ? "bg-brand-600/80 text-white" :
                    article.category === "Community" ? "bg-blue-600/80 text-white" :
                    article.category === "Women's Cricket" ? "bg-purple-600/80 text-white" :
                    "bg-gold-600/80 text-white"
                  }`}>
                    {article.isPlaceholder ? "Placeholder" : article.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                  <Calendar size={10} /> {article.date}
                </div>
                <h3 className="text-white font-display font-bold text-base mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-3 mb-4">{article.excerpt}</p>
                {!article.isPlaceholder ? (
                  <Link href={`/news/${article.id}`} className="text-brand-400 text-xs font-medium hover:text-brand-300 flex items-center gap-1">
                    {t("news.read_more")} <ArrowRight size={12} />
                  </Link>
                ) : (
                  <p className="text-slate-600 text-xs italic">Content to be added by committee</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
