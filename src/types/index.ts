// ─── Roles ──────────────────────────────────────────────────────────────────
export type UserRole = "member" | "captain" | "treasurer" | "admin" | "super_admin";

// ─── Membership ──────────────────────────────────────────────────────────────
export type MembershipStatus =
  | "enquiry"
  | "application_in_progress"
  | "submitted"
  | "approved_awaiting_payment"
  | "active"
  | "expiring_soon"
  | "expired"
  | "lapsed"
  | "rejected"
  | "withdrawn"
  | "suspended";

export type MembershipDuration = "full_year" | "half_year";
export type MemberType = "senior" | "junior";

export interface MembershipCategory {
  id: string;
  name: string;
  duration: MembershipDuration;
  member_type: MemberType;
  fee_euros: number;
  description?: string;
  active: boolean;
}

export interface MemberProfile {
  id: string;
  user_id: string;
  // Personal
  full_legal_name: string;
  preferred_name: string;
  date_of_birth: string;
  nationality: string;
  gender: string;
  id_type: "dni" | "nie" | "passport" | "other";
  id_number: string;
  // Contact
  email: string;
  mobile: string;
  address: string;
  // Emergency contact
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  // Medical
  medical_info?: string;
  dietary_requirements?: string;
  allergies?: string;
  // Playing
  playing_role: "batter" | "bowler" | "all_rounder" | "wicketkeeper";
  previous_clubs?: string;
  kit_size?: string;
  // Consent
  photo_consent: boolean;
  rules_accepted: boolean;
  // Status
  status: MembershipStatus;
  registration_status: "not_submitted" | "submitted" | "confirmed";
  roles: UserRole[];
  is_minor: boolean;
  // Guardian (if minor)
  guardian_id?: string;
}

export interface JuniorProfile {
  id: string;
  guardian_member_id: string;
  full_name: string;
  date_of_birth: string;
  playing_role: string;
  dietary_requirements?: string;
  allergies?: string;
  registration_status: "not_submitted" | "submitted" | "confirmed";
}

// ─── Events ──────────────────────────────────────────────────────────────────
export type EventType = "match" | "nets" | "social" | "agm_meeting";
export type MatchFormat = "t20" | "40_over" | "50_over" | "friendly" | "other";
export type AvailabilityStatus = "available" | "not_available" | "maybe" | "no_response";

export interface Venue {
  id: string;
  name: string;
  address: string;
  map_link?: string;
  notes?: string;
  is_home: boolean;
}

export interface ClubEvent {
  id: string;
  type: EventType;
  title: string;
  opponent?: string;
  competition?: string;
  date: string;
  end_date?: string;
  start_time?: string;
  meet_time?: string;
  venue_id?: string;
  venue?: Venue;
  is_home: boolean;
  format?: MatchFormat;
  squad_size: number;
  availability_deadline?: string;
  late_changes_blocked: boolean;
  team: "seniors" | "juniors";
  notes?: string;
  status: "scheduled" | "cancelled" | "postponed" | "completed";
  // Result (once completed)
  result?: FixtureResult;
  scorecard?: Scorecard;
}

export interface Availability {
  id: string;
  event_id: string;
  member_id: string;
  member_name: string;
  status: AvailabilityStatus;
  note?: string;
  lift_status?: "can_drive" | "needs_seat" | "own_way" | null;
  lift_seats?: number;
  updated_at: string;
}

// ─── Selection ───────────────────────────────────────────────────────────────
export interface TeamSelection {
  id: string;
  event_id: string;
  status: "draft" | "published";
  captain_id: string;
  selected_players: SelectedPlayer[];
  reserves: SelectedPlayer[];
}

export interface SelectedPlayer {
  member_id: string;
  member_name: string;
  batting_position?: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  is_wicketkeeper: boolean;
}

// ─── Meals ───────────────────────────────────────────────────────────────────
export interface MealOption {
  id: string;
  event_id: string;
  day: string;
  sitting: string; // "Lunch" | "Tea"
  name: string;
  description?: string;
  price_euros?: number;
  capacity?: number;
}

