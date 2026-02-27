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
      post_impressions: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          type: "like" | "dislike";
          visitor_hash: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id: string;
          type: "like" | "dislike";
          visitor_hash: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          type?: "like" | "dislike";
          visitor_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_impressions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_stats: {
        Row: {
          dislike_count: number;
          like_count: number;
          post_id: string;
          updated_at: string;
          view_count: number;
        };
        Insert: {
          dislike_count?: number;
          like_count?: number;
          post_id: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: {
          dislike_count?: number;
          like_count?: number;
          post_id?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "post_stats_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: true;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          author_name: string | null;
          category_slug: string | null;
          content_markdown: string;
          cover_image_url: string | null;
          created_at: string;
          excerpt: string | null;
          featured: boolean;
          id: string;
          published_at: string | null;
          reading_time_minutes: number;
          slug: string;
          status: "draft" | "published";
          tags: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          author_name?: string | null;
          category_slug?: string | null;
          content_markdown: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          featured?: boolean;
          id?: string;
          published_at?: string | null;
          reading_time_minutes?: number;
          slug: string;
          status?: "draft" | "published";
          tags?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          author_name?: string | null;
          category_slug?: string | null;
          content_markdown?: string;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          featured?: boolean;
          id?: string;
          published_at?: string | null;
          reading_time_minutes?: number;
          slug?: string;
          status?: "draft" | "published";
          tags?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_post_stat: {
        Args: {
          target_post_id: string;
          stat_column: "view_count" | "like_count" | "dislike_count";
          delta?: number;
        };
        Returns: {
          dislike_count: number;
          like_count: number;
          post_id: string;
          updated_at: string;
          view_count: number;
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
