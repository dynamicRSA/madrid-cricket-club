import type { ClubEvent, NewsArticle, AGMDocument, MemberProfile, Venue } from "@/types";

// ─── Venues ──────────────────────────────────────────────────────────────────
export const VENUES: Venue[] = [
  {
    id: "v1",
    name: "Casa de Campo Cricket Ground",
    address: "Av. de Portugal, s/n, 28011 Madrid",
    map_link: "https://maps.google.com/?q=Casa+de+Campo+Madrid",
    notes: "Home ground. Parking available on Av. de Portugal.",
    is_home: true,
  },
  {
    id: "v2",
    name: "Valencia Cricket Club",
    address: "Polideportivo La Petxina, Carrer de Lleida, 46015 Valencia",
    map_link: "https://maps.google.com/?q=Valencia+Cricket+Club",
    notes: "Approx. 3.5 hours by car or 1h 40m by AVE from Madrid Atocha.",
    is_home: false,
  },
  {
    id: "v3",
    name: "Alicante CC Ground",
    address: "Polideportivo El Tossal, 03002 Alicante",
    map_link: "https://maps.google.com/?q=Alicante+Cricket",
    notes: "Approx. 4.5 hours by car.",
    is_home: false,
  },
  {
    id: "v4",
    name: "Barcelona CC Ground",
    address: "Pabellón Municipal Can Dragó, Carrer de Rosselló i Porcel, 08016 Barcelona",
    map_link: "https://maps.google.com/?q=Barcelona+Cricket",
    notes: "Approx. 6 hours by car or 3h by AVE.",
    is_home: false,
  },
];

// ─── Events / Fixtures ───────────────────────────────────────────────────────
export const EVENTS: ClubEvent[] = [
  {
    id: "e1",
    type: "match",
    title: "MCC vs Valencia CC",
    opponent: "Valencia CC",
    competition: "Liga Nacional Division 2",
    date: "2026-08-23",
    start_time: "11:00",
    meet_time: "09:30",
    venue_id: "v2",
    venue: VENUES[1],
    is_home: false,
    format: "40_over",
    squad_size: 11,
    availability_deadline: "2026-08-18",
    late_changes_blocked: false,
    team: "seniors",
    notes: "Away weekend. Overnight Friday and Saturday. Kit bag in Ramón's car.",
    status: "scheduled",
  },
  {
    id: "e2",
    type: "match",
    title: "MCC vs Alicante CC",
    opponent: "Alicante CC",
    competition: "Liga Nacional Division 2",
    date: "2026-09-06",
    start_time: "10:30",
    meet_time: "08:30",
    venue_id: "v3",
    venue: VENUES[2],
    is_home: false,
    format: "40_over",
    squad_size: 11,
    availability_deadline: "2026-09-01",
    late_changes_blocked: false,
    team: "seniors",
    status: "scheduled",
  },
  {
    id: "e3",
    type: "match",
    title: "MCC vs Cataluña CC",
    opponent: "Cataluña CC",
    competition: "Liga Nacional Division 2",
    date: "2026-09-20",
    start_time: "10:00",
    meet_time: "09:30",
    venue_id: "v1",
    venue: VENUES[0],
    is_home: true,
    format: "40_over",
    squad_size: 11,
    availability_deadline: "2026-09-15",
    late_changes_blocked: false,
    team: "seniors",
    status: "scheduled",
  },
  {
    id: "e4",
    type: "nets",
    title: "Wednesday Nets",
    date: "2026-08-14",
    start_time: "19:00",
    venue_id: "v1",
    venue: VENUES[0],
    is_home: true,
    squad_size: 20,
    late_changes_blocked: false,
    team: "seniors",
    status: "scheduled",
  },
  {
    id: "e5",
    type: "nets",
    title: "Wednesday Nets",
    date: "2026-08-21",
    start_time: "19:00",
    venue_id: "v1",
    venue: VENUES[0],
    is_home: true,
    squad_size: 20,
    late_changes_blocked: false,
    team: "seniors",
    status: "scheduled",
  },
  // Past fixtures with results
  {
    id: "e10",
    type: "match",
    title: "MCC vs Madrid CC",
    opponent: "Madrid CC",
    competition: "Liga Nacional Division 2",
    date: "2026-07-12",
    start_time: "11:00",
    venue_id: "v1",
    venue: VENUES[0],
    is_home: true,
    format: "40_over",
    squad_size: 11,
    availability_deadline: "2026-07-08",
    late_changes_blocked: false,
    team: "seniors",
    status: "completed",
    result: {
      id: "r10",
      event_id: "e10",
      our_score: "187/6",
      opposition_score: "142/10",
      overs: "40",
      result: "won",
      margin: "45 runs",
      summary: "A comprehensive victory. Tom Harris top-scored with an unbeaten 74, and Yusuf Patel claimed 4-28 with the ball.",
      cricclubs_link: "https://cricclubs.com/example",
    },
    scorecard: {
      id: "sc10",
      event_id: "e10",
      images: [{ id: "img1", url: "/images/scorecard-placeholder.jpg", caption: "Scorebook page 1", order: 0 }],
      cricclubs_link: "https://cricclubs.com/example",
    },
  },
  {
    id: "e11",
    type: "match",
    title: "MCC vs Valencia CC",
    opponent: "Valencia CC",
    competition: "Liga Nacional Division 2",
    date: "2026-06-14",
    start_time: "10:30",
    venue_id: "v2",
    venue: VENUES[1],
    is_home: false,
    format: "40_over",
    squad_size: 11,
    availability_deadline: "2026-06-09",
    late_changes_blocked: false,
    team: "seniors",
    status: "completed",
    result: {
      id: "r11",
      event_id: "e11",
      our_score: "156/10",
      opposition_score: "157/4",
      overs: "38.2",
      result: "lost",
      margin: "6 wickets",
      summary: "Competitive performance in Valencia. We restricted them well early on but couldn't defend 156.",
    },
  },
  {
    id: "e12",
    type: "match",
    title: "MCC vs Alicante CC",
    opponent: "Alicante CC",
    competition: "Liga Nacional Division 2",
    date: "2026-05-03",
    start_time: "11:00",
    venue_id: "v1",
    venue: VENUES[0],
    is_home: true,
    format: "40_over",
    squad_size: 11,
    availability_deadline: "2026-04-28",
    late_changes_blocked: false,
    team: "seniors",
    status: "completed",
    result: {
      id: "r12",
      event_id: "e12",
      our_score: "201/5",
      opposition_score: "198/8",
      overs: "40",
      result: "won",
      margin: "3 runs",
      summary: "Thrilling last-over win at home. The best game of the season so far.",
    },
  },
];

