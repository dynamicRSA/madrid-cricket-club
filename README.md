# Madrid Cricket Club

Cricket club website and management platform for Madrid Cricket Club.

## Stack
- **Next.js 14** (App Router, TypeScript, static export)
- **Tailwind CSS** (custom design system with brand tokens)
- **Supabase** (PostgreSQL + Auth + Storage + RLS)
- **Resend** (transactional email)
- **next-intl** (EN/ES bilingual)
- **GitHub Pages** (hosting via GitHub Actions)

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase and Resend credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## Database

The complete Supabase schema is in `supabase/schema.sql`. Run it in the Supabase SQL editor to set up your database.

## Deployment

The site is deployed automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

Live site: [https://dynamicrsa.github.io/madrid-cricket-club](https://dynamicrsa.github.io/madrid-cricket-club)

## Features

### Public Site
- Home page with hero, season stats, upcoming fixtures, news
- Fixtures calendar (upcoming + past)
- Results with scorecards
- News and match reports (EN/ES)
- About page (history, ground, committee, Cricket España)
- Membership enquiry form
- AGM documents archive
- Privacy notice (GDPR compliant)
- iCalendar feed (`/api/calendar`)

### Member Area (Phase 2+)
- Email/password + Google OAuth (Supabase Auth)
- 2FA mandatory for admins/treasurer/super admin
- Availability setting per fixture
- Team selection (registered members only — FR-SEL-11)
- Meal options per event/day
- Accommodation booking (nights, cost preview)
- Lift sharing
- Statement of charges and payments
- Junior player profiles under guardian accounts

### Admin Area
- Membership lifecycle (enquiry → application → approval → active)
- Cricket España registration return (CSV/XLSX, password-protected)
- Disclosure log
- Team selection grid
- Payment confirmation (Treasurer role)
- Catering summary (exportable)
- Rooming list export
- Event management
- Role management (Super admin)
- Audit trail

## Phase Roadmap

| Phase | Description | Status |
|---|---|---|
| 0 | Design system + brand assets | ✅ |
| 1 | Public website | ✅ |
| 2 | Auth + member accounts | 🔧 Backend needed |
| 3 | Membership lifecycle | 🔧 Backend needed |
| 4 | Events + availability | 🔧 Backend needed |
| 5 | Team selection | 🔧 Backend needed |
| 6 | Catering | 🔧 Backend needed |
| 7 | Accommodation | 🔧 Backend needed |
| 8 | Fees + payments | 🔧 Backend needed |
| 9 | Scorecards | 🔧 Backend needed |
| 10 | Admin reports | 🔧 Backend needed |

## Open Items (from spec §11)
- OQ-01: Exact membership year dates, types and fee amounts
- OQ-02: Cricket España field set (confirm from last year's submission)
- OQ-03: Club brand assets (logo, colours, photos) — placeholders used
- OQ-04: Design direction confirmation

## Contributing

Please reference requirement IDs (e.g. `FR-SEL-03`) in commit messages for traceability.
