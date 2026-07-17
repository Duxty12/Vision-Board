-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0003_rls_policies.sql
-- Row Level Security policies for StillBoard.
-- Assumes Clerk JWT is configured as Supabase's JWT secret so that
-- auth.jwt()->>'sub' returns the Clerk user id (clerk_id).
-- Source of truth: database.md § 4
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Enable RLS on all tables ────────────────────────────────────────────────
alter table users       enable row level security;
alter table boards      enable row level security;
alter table collections enable row level security;
alter table cards       enable row level security;
alter table subtasks    enable row level security;
alter table media       enable row level security;
alter table stickers    enable row level security;

-- ─── users ───────────────────────────────────────────────────────────────────
-- A user may only read/update their own row.
-- INSERT is done via service role in the Clerk webhook (no policy needed).

create policy "users_select_own"
on users for select
using (clerk_id = auth.jwt() ->> 'sub');

create policy "users_update_own"
on users for update
using (clerk_id = auth.jwt() ->> 'sub');

-- ─── boards ──────────────────────────────────────────────────────────────────
create policy "boards_all_own"
on boards for all
using  (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'))
with check (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'));

-- ─── collections ─────────────────────────────────────────────────────────────
create policy "collections_all_own"
on collections for all
using  (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'))
with check (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'));

-- ─── cards ───────────────────────────────────────────────────────────────────
create policy "cards_all_own"
on cards for all
using  (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'))
with check (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'));

-- ─── subtasks (scoped via parent card's user_id) ─────────────────────────────
create policy "subtasks_all_own"
on subtasks for all
using (
  card_id in (
    select id from cards
    where user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub')
  )
)
with check (
  card_id in (
    select id from cards
    where user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub')
  )
);

-- ─── media (scoped via parent card's user_id) ────────────────────────────────
create policy "media_all_own"
on media for all
using (
  card_id in (
    select id from cards
    where user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub')
  )
)
with check (
  card_id in (
    select id from cards
    where user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub')
  )
);

-- ─── stickers (scoped via parent board's user_id) ────────────────────────────
create policy "stickers_all_own"
on stickers for all
using (
  board_id in (
    select id from boards
    where user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub')
  )
)
with check (
  board_id in (
    select id from boards
    where user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub')
  )
);

-- ─── Storage policies (bucket: board-media) ───────────────────────────────────
-- Path convention: board-media/{user_id}/{card_id}/{filename}
-- Users may only read/write/delete within their own {user_id} folder.

create policy "storage_read_own"
on storage.objects for select
using (
  bucket_id = 'board-media'
  and (storage.foldername(name))[1] = (
    select id::text from users where clerk_id = auth.jwt() ->> 'sub'
  )
);

create policy "storage_write_own"
on storage.objects for insert
with check (
  bucket_id = 'board-media'
  and (storage.foldername(name))[1] = (
    select id::text from users where clerk_id = auth.jwt() ->> 'sub'
  )
);

create policy "storage_delete_own"
on storage.objects for delete
using (
  bucket_id = 'board-media'
  and (storage.foldername(name))[1] = (
    select id::text from users where clerk_id = auth.jwt() ->> 'sub'
  )
);