// ─── News ─────────────────────────────────────────────────────────────────────
export const NEWS: NewsArticle[] = [
  {
    id: "n1",
    slug: "victory-over-madrid-cc-july-2026",
    title: "Dominant Victory Over Madrid CC — Match Report",
    excerpt: "A magnificent team performance saw MCC cruise to a 45-run win at Casa de Campo, with Tom Harris' unbeaten 74 the highlight of an excellent batting display.",
    content: `Madrid Cricket Club put in a complete team performance to beat local rivals Madrid CC by 45 runs at Casa de Campo on Saturday 12th July.

**Batting**

Electing to bat first, MCC were given a solid start by openers James Murphy and Rashid Ahmed, who put on 52 for the first wicket. After both fell in quick succession, Tom Harris took the innings by the scruff of the neck, hitting an unbeaten 74 from 82 balls, including 8 fours and 2 sixes. Cameos from Sven Prinsloo (32) and Adam Clarke (24) helped MCC post a challenging 187/6 from their 40 overs.

**Bowling**

Madrid CC never really threatened in their reply. Yusuf Patel was magnificent, finishing with career-best figures of 4/28 from his 8 overs. Carlos García (2/31) and James Murphy (2/19) provided excellent support, as the visitors were bowled out for 142 in the 37th over.

**Captain's comments**

"We played our best cricket of the season. Everyone contributed — with bat, ball and in the field. I'm incredibly proud of the lads." — *Adam Clarke, captain.*`,
    hero_image_url: "/images/news-hero-1.jpg",
    author_name: "Club Secretary",
    published_at: "2026-07-13T10:00:00Z",
    tags: ["match-report", "liga-nacional", "victory"],
    related_fixture_id: "e10",
    is_match_report: true,
  },
  {
    id: "n2",
    slug: "new-season-registrations-open",
    title: "2026/27 Season Registrations Now Open",
    excerpt: "The new membership year has officially opened. All members — senior and junior — must re-register for the 2026/27 season. Early-bird deadline is 15 September.",
    content: `We are delighted to announce that registrations for the 2026/27 season are now open!

**How to register**

1. Log in to your member account at [madrid-cricket-club.github.io](https://madrid-cricket-club.github.io)
2. Navigate to **My Membership** and click **Renew for 2026/27**
3. Confirm your personal details and pay the membership fee by bank transfer

**Fees**

| Category | Amount |
|---|---|
| Senior Full Year | €80 |
| Senior Half Year | €50 |
| Junior Full Year | €40 |
| Junior Half Year | €25 |

Payment details and your unique reference will be shown after you complete the form.

**Important:** Under Cricket España rules, only registered and insured members may take the field. Registration must be completed before selection is possible.

For any questions, contact the secretary at **secretary@madridcricketclub.es**.`,
    hero_image_url: "/images/news-hero-2.jpg",
    author_name: "Club Secretary",
    published_at: "2026-08-01T09:00:00Z",
    tags: ["membership", "season-2026-27", "registration"],
    is_match_report: false,
  },
  {
    id: "n3",
    slug: "away-weekend-valencia-august",
    title: "Valencia Away Weekend — Everything You Need to Know",
    excerpt: "Full logistical details for our trip to Valencia on 22–24 August. Accommodation, transport, match day times and catering all confirmed.",
    content: `Our next Liga Nacional fixture is away to Valencia CC on **Saturday 23 August**, and we're making a weekend of it!

**Travel**

We're caravanning down on Friday afternoon. If you can drive, or need a seat, please record this on the event page — we want to make sure everyone has a way down.

**Accommodation**

We've booked a large apartment near the ground for Friday and Saturday nights. Cost is **€35/person/night**. Select your nights on the event page before the **18 August deadline**.

**Match day**

- Meet at the ground: **09:30**
- Toss: **10:30**
- Lunch: Paella at the ground (€12, book when you select your availability)
- Tea: included in ground fees

**Selection**

Availability deadline is **Tuesday 19 August** at midnight. Please respond — the captain needs to know who's available to plan the trip.`,
    hero_image_url: "/images/news-hero-3.jpg",
    author_name: "Club Captain",
    published_at: "2026-08-10T08:00:00Z",
    tags: ["away-trip", "valencia", "liga-nacional"],
    is_match_report: false,
  },
];

