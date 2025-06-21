export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      farmers_submissions: {
        Row: {
          ai_recommendations: string[] | null
          calculated_waste_tons: number | null
          carbon_footprint_kg_co2e: number | null
          chosen_action: string | null
          created_at: string | null
          crop_field_address: string | null
          crop_field_location_lat: number | null
          crop_field_location_lon: number | null
          crop_grown: string
          crop_yield_per_acre: number
          estimated_market_value_inr: number | null
          farmer_name: string
          harvest_date: string
          id: string
          image_url: string | null
          land_area_acres: number
          mobile_number: string
          pickup_scheduled_date: string | null
          pickup_status: string | null
          updated_at: string | null
          waste_type: string
        }
        Insert: {
          ai_recommendations?: string[] | null
          calculated_waste_tons?: number | null
          carbon_footprint_kg_co2e?: number | null
          chosen_action?: string | null
          created_at?: string | null
          crop_field_address?: string | null
          crop_field_location_lat?: number | null
          crop_field_location_lon?: number | null
          crop_grown: string
          crop_yield_per_acre: number
          estimated_market_value_inr?: number | null
          farmer_name: string
          harvest_date: string
          id?: string
          image_url?: string | null
          land_area_acres: number
          mobile_number: string
          pickup_scheduled_date?: string | null
          pickup_status?: string | null
          updated_at?: string | null
          waste_type: string
        }
        Update: {
          ai_recommendations?: string[] | null
          calculated_waste_tons?: number | null
          carbon_footprint_kg_co2e?: number | null
          chosen_action?: string | null
          created_at?: string | null
          crop_field_address?: string | null
          crop_field_location_lat?: number | null
          crop_field_location_lon?: number | null
          crop_grown?: string
          crop_yield_per_acre?: number
          estimated_market_value_inr?: number | null
          farmer_name?: string
          harvest_date?: string
          id?: string
          image_url?: string | null
          land_area_acres?: number
          mobile_number?: string
          pickup_scheduled_date?: string | null
          pickup_status?: string | null
          updated_at?: string | null
          waste_type?: string
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          created_at: string | null
          crop_residue_type: string
          id: string
          image_url: string | null
          is_available: boolean | null
          price_per_kg: number
          total_stock_kg: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crop_residue_type: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price_per_kg: number
          total_stock_kg?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crop_residue_type?: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price_per_kg?: number
          total_stock_kg?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          crop_residue_type: string
          id: string
          marketplace_product_id: string | null
          order_id: string | null
          price_per_kg_at_purchase: number
          quantity_kg: number
        }
        Insert: {
          created_at?: string | null
          crop_residue_type: string
          id?: string
          marketplace_product_id?: string | null
          order_id?: string | null
          price_per_kg_at_purchase: number
          quantity_kg: number
        }
        Update: {
          created_at?: string | null
          crop_residue_type?: string
          id?: string
          marketplace_product_id?: string | null
          order_id?: string | null
          price_per_kg_at_purchase?: number
          quantity_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_marketplace_product_id_fkey"
            columns: ["marketplace_product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_address: string
          buyer_mobile_number: string
          buyer_name: string
          company_name: string
          created_at: string | null
          estimated_esg_score: number | null
          id: string
          order_status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          buyer_address: string
          buyer_mobile_number: string
          buyer_name: string
          company_name: string
          created_at?: string | null
          estimated_esg_score?: number | null
          id?: string
          order_status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          buyer_address?: string
          buyer_mobile_number?: string
          buyer_name?: string
          company_name?: string
          created_at?: string | null
          estimated_esg_score?: number | null
          id?: string
          order_status?: string | null
          total_amount?: number
          updated_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