export interface MealSelection {
  id: string;
  meal_option_id: string;
  member_id: string;
  dietary_notes?: string;
}

// ─── Accommodation ───────────────────────────────────────────────────────────
export type AccCostBasis = "per_person_per_night" | "per_room_per_night" | "flat_per_person";

export interface AccommodationOption {
  id: string;
  event_id: string;
  property_name: string;
  address: string;
  map_link?: string;
  contact_details?: string;
  booking_reference?: string;
  notes?: string;
  check_in: string;
  check_out: string;
  cost_basis: AccCostBasis;
  rate_euros: number;
  nightly_rates?: Record<string, number>;
  capacity?: number;
  booking_deadline: string;
}

export interface AccommodationBooking {
  id: string;
  option_id: string;
  member_id: string;
  nights: string[];
  accommodation_status: "staying" | "own_arrangement" | "not_staying";
  own_arrangement_notes?: string;
  guest_count: number;
  guest_names?: string;
  room_sharing_pref?: string;
  total_cost_euros: number;
}

// ─── Fees & Payments ─────────────────────────────────────────────────────────
export type ChargeType = "match_fee" | "tea_meal" | "accommodation" | "travel" | "fine" | "other" | "membership";
export type ChargeStatus = "raised" | "declared_paid" | "confirmed" | "settled" | "partially_paid" | "waived" | "disputed" | "cancelled";
export type PaymentMethod = "cash" | "bank_transfer" | "bizum" | "other";

export interface Charge {
  id: string;
  event_id?: string;
  member_id: string;
  type: ChargeType;
  amount_euros: number;
  description?: string;
  status: ChargeStatus;
  raised_at: string;
  settled_at?: string;
}

export interface PaymentDeclaration {
  id: string;
  charge_id: string;
  member_id: string;
  amount_euros: number;
  method: PaymentMethod;
  declared_at: string;
  reference?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  status: "pending" | "confirmed" | "rejected" | "disputed";
}

// ─── Results & Scorecards ────────────────────────────────────────────────────
export type MatchResult = "won" | "lost" | "draw" | "tied" | "abandoned" | "no_result";

export interface FixtureResult {
  id: string;
  event_id: string;
  our_score: string;
  opposition_score: string;
  overs?: string;
  result: MatchResult;
  margin?: string;
  summary?: string;
  cricclubs_link?: string;
  umpires?: string;
  scorers?: string;
}

export interface Scorecard {
  id: string;
  event_id: string;
  images: ScorecardImage[];
  structured?: StructuredScorecard;
  cricclubs_link?: string;
}

export interface ScorecardImage {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface StructuredScorecard {
  innings: Innings[];
}

export interface Innings {
  team_name: string;
  total_runs: number;
  total_wickets: number;
  total_overs: string;
  extras: { wides: number; no_balls: number; byes: number; leg_byes: number; penalty: number; total: number };
  batting: BatterRecord[];
  bowling: BowlerRecord[];
  fall_of_wickets: { wicket: number; score: number; overs: string }[];
}

export interface BatterRecord {
  name: string;
  how_out?: string;
  bowler?: string;
  fielder?: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  did_not_bat?: boolean;
}

export interface BowlerRecord {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  wides: number;
  no_balls: number;
}

// ─── News ─────────────────────────────────────────────────────────────────────
export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  hero_image_url?: string;
  author_name: string;
  published_at: string;
  tags: string[];
  related_fixture_id?: string;
  is_match_report: boolean;
}

// ─── AGM ─────────────────────────────────────────────────────────────────────
export interface AGMDocument {
  id: string;
  year: number;
  title: string;
  document_url: string;
  type: "minutes" | "accounts" | "agenda" | "other";
  is_public: boolean;
  uploaded_at: string;
}

// ─── Registration Return ─────────────────────────────────────────────────────
export interface RegistrationReturn {
  id: string;
  sent_at: string;
  sent_by: string;
  recipient_email: string;
  member_count: number;
  is_supplementary: boolean;
  file_hash: string;
}
