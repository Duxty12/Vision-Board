-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0001_init.sql
-- Full DDL for StillBoard database schema.
-- Source of truth: database.md § 3
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─── users ───────────────────────────────────────────────────────────────────
-- Mirrors Clerk user; synced via webhook on user.created event.
create table users (
  id                   uuid primary key default gen_random_uuid(),
  clerk_id             text unique not null,
  email                text not null,
  name                 text,
  onboarding_complete  boolean default false,
  created_at           timestamptz default now()
);

-- ─── boards ──────────────────────────────────────────────────────────────────
-- A user can have one default board (or multiple in v2).
create table boards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  title       text not null default 'My Vision Board',
  theme       text default 'cork',   -- cork | linen | gradient | dark
  is_default  boolean default true,
  created_at  timestamptz default now()
);

-- ─── collections ─────────────────────────────────────────────────────────────
-- Theme groupings, e.g. "2026 Goals", "Home Decor"
create table collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  name        text not null,
  color       text default '#F5E6CC',
  created_at  timestamptz default now()
);

-- ─── cards ───────────────────────────────────────────────────────────────────
-- Unified table for all card types: goal | task | image | quote | video
create table cards (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users(id) on delete cascade,
  board_id        uuid references boards(id) on delete cascade,
  collection_id   uuid references collections(id) on delete set null,
  type            text not null check (type in ('goal','task','image','quote','video')),
  title           text,
  description     text,
  content         text,              -- quote text or freeform note body
  attribution     text,              -- for quote cards
  color           text default '#FFF3B0',
  category        text,              -- career, health, travel, relationships, home, etc.
  target_year     int,               -- for goals, e.g. 2026
  due_date        date,              -- for tasks
  priority        text check (priority in ('low','medium','high')),
  is_recurring    boolean default false,
  recurrence_rule text,              -- 'daily' | 'weekly' | 'monthly'
  is_completed    boolean default false,
  is_starred      boolean default false,
  position_x      float default 0,
  position_y      float default 0,
  width           float default 220,
  height          float default 220,
  z_index         int default 1,
  rotation        float default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── subtasks ────────────────────────────────────────────────────────────────
-- Checklist items inside a task card.
create table subtasks (
  id            uuid primary key default gen_random_uuid(),
  card_id       uuid references cards(id) on delete cascade,
  title         text not null,
  is_completed  boolean default false,
  position      int default 0        -- for manual ordering
);

-- ─── media ───────────────────────────────────────────────────────────────────
-- Image upload (Supabase Storage) or YouTube video attached to a card.
create table media (
  id                uuid primary key default gen_random_uuid(),
  card_id           uuid references cards(id) on delete cascade,
  media_type        text not null check (media_type in ('image','video')),
  storage_path      text,            -- Supabase Storage path, for images
  youtube_url       text,            -- raw pasted URL
  youtube_video_id  text,            -- parsed 11-char video id
  thumbnail_url     text,
  created_at        timestamptz default now()
);

-- ─── stickers ────────────────────────────────────────────────────────────────
-- Decorative SVG stickers placed directly on a board canvas.
create table stickers (
  id            uuid primary key default gen_random_uuid(),
  board_id      uuid references boards(id) on delete cascade,
  sticker_type  text not null,       -- 'star'|'arrow'|'tape'|'flower'|'heart'
  position_x    float default 0,
  position_y    float default 0,
  rotation      float default 0,
  scale         float default 1,
  z_index       int default 1
);

-- ─── updated_at trigger for cards ────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_cards_updated_at
before update on cards
for each row
execute function set_updated_at();
