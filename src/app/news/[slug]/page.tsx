import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { NEWS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return NEWS.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const article = NEWS.find((a) => a.slug === params.slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.hero_image_url ? [{ url: article.hero_image_url }] : [],
    },
  };
}

// Simple markdown-to-HTML renderer for bold and line breaks
function renderContent(content: string) {
  const html = content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
  return `<p>${html}</p>`;
}

export default function ArticlePage({ params }: Props) {
  const article = NEWS.find((a) => a.slug === params.slug);
  if (!article) notFound();

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-0">
        {article.hero_image_url && (
          <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
            <Image
              src={article.hero_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
          </div>
        )}
      </section>

      <section className="section bg-slate-950 pt-0">
        <div className="container-content px-4 -mt-16 relative z-10">
          <Link href="/news" className="btn-ghost btn-sm mb-6 -ml-2">
            <ArrowLeft size={16} /> All News
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.is_match_report && <span className="badge badge-green">Match Report</span>}
            {article.tags.map((tag) => (
              <span key={tag} className="badge badge-slate">
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-5 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-5 text-slate-400 text-sm mb-10 pb-8 border-b border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-brand-400" />
              {article.author_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-brand-400" />
              {formatDate(article.published_at, "en", "d MMMM yyyy")}
            </span>
          </div>

          {/* Article body */}
          <div
            className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
            style={{
              "--tw-prose-body": "rgb(203 213 225)",
              "--tw-prose-headings": "white",
              "--tw-prose-bold": "white",
              "--tw-prose-links": "#48b585",
            } as React.CSSProperties}
          />

          {/* Related fixture */}
          {article.related_fixture_id && (
            <div className="mt-12 glass-dark p-5 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Related fixture</p>
                <p className="text-white font-semibold">View the full scorecard</p>
              </div>
              <Link href={`/results/${article.related_fixture_id}`} className="btn-primary btn-sm">
                View Scorecard
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* More news */}
      <section className="section bg-slate-900/30 pt-0">
        <div className="container-content px-4">
          <h2 className="text-2xl font-display font-bold text-white mb-6">More News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {NEWS.filter((a) => a.slug !== params.slug).slice(0, 2).map((a) => (
              <Link key={a.slug} href={`/news/${a.slug}`} className="glass-dark p-5 card-hover group flex gap-4">
                {a.hero_image_url && (
                  <div className="relative w-24 h-20 rounded-lg overflow-hidden shrink-0">
                    <Image src={a.hero_image_url} alt={a.title} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-slate-500 text-xs mb-1">{formatDate(a.published_at, "en", "d MMM yyyy")}</p>
                  <p className="text-white font-semibold text-sm group-hover:text-brand-300 transition-colors leading-snug">{a.title}</p>
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
