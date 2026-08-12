// Auto-generated Supabase database types
// Re-generate with: npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          user_id: string | null;
          full_legal_name: string;
          preferred_name: string | null;
          date_of_birth: string | null;
          nationality: string | null;
          gender: string | null;
          id_type: string | null;
          id_number: string | null;
          email: string;
          mobile: string | null;
          address: string | null;
          emergency_name: string | null;
          emergency_relationship: string | null;
          emergency_phone: string | null;
          medical_info: string | null;
          dietary_requirements: string | null;
          allergies: string | null;
          playing_role: string | null;
          previous_clubs: string | null;
          kit_size: string | null;
          photo_consent: boolean;
          rules_accepted: boolean;
          status: string;
          roles: string[];
          is_minor: boolean;
          guardian_id: string | null;
          registration_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["members"]["Row"]> & {
          full_legal_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Row"]>;
      };
      membership_records: {
        Row: {
          id: string;
          member_id: string;
          year_id: string;
          category_id: string;
          fee_euros: number;
          payment_reference: string | null;
          status: string;
          payment_amount: number;
          payment_confirmed_at: string | null;
          payment_confirmed_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["membership_records"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["membership_records"]["Row"]>;
      };
      events: {
        Row: {
          id: string;
          type: string;
          title: string;
          opponent: string | null;
          competition: string | null;
          date: string;
          end_date: string | null;
          start_time: string | null;
          meet_time: string | null;
          venue_id: string | null;
          is_home: boolean;
          format: string | null;
          squad_size: number;
          availability_deadline: string | null;
          late_changes_blocked: boolean;
          team: string;
          notes: string | null;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
      };
      availability: {
        Row: {
          id: string;
          event_id: string;
          member_id: string;
          status: string;
          note: string | null;
          lift_status: string | null;
          lift_seats: number | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["availability"]["Row"]> & {
          event_id: string;
          member_id: string;
          status: string;
        };
        Update: Partial<Database["public"]["Tables"]["availability"]["Row"]>;
      };
      charges: {
        Row: {
          id: string;
          event_id: string | null;
          member_id: string;
          type: string;
          amount_euros: number;
          description: string | null;
          status: string;
          raised_at: string;
          settled_at: string | null;
          raised_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["charges"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["charges"]["Row"]>;
      };
      payment_declarations: {
        Row: {
          id: string;
          charge_id: string;
          member_id: string;
          amount_euros: number;
          method: string;
          declared_at: string;
          reference: string | null;
          note: string | null;
          confirmed_by: string | null;
          confirmed_at: string | null;
          status: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payment_declarations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["payment_declarations"]["Row"]>;
      };
      fixture_results: {
        Row: {
          id: string;
          event_id: string;
          our_score: string | null;
          opposition_score: string | null;
          overs: string | null;
          result: string | null;
          margin: string | null;
          summary: string | null;
          cricclubs_link: string | null;
          umpires: string | null;
          scorers: string | null;
          published: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["fixture_results"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["fixture_results"]["Row"]>;
      };
      news_articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string | null;
          hero_image_url: string | null;
          author_id: string | null;
          published_at: string | null;
          is_published: boolean;
          tags: string[];
          related_fixture_id: string | null;
          is_match_report: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["news_articles"]["Row"]> & {
          slug: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["news_articles"]["Row"]>;
      };
      agm_documents: {
        Row: {
          id: string;
          year: number;
          title: string;
          document_url: string;
          type: string | null;
          is_public: boolean;
          uploaded_at: string;
          uploaded_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["agm_documents"]["Row"]> & {
          year: number;
          title: string;
          document_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["agm_documents"]["Row"]>;
      };
      audit_trail: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          old_value: Json | null;
          new_value: Json | null;
          note: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_trail"]["Row"]> & {
          action: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_trail"]["Row"]>;
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: { key: string; value: Json };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