// ─── AGM Documents ────────────────────────────────────────────────────────────
export const AGM_DOCS: AGMDocument[] = [
  {
    id: "agm1",
    year: 2026,
    title: "AGM 2026 — Minutes",
    document_url: "/documents/agm-2026-minutes.pdf",
    type: "minutes",
    is_public: true,
    uploaded_at: "2026-03-15T12:00:00Z",
  },
  {
    id: "agm2",
    year: 2026,
    title: "AGM 2026 — Annual Accounts",
    document_url: "/documents/agm-2026-accounts.pdf",
    type: "accounts",
    is_public: true,
    uploaded_at: "2026-03-15T12:00:00Z",
  },
  {
    id: "agm3",
    year: 2025,
    title: "AGM 2025 — Minutes",
    document_url: "/documents/agm-2025-minutes.pdf",
    type: "minutes",
    is_public: true,
    uploaded_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "agm4",
    year: 2025,
    title: "AGM 2025 — Annual Accounts",
    document_url: "/documents/agm-2025-accounts.pdf",
    type: "accounts",
    is_public: true,
    uploaded_at: "2025-03-20T10:00:00Z",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
export const SEASON_STATS = {
  played: 3,
  won: 2,
  lost: 1,
  drew: 0,
  nrr: "+0.82",
  position: 2,
  season: "2026",
};

// ─── Committee ────────────────────────────────────────────────────────────────
export const COMMITTEE = [
  { role: "Chairman", name: "Robert Ashworth", bio: "Rob has been with the club since its founding in 2008 and brings a wealth of cricket administration experience." },
  { role: "Captain", name: "Adam Clarke", bio: "A prolific middle-order batter and off-spin bowler, Adam has captained MCC for three seasons." },
  { role: "Secretary", name: "María González", bio: "María handles all club communications, Cricket España registration and player welfare." },
  { role: "Treasurer", name: "Adam Clarke", bio: "Also serving as Treasurer this season, overseeing club finances and match-day fee collection." },
  { role: "Social & Welfare", name: "Priya Patel", bio: "Priya organises the club's social events and away trips, including the annual cricket tour." },
  { role: "Juniors Co-ordinator", name: "James Murphy", bio: "James heads up the junior programme, working with our junior coaches to develop the next generation." },
];
