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
      opportunities: {
        Row: {
          id: string;
          title: string;
          nonprofit: string;
          description: string;
          skills: string;
          contact_email: string;
          t4sg_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          nonprofit: string;
          description: string;
          skills: string;
          contact_email: string;
          t4sg_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          nonprofit?: string;
          description?: string;
          skills?: string;
          contact_email?: string;
          t4sg_verified?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
