import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { articles, getArticle, type ArticleBlock } from "@/lib/articles";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";
import { imgSrc } from "@/lib/imgSrc";

interface Props {
  params: Promise<{ slug: string }>;
}

// Pre-generate a static page for every article id at build time
export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: `${article.title} | Madrid Cricket Club`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.image ? [{ url: article.image }] : [],
    },
  };
}

function renderBlock(block: ArticleBlock, i: number) {
  switch (block.type) {
    case "paragraph":
      return <p key={i} className="text-slate-300 leading-relaxed text-lg mb-6">{block.text}</p>;

    case "italic":
      return <p key={i} className="text-slate-400 italic leading-relaxed text-base mb-4">{block.text}</p>;

    case "heading":
      return (
        <h2 key={i} className="text-2xl font-display font-bold text-white mt-10 mb-4 pb-2 border-b border-brand-500/30">
          {block.text}
        </h2>
      );

    case "image":
      return (
        <figure key={i} className="my-10">
          <div className="relative w-full rounded-xl overflow-hidden">
            <Image
              src={imgSrc(block.src)}
              alt={block.caption ?? ""}
              width={900}
              height={600}
              className="w-full h-auto object-cover rounded-xl"
              unoptimized
            />
          </div>
          {block.caption && (
            <figcaption className="text-center text-slate-500 text-sm mt-3 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return (
        <hr
          key={i}
          className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
        />
      );

    case "callout":
      return (
        <div
          key={i}
          className="my-8 rounded-xl border border-brand-500/30 bg-brand-900/20 p-6 pl-7 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-400 rounded-l-xl" />
          <h3 className="text-brand-300 font-semibold text-sm uppercase tracking-wider mb-4">
            {block.title}
          </h3>
          <ul className="space-y-3">
            {block.lines.map((line, li) => (
              <li key={li} className="text-slate-300 leading-relaxed text-base">{line}</li>
            ))}
          </ul>
        </div>
      );

    case "signature":
      return (
        <div key={i} className="mt-8 mb-2 text-right">
          <p className="text-white font-semibold text-base">{block.name}</p>
          <p className="text-slate-400 text-sm italic">{block.role}</p>
        </div>
      );

    default:
      return null;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = articles
    .filter((a) => a.id !== slug && !a.isPlaceholder)
    .slice(0, 2);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero image */}
      {article.image && (
        <section className="relative pt-16">
          <div
            className="relative h-[45vh] md:h-[55vh] overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${imgSrc(article.image)})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
          </div>
        </section>
      )}

      <section className={`section bg-slate-950 ${article.image ? "pt-0" : "pt-24"}`}>
        <div className="container-content px-4 -mt-16 relative z-10">
          <Link href="/news" className="btn-ghost btn-sm mb-6 -ml-2 inline-flex">
            <ArrowLeft size={16} /> All News
          </Link>

          {/* Category badge */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.category && (
              <span className="badge badge-slate">
                <Tag size={10} />
                {article.category}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-5 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-5 text-slate-400 text-sm mb-10 pb-8 border-b border-white/[0.06]">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-brand-400" />
              {article.date}
            </span>
          </div>

          {/* Article body: rich blocks if available, otherwise plain paragraph split */}
          <div className="max-w-none">
            {article.blocks
              ? article.blocks.map((block, i) => renderBlock(block, i))
              : (article.body || article.excerpt).split("\n\n").map((para, i) => (
                  <p key={i} className="text-slate-300 leading-relaxed text-lg mb-6">{para}</p>
                ))
            }
          </div>
        </div>
      </section>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="section bg-slate-900/30 pt-0">
          <div className="container-content px-4">
            <h2 className="text-2xl font-display font-bold text-white mb-6">More News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {related.map((a) => (
                <Link
                  key={a.id}
                  href={`/news/${a.id}`}
                  prefetch={false}
                  className="glass-dark p-5 card-hover group flex gap-4"
                >
                  {a.image && (
                    <div
                      className="relative w-24 h-20 rounded-lg overflow-hidden shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${imgSrc(a.image)})` }}
                    />
                  )}
                  <div>
                    <p className="text-slate-500 text-xs mb-1">{a.date}</p>
                    <p className="text-white font-semibold text-sm group-hover:text-brand-300 transition-colors leading-snug">
                      {a.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
