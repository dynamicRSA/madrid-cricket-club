"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { imgSrc } from "@/lib/imgSrc";

// ─── Real & placeholder news items ─────────────────────────────────────────
// Real articles sourced from cricketinmadrid.com and @madridcricketclub Instagram
// Placeholders marked with isPlaceholder: true

const articles = [
  {
    id: "mcc-25th-anniversary-2026",
    title: "Happy 25th Anniversary, Madrid Cricket Club!",
    category: "Club News",
    date: "23 Jul 2026",
    image: "/images/social/mcc-25th-anniversary.jpg",
    excerpt:
      "Twenty-five years ago, Madrid Cricket Club was reborn from a simple idea shared between three friends over a beer. Today we celebrate a quarter-century of cricket, friendship, and community in Madrid.",
    isPlaceholder: false,
    isReal: true,
  },
  {
    id: "eccl-win-la-manga-2026",
    title: "MCC Win ECCL 40 Overs Clash vs La Manga Torrevieja CC",
    category: "Match Report",
    date: "19 Jul 2026",
    image: "/images/social/mcc-eccl-result-2.jpg",
    excerpt:
      "Madrid Cricket Club posted 272/10 in 37.4 overs against La Manga Torrevieja Cricket Club, who fell short for 246/9. A commanding 26-run victory in the ECCL 40 Overs 2026.",
    isPlaceholder: false,
    isReal: true,
  },
  {
    id: "fathers-sprogs-england-2026",
    title: "Fathers & Sprogs Tour — Two Wins in England at Blockley CC",
    category: "Tour Report",
    date: "20 Jul 2026",
    image: "/images/social/mcc-fathers-sprogs.jpg",
    excerpt:
      "A successful weekend away — Madrid CC's Fathers and Sprogs side travelled to Blockley Cricket Club in England and returned with two wins. A weekend to remember.",
    isPlaceholder: false,
    isReal: true,
  },
  {
    id: "madrid-royals-launch",
    title: "Madrid Royals Make National League Debut",
    category: "Women's Cricket",
    date: "24 Apr 2024",
    image: "/images/social/mcc-la-manga.jpg",
    excerpt:
      "El Madrid Royals debutó en el primer fin de semana de la liga nacional femenina en Barcelona — a historic milestone for women's cricket at MCC. Un inicio fenomenal con una victoria ante La Manga.",
    isPlaceholder: false,
    isReal: true,
  },
  {
    id: "dhoni-visit-2016",
    title: "When Dhoni Came to Madrid",
    category: "Club History",
    date: "6 Nov 2016",
    image: null,
    imageUrl: "/images/news-hero-4.jpg",
    excerpt:
      "On a glorious sunny Sunday, India's limited-overs captain and cricketing legend Mahendra Singh Dhoni paid a visit to our club in San Fernando de Henares, along with over 300 fans as part of a corporate event.",
    isPlaceholder: false,
    isReal: true,
  },
  {
    id: "obrevonac-refugee-camp",
    title: "Cricket Comes to the Obrevonac Refugee Camp, Serbia",
    category: "Community",
    date: "Aug 2017",
    image: null,
    imageUrl: "/images/news-hero-5.jpg",
    excerpt:
      "How did some Brits playing cricket in Spain end up in Serbia playing with Afghans? Could it really be down to some Spaniards playing cricket in France? The remarkable story of our refugee camp visit.",
    isPlaceholder: false,
    isReal: true,
  },
  {
    id: "placeholder-next",
    title: "Next Article Coming Soon",
    category: "Placeholder",
    date: "—",
    image: null,
    excerpt:
      "This slot will be filled with the next news article from the club. Content to be populated by the committee.",
    isPlaceholder: true,
    isReal: false,
  },
];

const categories = ["All", "Match Report", "Club News", "Tour Report", "Women's Cricket", "Community", "Club History"];

export default function NewsPage() {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-12 px-4" style={{ background: "linear-gradient(135deg, #1a0505 0%, #120808 100%)" }}>
        <div className="container-wide">
          <p className="text-brand-400 text-xs uppercase tracking-widest mb-2">Latest from the Club</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">News & Reports</h1>
          <p className="text-slate-400 max-w-xl">
            Match reports, club news, tour stories, and community highlights from Madrid Cricket Club.
          </p>
        </div>
      </section>

      {/* Category filter (visual only — placeholder for JS filtering) */}
      <div className="px-4 py-4 border-b border-white/[0.06]" style={{ background: "#120808" }}>
        <div className="container-wide flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                cat === "All"
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-white border border-white/[0.1] hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured article */}
      <section className="px-4 py-10" style={{ background: "#120808" }}>
        <div className="container-wide">
          <div className="glass-dark overflow-hidden card-hover">
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[320px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc(featured.image!)}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
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
                  Read More <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article grid */}
      <section className="pb-16 px-4" style={{ background: "#120808" }}>
        <div className="container-wide grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((article) => (
            <article key={article.id} className={`glass-dark overflow-hidden card-hover ${article.isPlaceholder ? "opacity-40" : ""}`}>
              {/* Image */}
              <div className="relative aspect-[16/9] bg-[#1a0505]">
                {(article.image || article.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc(article.image || article.imageUrl!)}
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
                    {article.isPlaceholder ? "📝 Placeholder" : article.category}
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
                    Read More <ArrowRight size={12} />
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
