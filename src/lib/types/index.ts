// ─────────────────────────────────────────────────────────────────────────────
// StillBoard — Type Definitions
// Source of truth: database.md
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums / Literal Unions ───────────────────────────────────────────────────

export type CardType = 'goal' | 'task' | 'image' | 'quote' | 'video';

export type BoardTheme = 'cork' | 'linen' | 'gradient' | 'dark';

export type Priority = 'low' | 'medium' | 'high';

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly';

export type MediaType = 'image' | 'video';

export type StickerType = 'star' | 'arrow' | 'tape' | 'flower' | 'heart';

// ─── Database Row Types ───────────────────────────────────────────────────────

/** Mirrors the `users` table. Clerk user synced via webhook. */
export type User = {
  id: string;             // uuid PK
  clerk_id: string;       // Clerk's user id (sub claim)
  email: string;
  name: string | null;
  onboarding_complete: boolean;
  created_at: string;     // timestamptz as ISO string
}

/** Mirrors the `boards` table. A user's vision board. */
export type Board = {
  id: string;             // uuid PK
  user_id: string;        // FK → users.id
  title: string;
  theme: BoardTheme;
  is_default: boolean;
  is_starred: boolean;    // featured on Dashboard's boards strip
  created_at: string;
}

/** Extended board with computed card count from SQL aggregate. */
export type BoardWithCount = Board & {
  card_count: number;
}

/**
 * Mirrors the `cards` table.
 * Unified table for goal / task / image / quote / video card types.
 */
export type Card = {
  id: string;               // uuid PK
  user_id: string;          // FK → users.id
  board_id: string;         // FK → boards.id (the only grouping key)
  type: CardType;
  title: string | null;
  description: string | null;
  content: string | null;         // quote body / freeform note
  attribution: string | null;     // quote author
  color: string;                  // default '#FFF3B0'
  category: string | null;        // career | health | travel | relationships | home | etc.
  target_year: number | null;     // goals only
  due_date: string | null;        // tasks only (date as ISO string)
  priority: Priority | null;
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | null;
  is_completed: boolean;
  is_starred: boolean;
  position_x: number;             // board canvas position
  position_y: number;
  width: number;                  // default 220
  height: number;                 // default 220
  z_index: number;                // default 1
  rotation: number;               // degrees, default 0
  created_at: string;
  updated_at: string;
}

/** Card with eagerly-joined subtasks and media for detail views. */
export type CardWithRelations = Card & {
  subtasks: Subtask[];
  media: Media[];
}

/** Mirrors the `subtasks` table. Checklist inside a task card. */
export type Subtask = {
  id: string;             // uuid PK
  card_id: string;        // FK → cards.id
  title: string;
  is_completed: boolean;
  position: number;       // for ordering
}

/** Mirrors the `media` table. Image upload or YouTube video attached to a card. */
export type Media = {
  id: string;             // uuid PK
  card_id: string;        // FK → cards.id
  media_type: MediaType;
  storage_path: string | null;        // Supabase Storage path (images)
  youtube_url: string | null;         // raw pasted URL
  youtube_video_id: string | null;    // parsed 11-char id
  thumbnail_url: string | null;
  created_at: string;
}

/** Mirrors the `stickers` table. Decorative SVG stickers on the board canvas. */
export type Sticker = {
  id: string;             // uuid PK
  board_id: string;       // FK → boards.id
  sticker_type: StickerType;
  position_x: number;
  position_y: number;
  rotation: number;
  scale: number;          // default 1
  z_index: number;
}

// ─── Input Types (for create/update server actions) ───────────────────────────

export type CreateCardInput = Pick<
  Card,
  | 'board_id'
  | 'type'
  | 'title'
  | 'description'
  | 'content'
  | 'attribution'
  | 'color'
  | 'category'
  | 'target_year'
  | 'due_date'
  | 'priority'
  | 'is_recurring'
  | 'recurrence_rule'
  | 'position_x'
  | 'position_y'
  | 'width'
  | 'height'
  | 'z_index'
  | 'rotation'
>;

export type UpdateCardInput = Partial<
  Omit<Card, 'id' | 'user_id' | 'board_id' | 'created_at' | 'updated_at'>
>;

export type UpdateCardPositionInput = Pick<Card, 'position_x' | 'position_y' | 'z_index'>;

export type CreateBoardInput = Pick<Board, 'title' | 'theme'>;

