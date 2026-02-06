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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          amount_paid: number
          booking_date: string
          booking_status: string | null
          created_at: string
          id: string
          id_card_url: string | null
          organizer_id: string
          participant_email: string | null
          participant_name: string | null
          participant_phone: string | null
          participants_count: number | null
          payment_status: string | null
          special_requirements: string | null
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          booking_date?: string
          booking_status?: string | null
          created_at?: string
          id?: string
          id_card_url?: string | null
          organizer_id: string
          participant_email?: string | null
          participant_name?: string | null
          participant_phone?: string | null
          participants_count?: number | null
          payment_status?: string | null
          special_requirements?: string | null
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          booking_date?: string
          booking_status?: string | null
          created_at?: string
          id?: string
          id_card_url?: string | null
          organizer_id?: string
          participant_email?: string | null
          participant_name?: string | null
          participant_phone?: string | null
          participants_count?: number | null
          payment_status?: string | null
          special_requirements?: string | null
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      educational_trip_requests: {
        Row: {
          assigned_organizer_id: string | null
          created_at: string
          email: string
          id: string
          institution_name: string
          institution_type: string
          location: string
          phone: string
          preferred_dates: string | null
          preferred_destinations: string | null
          requester_name: string
          special_requirements: string | null
          status: string | null
          student_count: number | null
        }
        Insert: {
          assigned_organizer_id?: string | null
          created_at?: string
          email: string
          id?: string
          institution_name: string
          institution_type: string
          location: string
          phone: string
          preferred_dates?: string | null
          preferred_destinations?: string | null
          requester_name: string
          special_requirements?: string | null
          status?: string | null
          student_count?: number | null
        }
        Update: {
          assigned_organizer_id?: string | null
          created_at?: string
          email?: string
          id?: string
          institution_name?: string
          institution_type?: string
          location?: string
          phone?: string
          preferred_dates?: string | null
          preferred_destinations?: string | null
          requester_name?: string
          special_requirements?: string | null
          status?: string | null
          student_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "educational_trip_requests_assigned_organizer_id_fkey"
            columns: ["assigned_organizer_id"]
            isOneToOne: false
            referencedRelation: "organizer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizer_profiles: {
        Row: {
          address_proof_url: string | null
          bank_details: string | null
          certificate_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          id_document_url: string | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          organization_name: string
          organizer_name: string
          phone: string | null
          total_earnings: number | null
          updated_at: string
          user_id: string
          verification_status: string | null
          website: string | null
        }
        Insert: {
          address_proof_url?: string | null
          bank_details?: string | null
          certificate_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          id_document_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          organization_name: string
          organizer_name: string
          phone?: string | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          website?: string | null
        }
        Update: {
          address_proof_url?: string | null
          bank_details?: string | null
          certificate_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          id_document_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          organization_name?: string
          organizer_name?: string
          phone?: string | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          booking_id: string | null
          converted_at: string | null
          created_at: string | null
          discount_amount: number | null
          id: string
          referral_type: string
          referred_user_id: string | null
          referrer_id: string
          status: string | null
          trip_id: string | null
        }
        Insert: {
          booking_id?: string | null
          converted_at?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          referral_type: string
          referred_user_id?: string | null
          referrer_id: string
          status?: string | null
          trip_id?: string | null
        }
        Update: {
          booking_id?: string | null
          converted_at?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          referral_type?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: string | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          approval_status: string | null
          category: string
          couple_discount_enabled: boolean | null
          couple_discount_percent: number | null
          created_at: string
          current_participants: number | null
          description: string | null
          destination: string
          difficulty_level: string | null
          duration_days: number
          early_bird_deadline: string | null
          early_bird_price: number | null
          education_type: string | null
          end_date: string | null
          exclusions: string[] | null
          id: string
          image_url: string | null
          inclusions: string[] | null
          is_active: boolean | null
          is_educational: boolean | null
          is_featured: boolean | null
          itinerary: Json | null
          itinerary_pdf_url: string | null
          max_participants: number | null
          meeting_point: string | null
          organizer_id: string
          original_price: number | null
          prebooking_amount: number | null
          price: number
          rating: number | null
          referral_discount_amount: number | null
          referral_discount_percent: number | null
          referral_enabled: boolean | null
          referral_min_purchases: number | null
          review_count: number | null
          start_date: string | null
          title: string
          trip_type: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          category: string
          couple_discount_enabled?: boolean | null
          couple_discount_percent?: number | null
          created_at?: string
          current_participants?: number | null
          description?: string | null
          destination: string
          difficulty_level?: string | null
          duration_days?: number
          early_bird_deadline?: string | null
          early_bird_price?: number | null
          education_type?: string | null
          end_date?: string | null
          exclusions?: string[] | null
          id?: string
          image_url?: string | null
          inclusions?: string[] | null
          is_active?: boolean | null
          is_educational?: boolean | null
          is_featured?: boolean | null
          itinerary?: Json | null
          itinerary_pdf_url?: string | null
          max_participants?: number | null
          meeting_point?: string | null
          organizer_id: string
          original_price?: number | null
          prebooking_amount?: number | null
          price: number
          rating?: number | null
          referral_discount_amount?: number | null
          referral_discount_percent?: number | null
          referral_enabled?: boolean | null
          referral_min_purchases?: number | null
          review_count?: number | null
          start_date?: string | null
          title: string
          trip_type?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          category?: string
          couple_discount_enabled?: boolean | null
          couple_discount_percent?: number | null
          created_at?: string
          current_participants?: number | null
          description?: string | null
          destination?: string
          difficulty_level?: string | null
          duration_days?: number
          early_bird_deadline?: string | null
          early_bird_price?: number | null
          education_type?: string | null
          end_date?: string | null
          exclusions?: string[] | null
          id?: string
          image_url?: string | null
          inclusions?: string[] | null
          is_active?: boolean | null
          is_educational?: boolean | null
          is_featured?: boolean | null
          itinerary?: Json | null
          itinerary_pdf_url?: string | null
          max_participants?: number | null
          meeting_point?: string | null
          organizer_id?: string
          original_price?: number | null
          prebooking_amount?: number | null
          price?: number
          rating?: number | null
          referral_discount_amount?: number | null
          referral_discount_percent?: number | null
          referral_enabled?: boolean | null
          referral_min_purchases?: number | null
          review_count?: number | null
          start_date?: string | null
          title?: string
          trip_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          currency: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          marketing_emails: boolean | null
          sms_notifications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          marketing_emails?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: { user_id: string }; Returns: string }
      grant_admin_by_email: {
        Args: { admin_email: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "organizer"
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
      app_role: ["admin", "user", "organizer"],
    },
  },
} as const
