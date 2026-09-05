// Shared news articles — used by /news list and /news/[slug] detail pages
// Add new articles here; they will automatically appear in both places.

// Rich content block types for article bodies
export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "italic"; text: string }
  | { type: "heading"; text: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "divider" }
  | { type: "callout"; title: string; lines: string[] }
  | { type: "signature"; name: string; role: string };

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
  /** Rich content blocks — if present, used instead of `body` */
  blocks?: ArticleBlock[];
}

export const articles: NewsArticle[] = [
  {
    id: "barcelona-t20-win-sep2026",
    title: "El Clásico del Críquet: MCC Demolish Barcelona by 82 Runs",
    category: "Match Report",
    date: "5 Sep 2026",
    image: "/images/real/mcc-la-manga-pro.jpg",
    excerpt:
      "Imran Siddque's blistering 61 off 30 balls lit up La Manga as Madrid Cricket Club crushed Barcelona International CC by 82 runs in the first T20 of the ECCL weekend series — a true El Clásico moment.",
    isPlaceholder: false,
    isReal: true,
    blocks: [
      {
        type: "heading",
        text: "ECCL T20 2026 — Game 1 | 5 September 2026 | La Manga Club",
      },
      {
        type: "paragraph",
        text: "If there is a El Clásico in Spanish cricket, this is it. Madrid Cricket Club travelled to La Manga for a full weekend double-header against Barcelona International Cricket Club — two T20s on Saturday and a 40-over on Sunday — and opened the series in emphatic, unmistakable style.",
      },
      {
        type: "heading",
        text: "Madrid Innings — 194/5 (20 overs)",
      },
      {
        type: "paragraph",
        text: "Prabin Bensam and Joe Healey opened the batting, with Bensam making a composed 31 off 28 balls before being caught. Gourav Saha steadied the innings with 33 off 36 balls. The innings shifted gear dramatically when Imran Siddque arrived at the crease.",
      },
      {
        type: "callout",
        title: "⭐ Imran Siddque — 61 off 30 balls (5×4, 5×6) | SR: 203.33",
        lines: [
          "Imran took the Barcelona attack apart with five fours and five sixes.",
          "A matchwinning, momentum-shifting innings of rare power and timing.",
          "Caught †S Bhosale b O Ashfaq — but only after the damage was well and truly done.",
        ],
      },
      {
        type: "paragraph",
        text: "Anand Kaul (10* off 10) and Jon Woodward (3* off 2) kept the scoreboard ticking in the death overs. Extras of 44 (b2 lb2 w28 nb12) also contributed significantly to the total. Madrid posted 194/5 off 20 overs.",
      },
      {
        type: "heading",
        text: "Barcelona Innings — 112/8 (14.3 overs)",
      },
      {
        type: "paragraph",
        text: "Chasing 195, Barcelona were never in the hunt. V Kandral fell in the very first over for 3 with the score at just 3, and wickets tumbled regularly throughout. Adnan Shakib (4-0-25-2) and Deepak Kumar Lamba (3-0-25-2) were the pick of the bowlers, with Imran Siddque (3-1-11-1) again contributing with the ball. Revat Naidoo took a wicket in his only 3 balls.",
      },
      {
        type: "callout",
        title: "Barcelona Fall of Wickets",
        lines: [
          "1-3 (V Kandral, 0.1) | 2-21 (R Kranti, 2.6) | 3-43 (C Raghavan, 6.3)",
          "4-56 (U Razi, 7.5) | 5-63 (A Kanwar, 9.1) | 6-74 (S Sathyashankar, 11.3)",
          "7-85 (A Shindore, 12.6) | 8-112 (S Bhosale, 14.3)",
        ],
      },
      {
        type: "paragraph",
        text: "Barcelona were dismissed for 112 in 14.3 overs. Madrid Cricket Club won by 82 runs — a dominant performance from first ball to last.",
      },
      {
        type: "heading",
        text: "The Weekend Continues",
      },
      {
        type: "paragraph",
        text: "The second T20 was due to be played later that afternoon, with the 40-over match scheduled for Sunday 6 September. The El Clásico series is very much alive — and Madrid have fired the first shot.",
      },
      {
        type: "signature",
        name: "Club Secretary",
        role: "Madrid Cricket Club",
      },
    ],
  },
  {
    id: "ron-graham-tribute",
    title: "Remembering Ron Graham",
    category: "Club News",
    date: "28 Aug 2025",
    image: "/images/real/ron-graham-ceremony.jpg",
    excerpt:
      "It is with great sadness that Madrid Cricket Club marks the passing of our friend Ron Graham — our first tournament referee, who shaped every La Manga tournament that followed.",
    isPlaceholder: false,
    isReal: true,
    blocks: [
      {
        type: "paragraph",
        text: "It is with great sadness that Madrid Cricket Club marks the passing of our friend Ron Graham.",
      },
      {
        type: "paragraph",
        text: "Ron was there at the beginning. When we took our T20 tournament to La Manga for the first time in 2009, having started out with the embassy sides, Ron was our first tournament referee. He set the tone for everything that followed: calm, fair, and trusted by every side that played.",
      },
      {
        type: "paragraph",
        text: "What most people won't know is that the tournament might have been a one-off without him. At the end of that first year, Ron told me it was one of the best run events he had been involved in, and that we would be mad not to do it again. I had not until then thought of it as an annual fixture. Every tournament since has, in some real sense, come from a conversation with Ron.",
      },
      {
        type: "paragraph",
        text: "He went on to referee the tournament for twelve years, stepping back only when his knee finally forced him to. Alongside that he umpired in the Spanish league for many years, and he was simply one of the best umpires to stand in it. He was not only a fixture at La Manga and Alfaz del Pi, but also at grounds all over the country, wherever the cricket needed him. Anyone who played in that time will have stood at the crease with Ron at the other end. His knowledge of the game was extraordinary, held lightly and shared freely, usually with a dry line attached. He gave decisions the way he did everything else, without fuss, and you accepted them because you knew he had seen it properly.",
      },
      {
        type: "paragraph",
        text: "Umpires occupy a strange position in cricket. They are essential and they are meant to go unnoticed, and the best of them are remembered less for any single decision than for what it felt like to have them out there. Ron was one of the best of them. Year after year of weekends in the Spanish sun, and the miles of driving to get to them, largely unthanked, purely for the love of the game.",
      },
      {
        type: "paragraph",
        text: "Beyond the white coat, he was simply a good man and a great friend, to this club and to many of us personally. We will miss him in the middle, and we will miss him in the bar afterwards.",
      },
      {
        type: "paragraph",
        text: "Our thoughts are with his family. Rest well, Ron. Thanks for everything.",
      },
      {
        type: "signature",
        name: "Jon Woodward",
        role: "President, Madrid Cricket Club",
      },
      {
        type: "divider",
      },
      {
        type: "heading",
        text: "Funeral details",
      },
      {
        type: "callout",
        title: "Service — Monday 31 August",
        lines: [
          "📍 Tanatorio de Novelda — service at 2pm; chapel of rest open from 12pm",
          "🍺 Wake at Tipsy Terrace (TT), Hondón de los Frailes — from approximately 3.30pm",
          "🇬🇧 A memorial service will also be held in the UK at a later date — details to follow here",
        ],
      },
    ],
  },
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
    image: null,
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