export type UpdateBoardInput = Partial<Pick<Board, 'title' | 'theme' | 'is_starred' | 'is_default'>>;

export type CreateSubtaskInput = Pick<Subtask, 'card_id' | 'title' | 'position'>;

export type CreateStickerInput = Pick<
  Sticker,
  'board_id' | 'sticker_type' | 'position_x' | 'position_y' | 'rotation' | 'scale' | 'z_index'
>;

// ─── Filter / Query Types ─────────────────────────────────────────────────────

export interface GoalFilters {
  category?: string;
  is_starred?: boolean;
  is_completed?: boolean;
  target_year?: number;
}

export interface TaskFilters {
  priority?: Priority;
  is_completed?: boolean;
  is_recurring?: boolean;
  due_range?: 'today' | 'overdue' | 'upcoming';
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface GoalStats {
  completed_count: number;
  total_count: number;
  percent_complete: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface TaskWeekStats {
  completed_this_week: number;
  due_today: number;
  overdue: number;
}

// ─── Supabase Database generic type (placeholder until codegen runs) ──────────
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          name: string | null;
          onboarding_complete: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          name?: string | null;
          onboarding_complete?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      boards: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          theme: BoardTheme;
          is_default: boolean;
          is_starred: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          theme?: BoardTheme;
          is_default?: boolean;
          is_starred?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          theme?: BoardTheme;
          is_default?: boolean;
          is_starred?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      cards: {
        Row: {
          id: string;
          user_id: string;
          board_id: string;
          type: CardType;
          title: string | null;
          description: string | null;
          content: string | null;
          attribution: string | null;
          color: string;
          category: string | null;
          target_year: number | null;
          due_date: string | null;
          priority: Priority | null;
          is_recurring: boolean;
          recurrence_rule: RecurrenceRule | null;
          is_completed: boolean;
          is_starred: boolean;
          position_x: number;
          position_y: number;
          width: number;
          height: number;
          z_index: number;
          rotation: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          board_id: string;
          type: CardType;
          title?: string | null;
          description?: string | null;
          content?: string | null;
          attribution?: string | null;
          color?: string;
          category?: string | null;
          target_year?: number | null;
          due_date?: string | null;
          priority?: Priority | null;
          is_recurring?: boolean;
          recurrence_rule?: RecurrenceRule | null;
          is_completed?: boolean;
          is_starred?: boolean;
          position_x?: number;
          position_y?: number;
          width?: number;
          height?: number;
          z_index?: number;
          rotation?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          board_id?: string;
          type?: CardType;
          title?: string | null;
          description?: string | null;
          content?: string | null;
          attribution?: string | null;
          color?: string;
          category?: string | null;
          target_year?: number | null;
          due_date?: string | null;
          priority?: Priority | null;
          is_recurring?: boolean;
          recurrence_rule?: RecurrenceRule | null;
          is_completed?: boolean;
          is_starred?: boolean;
          position_x?: number;
          position_y?: number;
          width?: number;
          height?: number;
          z_index?: number;
          rotation?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subtasks: {
        Row: {
          id: string;
          card_id: string;
          title: string;
          is_completed: boolean;
          position: number;
        };
        Insert: {
          id?: string;
          card_id: string;
          title: string;
          is_completed?: boolean;
          position?: number;
        };
        Update: {
          id?: string;
          card_id?: string;
          title?: string;
          is_completed?: boolean;
          position?: number;
        };
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          card_id: string;
          media_type: MediaType;
          storage_path: string | null;
          youtube_url: string | null;
          youtube_video_id: string | null;
          thumbnail_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          media_type: MediaType;
          storage_path?: string | null;
          youtube_url?: string | null;
          youtube_video_id?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          media_type?: MediaType;
          storage_path?: string | null;
          youtube_url?: string | null;
          youtube_video_id?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      stickers: {
        Row: {
          id: string;
          board_id: string;
          sticker_type: StickerType;
          position_x: number;
          position_y: number;
          rotation: number;
          scale: number;
          z_index: number;
        };
        Insert: {
          id?: string;
          board_id: string;
          sticker_type: StickerType;
          position_x?: number;
          position_y?: number;
          rotation?: number;
          scale?: number;
          z_index?: number;
        };
        Update: {
          id?: string;
          board_id?: string;
          sticker_type?: StickerType;
          position_x?: number;
          position_y?: number;
          rotation?: number;
          scale?: number;
          z_index?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
