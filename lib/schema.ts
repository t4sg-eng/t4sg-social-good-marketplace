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
          contact_email: string;
          created_at: string;
          created_by: string;
          description: string;
          end_date: string | null;
          id: string;
          nonprofit: string;
          nonprofit_link: string | null;
          skills: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["opportunity_status"];
          t4sg_verified: boolean;
          title: string;
        };
        Insert: {
          contact_email?: string;
          created_at?: string;
          created_by?: string;
          description: string;
          end_date?: string | null;
          id?: string;
          nonprofit: string;
          nonprofit_link?: string | null;
          skills: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["opportunity_status"];
          t4sg_verified?: boolean;
          title: string;
        };
        Update: {
          contact_email?: string;
          created_at?: string;
          created_by?: string;
          description?: string;
          end_date?: string | null;
          id?: string;
          nonprofit?: string;
          nonprofit_link?: string | null;
          skills?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["opportunity_status"];
          t4sg_verified?: boolean;
          title?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          email: string | null;
          id: string;
          requested_role: Database["public"]["Enums"]["app_role"] | null;
          role: Database["public"]["Enums"]["app_role"];
          role_approved: boolean;
          updated_at: string;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          email?: string | null;
          id: string;
          requested_role?: Database["public"]["Enums"]["app_role"] | null;
          role?: Database["public"]["Enums"]["app_role"];
          role_approved?: boolean;
          updated_at?: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          requested_role?: Database["public"]["Enums"]["app_role"] | null;
          role?: Database["public"]["Enums"]["app_role"];
          role_approved?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      signups: {
        Row: {
          created_at: string;
          decided_at: string | null;
          feedback: string | null;
          id: string;
          intro_email_sent_at: string | null;
          opportunity_id: string;
          status: Database["public"]["Enums"]["signup_status"];
          updated_at: string;
          volunteer_id: string;
        };
        Insert: {
          created_at?: string;
          decided_at?: string | null;
          feedback?: string | null;
          id?: string;
          intro_email_sent_at?: string | null;
          opportunity_id: string;
          status?: Database["public"]["Enums"]["signup_status"];
          updated_at?: string;
          volunteer_id: string;
        };
        Update: {
          created_at?: string;
          decided_at?: string | null;
          feedback?: string | null;
          id?: string;
          intro_email_sent_at?: string | null;
          opportunity_id?: string;
          status?: Database["public"]["Enums"]["signup_status"];
          updated_at?: string;
          volunteer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "signups_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "signups_volunteer_id_fkey";
            columns: ["volunteer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      approve_role: {
        Args: {
          new_role?: Database["public"]["Enums"]["app_role"];
          target_user: string;
        };
        Returns: undefined;
      };
      can_join_projects: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_approved_npo: { Args: Record<string, never>; Returns: boolean };
      is_approved_swe: { Args: Record<string, never>; Returns: boolean };
      opportunity_is_open: { Args: { opp_id: string }; Returns: boolean };
      owns_opportunity: { Args: { opp_id: string }; Returns: boolean };
      reject_role: { Args: { target_user: string }; Returns: undefined };
    };
    Enums: {
      app_role: "member" | "swe" | "npo" | "admin";
      opportunity_status: "pending" | "approved" | "rejected" | "closed";
      signup_status: "interested" | "onboarded" | "declined";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
