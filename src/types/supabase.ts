export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      accommodation: {
        Row: {
          address: string | null
          check_in: string | null
          check_out: string | null
          cost_per_night: number | null
          created_at: string | null
          event_id: string | null
          id: string
          name: string | null
          notes: string | null
        }
        Insert: {
          address?: string | null
          check_in?: string | null
          check_out?: string | null
          cost_per_night?: number | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          name?: string | null
          notes?: string | null
        }
        Update: {
          address?: string | null
          check_in?: string | null
          check_out?: string | null
          cost_per_night?: number | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          name?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_bookings: {
        Row: {
          accommodation_id: string | null
          created_at: string | null
          id: string
          member_id: string | null
          nights: number | null
          paid: boolean | null
        }
        Insert: {
          accommodation_id?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          nights?: number | null
          paid?: boolean | null
        }
        Update: {
          accommodation_id?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          nights?: number | null
          paid?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_bookings_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agm_documents: {
        Row: {
          document_url: string | null
          id: string
          is_public: boolean | null
          title: string
          type: string | null
          uploaded_at: string | null
          year: number
        }
        Insert: {
          document_url?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          type?: string | null
          uploaded_at?: string | null
          year: number
        }
        Update: {
          document_url?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          type?: string | null
          uploaded_at?: string | null
          year?: number
        }
        Relationships: []
      }
      availability: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          member_id: string | null
          note: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["availability_status"] | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          member_id?: string | null
          note?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["availability_status"] | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          member_id?: string | null
          note?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["availability_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      charges: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          event_id: string | null
          id: string
          member_id: string | null
          paid_date: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          type: Database["public"]["Enums"]["charge_type"]
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          member_id?: string | null
          paid_date?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          type: Database["public"]["Enums"]["charge_type"]
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          member_id?: string | null
          paid_date?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          type?: Database["public"]["Enums"]["charge_type"]
        }
        Relationships: [
          {
            foreignKeyName: "charges_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          availability_deadline: string | null
          competition: string | null
          created_at: string | null
          created_by: string | null
          date: string
          end_time: string | null
          format: Database["public"]["Enums"]["match_format"] | null
          id: string
          is_home: boolean | null
          is_livestreamed: boolean | null
          livestream_url: string | null
          meet_time: string | null
          notes: string | null
          opponent: string | null
          squad_size: number | null
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          team: string | null
          title: string
          type: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          availability_deadline?: string | null
          competition?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          end_time?: string | null
          format?: Database["public"]["Enums"]["match_format"] | null
          id?: string
          is_home?: boolean | null
          is_livestreamed?: boolean | null
          livestream_url?: string | null
          meet_time?: string | null
          notes?: string | null
          opponent?: string | null
          squad_size?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          team?: string | null
          title: string
          type: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          availability_deadline?: string | null
          competition?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          end_time?: string | null
          format?: Database["public"]["Enums"]["match_format"] | null
          id?: string
          is_home?: boolean | null
          is_livestreamed?: boolean | null
          livestream_url?: string | null
          meet_time?: string | null
          notes?: string | null
          opponent?: string | null
          squad_size?: number | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          team?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_name: string | null
          content: string | null
          created_at: string | null
          event_id: string | null
          excerpt: string | null
          hero_image_url: string | null
          id: string
          is_match_report: boolean | null
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          event_id?: string | null
          excerpt?: string | null
          hero_image_url?: string | null
          id?: string
          is_match_report?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          event_id?: string | null
          excerpt?: string | null
          hero_image_url?: string | null
          id?: string
          is_match_report?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          joined_date: string | null
          member_role: Database["public"]["Enums"]["member_role"] | null
          membership_type: Database["public"]["Enums"]["membership_type"] | null
          nationality: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          joined_date?: string | null
          member_role?: Database["public"]["Enums"]["member_role"] | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          nationality?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          joined_date?: string | null
          member_role?: Database["public"]["Enums"]["member_role"] | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          nationality?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      results: {
        Row: {
          created_at: string | null
          cricclubs_link: string | null
          event_id: string | null
          id: string
          margin: string | null
          opposition_score: string | null
          our_score: string | null
          overs: string | null
          result: string | null
          summary: string | null
        }
        Insert: {
          created_at?: string | null
          cricclubs_link?: string | null
          event_id?: string | null
          id?: string
          margin?: string | null
          opposition_score?: string | null
          our_score?: string | null
          overs?: string | null
          result?: string | null
          summary?: string | null
        }
        Update: {
          created_at?: string | null
          cricclubs_link?: string | null
          event_id?: string | null
          id?: string
          margin?: string | null
          opposition_score?: string | null
          our_score?: string | null
          overs?: string | null
          result?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "results_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          id: string
          is_home: boolean | null
          map_link: string | null
          name: string
          notes: string | null
          short_name: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          is_home?: boolean | null
          map_link?: string | null
          name: string
          notes?: string | null
          short_name?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          is_home?: boolean | null
          map_link?: string | null
          name?: string
          notes?: string | null
          short_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      availability_status:
        | "available"
        | "not_available"
        | "maybe"
        | "no_response"
      charge_type:
        | "membership"
        | "match_fee"
        | "tour"
        | "equipment"
        | "fine"
        | "other"
      event_status: "scheduled" | "completed" | "cancelled" | "postponed"
      match_format: "t10" | "t20" | "40_over" | "50_over" | "friendly" | "other"
      member_role:
        | "president"
        | "vice_president"
        | "treasurer"
        | "secretary"
        | "captain_40"
        | "captain_t20"
        | "captain_junior"
        | "captain_womens"
        | "committee"
        | "member"
      membership_type:
        | "senior_full"
        | "senior_half"
        | "junior_full"
        | "junior_half"
        | "social"
        | "honorary"
      payment_status: "unpaid" | "paid" | "waived" | "overdue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_status: [
        "available",
        "not_available",
        "maybe",
        "no_response",
      ],
      charge_type: [
        "membership",
        "match_fee",
        "tour",
        "equipment",
        "fine",
        "other",
      ],
      event_status: ["scheduled", "completed", "cancelled", "postponed"],
      match_format: ["t10", "t20", "40_over", "50_over", "friendly", "other"],
      member_role: [
        "president",
        "vice_president",
        "treasurer",
        "secretary",
        "captain_40",
        "captain_t20",
        "captain_junior",
        "captain_womens",
        "committee",
        "member",
      ],
      membership_type: [
        "senior_full",
        "senior_half",
        "junior_full",
        "junior_half",
        "social",
        "honorary",
      ],
      payment_status: ["unpaid", "paid", "waived", "overdue"],
    },
  },
} as const
