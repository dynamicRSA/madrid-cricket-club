// Shared news articles — used by /news list and /news/[slug] detail pages
// Add new articles here; they will automatically appear in both places.

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string | null;
  excerpt: string;
  isPlaceholder: boolean;
  isReal: boolean;
  body?: string;
}

export const articles = [
  {
    id: "mcc-25th-anniversary-2026",
    title: "Happy 25th Anniversary, Madrid Cricket Club!",
    category: "Club News",
    date: "23 Jul 2026",
    image: "/images/real/mcc-1982.png",
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
    image: "/images/real/mcc-la-manga-pro.jpg",
    excerpt:
      "Madrid Cricket Club posted 272/10 in 37.4 overs against La Manga Torrevieja Cricket Club, who fell short for 246/9. A commanding 26-run victory in the ECCL 40 Overs 2026.",
    isPlaceholder: false,
    isReal: true,
  },
  {
    id: "fathers-sprogs-england-2026",
    title: "Fathers & Sprogs Tour: Two Wins in England at Blockley CC",
    category: "Tour Report",
    date: "20 Jul 2026",
    image: "/images/real/mcc-ecn-lineup.jpg",
    excerpt:
      "A successful weekend away as Madrid CC's Fathers and Sprogs side travelled to Blockley Cricket Club in England and returned with two wins.",
    isPlaceholder: false,
    isReal: true,
  },
  {
    id: "madrid-royals-launch",
    title: "Madrid Royals Make National League Debut",
    category: "Women's Cricket",
    date: "24 Apr 2024",
    image: "/images/real/mcc-team-alicante.jpg",
    excerpt:
      "El Madrid Royals debutó en el primer fin de semana de la liga nacional femenina en Barcelona: a historic milestone for women's cricket at MCC.",
    isPlaceholder: false,
    isReal: true,
  },
  {
    id: "dhoni-visit-2016",
    title: "When Dhoni Came to Madrid",
    category: "Club History",
    date: "6 Nov 2016",
    image: "/images/real/mcc-article.jpg",
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
    image: "/images/real/mcc-youth-training.webp",
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


export function getArticle(id: string): NewsArticle | undefined {
  return articles.find((a) => a.id === id);
}
