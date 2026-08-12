/**
 * eventHelpers.ts
 *
 * All tour/game structured data is stored as a JSON blob in `events.notes`
 * (the existing free-text field on the events table). This avoids a DB migration
 * while keeping the full type-safe model accessible in the application.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EventStage =
  | "draft"         // Captain building — not visible anywhere publicly
  | "published"     // Visible on public Fixtures page — registration NOT yet open
  | "squad_open"    // Registration open — members mark availability
  | "squad_locked"  // Squad confirmed & published — selected players notified
  | "choices_open"  // Meal & travel choices open for selected players
  | "completed"     // Match played
  | "cancelled";    // Cancelled

export interface TourGame {
  game_number: number;
  date: string;
  venue_name: string;
  venue_address?: string;
  meet_time: string;
  start_time: string;
  opponent: string;          // e.g. "Barcelona CC", "Costa Blanca CC"
  format: string;
  is_streamed_ecn: boolean;
  catering_options: string[];
  squad_xi: string[];
  designations: Record<string, "C" | "VC" | "WK" | "12th" | "">;
}

export interface PlayerGameChoice {
  meal: string;
  travel: string;
  confirmed: boolean;
}

export interface PlayerResponse {
  confirmed: boolean;
  declined: boolean;
  games: Record<number, PlayerGameChoice>;
}

export interface TourMeta {
  stage: EventStage;
  tour_games: TourGame[];
  squad_pool: string[];
  player_responses: Record<string, PlayerResponse>;
  sign_up_deadline?: string;
  notes_plain?: string;
}

// ─── Serialisation helpers ──────────────────────────────────────────────────────

const TOUR_MARKER = "TOUR_META_V1:";

export function parseTourMeta(notesField: string | null | undefined): TourMeta {
  if (!notesField) return defaultTourMeta();
  try {
    const idx = notesField.indexOf(TOUR_MARKER);
    if (idx === -1) return defaultTourMeta();
    const json = notesField.slice(idx + TOUR_MARKER.length);
    const parsed = JSON.parse(json);
    return { ...defaultTourMeta(), ...parsed };
  } catch {
    return defaultTourMeta();
  }
}

export function serializeTourMeta(meta: TourMeta, existingNotes?: string | null): string {
  const existing = existingNotes || "";
  const idx = existing.indexOf(TOUR_MARKER);
  const prefix = idx === -1 ? existing : existing.slice(0, idx).trimEnd();
  const json = JSON.stringify(meta);
  return prefix ? `${prefix}\n${TOUR_MARKER}${json}` : `${TOUR_MARKER}${json}`;
}

function defaultTourMeta(): TourMeta {
  return {
    stage: "draft",
    tour_games: [],
    squad_pool: [],
    player_responses: {},
  };
}

// ─── Stage helpers ──────────────────────────────────────────────────────────────

export const STAGE_LABELS: Record<EventStage, string> = {
  draft: "Draft",
  published: "Published (fixture live, registration closed)",
  squad_open: "Registration Open",
  squad_locked: "Squad Published",
  choices_open: "Choices Open",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STAGE_NEXT: Partial<Record<EventStage, EventStage>> = {
  draft: "published",
  published: "squad_open",
  squad_open: "squad_locked",
  squad_locked: "choices_open",
  choices_open: "completed",
};

export const STAGE_NEXT_LABEL: Partial<Record<EventStage, string>> = {
  draft: "Publish Fixture (goes live on Fixtures page)",
  published: "Open Registration (members can sign up)",
  squad_open: "Publish Squad & Notify Players",
  squad_locked: "Open Meal & Travel Choices",
  choices_open: "Mark as Completed",
};

export function stageColor(stage: EventStage): string {
  switch (stage) {
    case "draft": return "badge-slate";
    case "published": return "badge-blue";
    case "squad_open": return "badge-gold";
    case "squad_locked": return "badge-green";
    case "choices_open": return "badge-green";
    case "completed": return "badge-slate";
    case "cancelled": return "badge-red";
    default: return "badge-slate";
  }
}

export function defaultGame(gameNumber: number, tourDate?: string): TourGame {
  return {
    game_number: gameNumber,
    date: tourDate || new Date().toISOString().split("T")[0],
    opponent: "",
    venue_name: "",
    venue_address: "",
    meet_time: "07:30",
    start_time: "08:30",
    format: "T20",
    is_streamed_ecn: false,
    catering_options: ["Beef Burger & Chips", "Chicken Burger", "Vegetarian Paella", "Halal Wrap"],
    squad_xi: [],
    designations: {},
  };
}
