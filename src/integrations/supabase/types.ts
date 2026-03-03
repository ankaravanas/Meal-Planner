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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_prompt_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          system_prompt: string
          updated_at: string
          version: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          system_prompt: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          system_prompt?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          ai_model: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          ai_model?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          ai_model?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_body_measurements: {
        Row: {
          client_id: string
          created_at: string
          height_cm: number | null
          id: string
          measured_at: string
          notes: string | null
          weight_kg: number | null
        }
        Insert: {
          client_id: string
          created_at?: string
          height_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          weight_kg?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string
          height_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_body_measurements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_meal_plan_history: {
        Row: {
          client_id: string | null
          created_at: string
          feedback: string | null
          id: string
          meal_plan_id: string | null
          progress_notes: string | null
          updated_at: string
          what_didnt_work: string | null
          what_worked: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          meal_plan_id?: string | null
          progress_notes?: string | null
          updated_at?: string
          what_didnt_work?: string | null
          what_worked?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          meal_plan_id?: string | null
          progress_notes?: string | null
          updated_at?: string
          what_didnt_work?: string | null
          what_worked?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_meal_plan_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_meal_plan_history_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      client_history_notes: {
        Row: {
          id: string
          client_id: string
          note_date: string
          category: string | null
          content: string
          source: string | null
          original_filename: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          note_date: string
          category?: string | null
          content: string
          source?: string | null
          original_filename?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          note_date?: string
          category?: string | null
          content?: string
          source?: string | null
          original_filename?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_history_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          dietary_restrictions: string[] | null
          email: string | null
          food_preferences: string | null
          goals: string | null
          id: string
          medical_conditions: string | null
          name: string
          notes: string | null
          phone: string | null
          special_instructions: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dietary_restrictions?: string[] | null
          email?: string | null
          food_preferences?: string | null
          goals?: string | null
          id?: string
          medical_conditions?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          special_instructions?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dietary_restrictions?: string[] | null
          email?: string | null
          food_preferences?: string | null
          goals?: string | null
          id?: string
          medical_conditions?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          special_instructions?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      flexible_plan_options: {
        Row: {
          calories: number | null
          carbs_grams: number | null
          category_id: string | null
          created_at: string
          display_order: number | null
          fats_grams: number | null
          id: string
          meal_plan_id: string | null
          option_text: string
          protein_grams: number | null
        }
        Insert: {
          calories?: number | null
          carbs_grams?: number | null
          category_id?: string | null
          created_at?: string
          display_order?: number | null
          fats_grams?: number | null
          id?: string
          meal_plan_id?: string | null
          option_text: string
          protein_grams?: number | null
        }
        Update: {
          calories?: number | null
          carbs_grams?: number | null
          category_id?: string | null
          created_at?: string
          display_order?: number | null
          fats_grams?: number | null
          id?: string
          meal_plan_id?: string | null
          option_text?: string
          protein_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flexible_plan_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "meal_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flexible_plan_options_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_categories: {
        Row: {
          created_at: string
          display_name_greek: string | null
          display_order: number | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          display_name_greek?: string | null
          display_order?: number | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          display_name_greek?: string | null
          display_order?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      meal_options: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          details: string | null
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description: string
          details?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          details?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "meal_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          ai_generated: boolean | null
          ai_prompt_used: string | null
          client_id: string | null
          created_at: string
          generation_metadata: Json | null
          id: string
          notes: string | null
          nutritional_targets: Json | null
          previous_plan_id: string | null
          prompt_context: Json | null
          share_token: string
          start_date: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_prompt_used?: string | null
          client_id?: string | null
          created_at?: string
          generation_metadata?: Json | null
          id?: string
          notes?: string | null
          nutritional_targets?: Json | null
          previous_plan_id?: string | null
          prompt_context?: Json | null
          share_token?: string
          start_date?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_prompt_used?: string | null
          client_id?: string | null
          created_at?: string
          generation_metadata?: Json | null
          id?: string
          notes?: string | null
          nutritional_targets?: Json | null
          previous_plan_id?: string | null
          prompt_context?: Json | null
          share_token?: string
          start_date?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_previous_plan_id_fkey"
            columns: ["previous_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_instructions: {
        Row: {
          content: string | null
          display_order: number | null
          id: string
          instruction_type: string
          meal_plan_id: string | null
        }
        Insert: {
          content?: string | null
          display_order?: number | null
          id?: string
          instruction_type: string
          meal_plan_id?: string | null
        }
        Update: {
          content?: string | null
          display_order?: number | null
          id?: string
          instruction_type?: string
          meal_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_instructions_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      structured_plan_meals: {
        Row: {
          category_id: string | null
          day_number: number
          id: string
          meal_description: string
          meal_plan_id: string | null
          notes: string | null
        }
        Insert: {
          category_id?: string | null
          day_number: number
          id?: string
          meal_description: string
          meal_plan_id?: string | null
          notes?: string | null
        }
        Update: {
          category_id?: string | null
          day_number?: number
          id?: string
          meal_description?: string
          meal_plan_id?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "structured_plan_meals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "meal_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "structured_plan_meals_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
