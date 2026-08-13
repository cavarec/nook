// Types generes a la main a partir de supabase/migrations/0001_init.sql
// A regenerer avec `supabase gen types typescript` une fois le projet lie.

export type Category =
  | "Frais"
  | "Fruits & Legumes"
  | "Surgeles"
  | "Epicerie"
  | "Boissons"
  | "Hygiene"
  | "Entretien"
  | "Bebe"
  | "Animaux"
  | "Bricolage"
  | "Maison";

export type CorrectionType =
  | "increment"
  | "decrement"
  | "finished"
  | "still_available";

export type HouseholdRole = "owner" | "member";

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["households"]["Insert"]>;
        Relationships: [];
      };
      household_members: {
        Row: {
          household_id: string;
          user_id: string;
          role: HouseholdRole;
          joined_at: string;
        };
        Insert: {
          household_id: string;
          user_id: string;
          role?: HouseholdRole;
          joined_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["household_members"]["Insert"]
        >;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          category: Category;
          brand: string | null;
          barcode: string | null;
          average_shelf_life_days: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          category?: Category;
          brand?: string | null;
          barcode?: string | null;
          average_shelf_life_days?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          household_id: string;
          store_name: string | null;
          purchase_date: string;
          file_path: string | null;
          total_amount: number | null;
          imported_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          store_name?: string | null;
          purchase_date: string;
          file_path?: string | null;
          total_amount?: number | null;
          imported_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tickets"]["Insert"]>;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          household_id: string;
          product_id: string;
          quantity: number;
          purchase_date: string;
          price: number | null;
          source_ticket_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          product_id: string;
          quantity?: number;
          purchase_date: string;
          price?: number | null;
          source_ticket_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
        Relationships: [];
      };
      estimated_stock: {
        Row: {
          id: string;
          household_id: string;
          product_id: string;
          estimated_quantity: number;
          confidence_score: number;
          last_calculation_date: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          product_id: string;
          estimated_quantity?: number;
          confidence_score?: number;
          last_calculation_date?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["estimated_stock"]["Insert"]
        >;
        Relationships: [];
      };
      stock_corrections: {
        Row: {
          id: string;
          household_id: string;
          product_id: string;
          type: CorrectionType;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          product_id: string;
          type: CorrectionType;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["stock_corrections"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
