# Database Reference — StillBoard

This document is the single source of truth for the Supabase/Postgres database: full schema, indexes, RLS policies, and every SQL query the app will call. Pairs with `plan.md`.

---

## 0. Changelog (this revision)

The Collections feature changed from "tag groupings for cards" to "manage multiple vision boards." Changes made to this file to match:

- **Removed** the `collections` table entirely (schema, migration DDL, index, RLS policy, and all its queries in §5.9).
- **Removed** `cards.collection_id` (column, migration DDL, index, insert/update/query statements that referenced it) — a card's grouping is now its existing `board_id`, nothing else changed there.
- **Added** `boards.is_starred` (boolean, default `false`) so boards can be featured on the Dashboard, mirroring how `cards.is_starred` already works.
- **Added** an index on `boards.is_starred` (partial, `where is_starred = true`) matching the existing pattern used for `cards.is_starred`.
- **Added** queries: toggle a board's starred state, get a user's starred boards, get all boards for a user with card counts (replaces the deleted collections-with-counts query, now used by the Collections page's board grid).
- **Removed** queries that only made sense for the old collections model: "Get cards by collection," "Assign/remove card from a collection," and the entire §5.9 Collections block.
- Renumbered schema subsections (§2.3 `collections` removed, everything after it shifted up by one) and updated the Entity Overview diagram and Query-to-Feature Map accordingly.

Everything else (goals, tasks, media, stickers, subtasks, search, email query) is unchanged.

---

## 1. Entity Overview

```
users
  └─< boards (now: is_default + is_starred)
        ├─< cards ─< subtasks
        │      └─< media
        └─< stickers
```

- A `user` has one or more `boards` (default: one, auto-created on signup).
- A `board` has many `cards` and many `stickers`, and can be starred (`is_starred`) to feature it on the Dashboard.
- A `card` belongs to exactly one `board` (via `board_id`) — this is now the only grouping mechanism for cards; the old `collections` table/`collection_id` link has been removed.
- A `card` can have many `subtasks` (tasks only) and many `media` rows (usually 0–1 image + 0–1 video, but table allows more).

---

## 2. Full Schema

### 2.1 `users`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| clerk_id | text, unique, not null | Clerk's user id (`sub` claim) |
| email | text, not null | |
| name | text | |
| onboarding_complete | boolean | default `false` |
| created_at | timestamptz | default `now()` |

### 2.2 `boards`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK → users.id, on delete cascade | |
| title | text, not null | default `'My Vision Board'` |
| theme | text | `cork` \| `linen` \| `gradient` \| `dark`, default `cork` |
| is_default | boolean | default `true` — the board auto-created on signup; renders on the Dashboard canvas |
| is_starred | boolean | **new** — default `false`; featured on the Dashboard's featured-boards strip |
| created_at | timestamptz | default `now()` |

### 2.3 `cards`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK → users.id, on delete cascade | |
| board_id | uuid, FK → boards.id, on delete cascade | now the card's only grouping key (`collection_id` removed) |
| type | text, not null | check in `('goal','task','image','quote','video')` |
| title | text | |
| description | text | |
| content | text | quote body / freeform note |
| attribution | text | quote author |
| color | text | default `#FFF3B0` |
| category | text | career / health / travel / relationships / home / etc. |
| target_year | int | goals only |
| due_date | date | tasks only |
| priority | text | check in `('low','medium','high')` |
| is_recurring | boolean | default `false` |
| recurrence_rule | text | `daily` \| `weekly` \| `monthly` |
| is_completed | boolean | default `false` |
| is_starred | boolean | default `false` |
| position_x | float | default `0` |
| position_y | float | default `0` |
| width | float | default `220` |
| height | float | default `220` |
| z_index | int | default `1` |
| rotation | float | default `0` |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()` |

### 2.4 `subtasks`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| card_id | uuid, FK → cards.id, on delete cascade | |
| title | text, not null | |
| is_completed | boolean | default `false` |
| position | int | default `0`, for ordering |

### 2.5 `media`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| card_id | uuid, FK → cards.id, on delete cascade | |
| media_type | text, not null | check in `('image','video')` |
| storage_path | text | Supabase Storage path, images only |
| youtube_url | text | raw pasted URL |
| youtube_video_id | text | parsed 11-char id |
| thumbnail_url | text | |
| created_at | timestamptz | default `now()` |

### 2.6 `stickers`

| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| board_id | uuid, FK → boards.id, on delete cascade | |
| sticker_type | text, not null | `star` \| `arrow` \| `tape` \| `flower` \| `heart` |
| position_x | float | default `0` |
| position_y | float | default `0` |
| rotation | float | default `0` |
| scale | float | default `1` |
| z_index | int | default `1` |

---

## 3. Migration SQL (DDL)

`/supabase/migrations/0001_init.sql`

```sql
create extension if not exists "pgcrypto";

create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  name text,
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

-- boards: is_starred added so a board can be featured on the Dashboard
create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null default 'My Vision Board',
  theme text default 'cork',
  is_default boolean default true,
  is_starred boolean default false,
  created_at timestamptz default now()
);

-- NOTE: the old `collections` table has been removed. Boards are now
-- the only grouping mechanism for cards (see cards.board_id below).

create table cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  board_id uuid references boards(id) on delete cascade,
  type text not null check (type in ('goal','task','image','quote','video')),
  title text,
  description text,
  content text,
  attribution text,
  color text default '#FFF3B0',
  category text,
  target_year int,
  due_date date,
  priority text check (priority in ('low','medium','high')),
  is_recurring boolean default false,
  recurrence_rule text,
  is_completed boolean default false,
  is_starred boolean default false,
  position_x float default 0,
  position_y float default 0,
  width float default 220,
  height float default 220,
  z_index int default 1,
  rotation float default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table subtasks (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  title text not null,
  is_completed boolean default false,
  position int default 0
);

create table media (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  media_type text not null check (media_type in ('image','video')),
  storage_path text,
  youtube_url text,
  youtube_video_id text,
  thumbnail_url text,
  created_at timestamptz default now()
);

create table stickers (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  sticker_type text not null,
  position_x float default 0,
  position_y float default 0,
  rotation float default 0,
  scale float default 1,
  z_index int default 1
);
```

### 3.1 Indexes

`/supabase/migrations/0002_indexes.sql`

```sql
create index idx_boards_user_id on boards(user_id);
create index idx_boards_is_starred on boards(is_starred) where is_starred = true; -- new
create index idx_cards_user_id on cards(user_id);
create index idx_cards_board_id on cards(board_id);
create index idx_cards_type on cards(type);
create index idx_cards_is_starred on cards(is_starred) where is_starred = true;
create index idx_cards_is_completed on cards(is_completed);
create index idx_subtasks_card_id on subtasks(card_id);
create index idx_media_card_id on media(card_id);
create index idx_stickers_board_id on stickers(board_id);
```

*(Removed: `idx_collections_user_id` and `idx_cards_collection_id` — both referenced dropped objects.)*

### 3.2 `updated_at` trigger for `cards`

```sql
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
```

---

## 4. Row Level Security

`/supabase/migrations/0003_rls_policies.sql`

Enable RLS on every table, then scope access to rows owned (directly or indirectly) by the requesting user. Assumes Clerk's JWT `sub` claim is available as `auth.jwt() ->> 'sub'`.

```sql
alter table users enable row level security;
alter table boards enable row level security;
alter table cards enable row level security;
alter table subtasks enable row level security;
alter table media enable row level security;
alter table stickers enable row level security;

-- users: a user can only read/update their own row
create policy "users_select_own"
on users for select
using (clerk_id = auth.jwt() ->> 'sub');

create policy "users_update_own"
on users for update
using (clerk_id = auth.jwt() ->> 'sub');
-- INSERT on users is done via service role in the Clerk webhook only (no policy needed for that path)

-- boards
create policy "boards_all_own"
on boards for all
using (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'))
with check (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'));

-- cards
create policy "cards_all_own"
on cards for all
using (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'))
with check (user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub'));

-- subtasks (scoped via parent card's user_id)
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

-- media (scoped via parent card's user_id)
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

-- stickers (scoped via parent board's user_id)
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
```

*(Removed: `alter table collections enable row level security` and its `collections_all_own` policy — the table no longer exists.)*

**Storage policy** (Supabase Storage, bucket `board-media`, path convention `{user_id}/{card_id}/{filename}`):

```sql
create policy "storage_read_own"
on storage.objects for select
using (
  bucket_id = 'board-media'
  and (storage.foldername(name))[1] = (select id::text from users where clerk_id = auth.jwt() ->> 'sub')
);

create policy "storage_write_own"
on storage.objects for insert
with check (
  bucket_id = 'board-media'
  and (storage.foldername(name))[1] = (select id::text from users where clerk_id = auth.jwt() ->> 'sub')
);

create policy "storage_delete_own"
on storage.objects for delete
using (
  bucket_id = 'board-media'
  and (storage.foldername(name))[1] = (select id::text from users where clerk_id = auth.jwt() ->> 'sub')
);
```

---

## 5. All SQL Queries Called by the App

Organized by feature. In the actual codebase these will mostly be issued via the Supabase JS client (`.from().select()/.insert()/.update()/.delete()`), but the raw SQL equivalents are listed here for clarity and for anything needing a raw query (e.g., aggregate stats).

### 5.1 Users (mostly via Clerk webhook, service role)

```sql
-- Create user on Clerk 'user.created' webhook
insert into users (clerk_id, email, name)
values ($1, $2, $3)
returning *;

-- Fetch current user (used to resolve internal user_id from Clerk id)
select * from users where clerk_id = $1;

-- Mark onboarding complete
update users set onboarding_complete = true where clerk_id = $1;
```

### 5.2 Boards (now covers create/edit/delete/star from the Collections page)

```sql
-- Create default board (on user creation)
insert into boards (user_id, title, theme, is_default)
values ($1, 'My Vision Board', 'cork', true)
returning *;

-- Create a new (non-default) vision board — Collections page "create board"
insert into boards (user_id, title, theme, is_default)
values ($1, $2, $3, false)
returning *;

-- Get user's default board (renders on the Dashboard canvas)
select * from boards where user_id = $1 and is_default = true limit 1;

-- Get all boards for a user, with card counts — Collections page board grid
-- (replaces the old collections-with-counts query)
select b.*, count(c.id) as card_count
from boards b
left join cards c on c.board_id = b.id
where b.user_id = $1
group by b.id
order by b.created_at asc;

-- Get a single board by id — board canvas page (/collections/[id])
select * from boards where id = $1;

-- Get starred boards — Dashboard's featured-boards strip
select * from boards where user_id = $1 and is_starred = true order by created_at desc;

-- Update board title
update boards set title = $2 where id = $1 returning *;

-- Update board theme
update boards set theme = $2 where id = $1 returning *;

-- Toggle board starred
update boards set is_starred = not is_starred where id = $1 returning *;

-- Delete a board (cascades to cards, stickers)
delete from boards where id = $1;
```

### 5.3 Cards — General

```sql
-- Create a card
insert into cards (
  user_id, board_id, type, title, description, content,
  attribution, color, category, target_year, due_date, priority,
  is_recurring, recurrence_rule, position_x, position_y, width, height, z_index, rotation
)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
returning *;

-- Get single card by id (with media + subtasks joined in application code)
select * from cards where id = $1;

-- Get all cards for a board (Dashboard canvas / a board's own canvas page)
select * from cards where board_id = $1 order by z_index asc;

-- Get all cards of a type for a user (Goals page / Tasks page)
select * from cards where user_id = $1 and type = $2 order by created_at desc;

-- Get starred cards (Featured cards strip on Dashboard)
select * from cards where user_id = $1 and is_starred = true order by updated_at desc;

-- Update a card (generic edit — title/description/color/category/etc.)
update cards
set title = $2, description = $3, content = $4, attribution = $5, color = $6,
    category = $7, target_year = $8, due_date = $9, priority = $10,
    is_recurring = $11, recurrence_rule = $12
where id = $1
returning *;

-- Update card position (drag on a board's canvas)
update cards
set position_x = $2, position_y = $3, z_index = $4
where id = $1
returning *;

-- Update card size (resize)
update cards set width = $2, height = $3 where id = $1 returning *;

-- Toggle complete
update cards set is_completed = not is_completed where id = $1 returning *;

-- Toggle starred
update cards set is_starred = not is_starred where id = $1 returning *;

-- Move a card to a different board (drag between boards, if supported in UI)
update cards set board_id = $2 where id = $1 returning *;

-- Delete a card (cascades to subtasks, media)
delete from cards where id = $1;
```

*(Removed: "Get cards by collection" and "Assign/remove card from a collection" — `collection_id` no longer exists; `board_id` is the only grouping key.)*

### 5.4 Goals-specific queries (`type = 'goal'`)

```sql
-- All goals for a user, optionally filtered
select * from cards
where user_id = $1 and type = 'goal'
  and ($2::text is null or category = $2)
  and ($3::boolean is null or is_starred = $3)
  and ($4::boolean is null or is_completed = $4)
  and ($5::int is null or target_year = $5)
order by created_at desc;

-- Goal progress stats (percent complete, count by category)
select
  count(*) filter (where is_completed) as completed_count,
  count(*) as total_count,
  round(100.0 * count(*) filter (where is_completed) / nullif(count(*), 0), 1) as percent_complete
from cards
where user_id = $1 and type = 'goal';

select category, count(*) as count
from cards
where user_id = $1 and type = 'goal'
group by category
order by count desc;
```

### 5.5 Tasks-specific queries (`type = 'task'`)

```sql
-- All tasks for a user, optionally filtered
select * from cards
where user_id = $1 and type = 'task'
  and ($2::text is null or priority = $2)
  and ($3::boolean is null or is_completed = $3)
  and ($4::boolean is null or is_recurring = $4)
order by due_date asc nulls last;

-- Tasks due today
select * from cards
where user_id = $1 and type = 'task' and due_date = current_date and is_completed = false;

-- Overdue tasks
select * from cards
where user_id = $1 and type = 'task' and due_date < current_date and is_completed = false;

-- Tasks completed this week (for streak/progress widget)
select count(*) from cards
where user_id = $1 and type = 'task' and is_completed = true
  and updated_at >= date_trunc('week', now());
```

### 5.6 Subtasks

```sql
-- Get subtasks for a task card
select * from subtasks where card_id = $1 order by position asc;

-- Add a subtask
insert into subtasks (card_id, title, position)
values ($1, $2, $3)
returning *;

-- Toggle subtask complete
update subtasks set is_completed = not is_completed where id = $1 returning *;

-- Rename subtask
update subtasks set title = $2 where id = $1 returning *;

-- Reorder subtask
update subtasks set position = $2 where id = $1;

-- Delete subtask
delete from subtasks where id = $1;
```

### 5.7 Media (images + YouTube videos)

```sql
-- Attach an uploaded image to a card
insert into media (card_id, media_type, storage_path)
values ($1, 'image', $2)
returning *;

-- Attach a YouTube video to a card
insert into media (card_id, media_type, youtube_url, youtube_video_id, thumbnail_url)
values ($1, 'video', $2, $3, $4)
returning *;

-- Get all media for a card
select * from media where card_id = $1 order by created_at asc;

-- Get all image media for a user (e.g. media library view, if added later)
select m.* from media m
join cards c on c.id = m.card_id
where c.user_id = $1 and m.media_type = 'image'
order by m.created_at desc;

-- Delete a media row (also delete the underlying storage object in application code)
delete from media where id = $1;
```

### 5.8 Stickers

```sql
-- Get all stickers for a board
select * from stickers where board_id = $1 order by z_index asc;

-- Add a sticker to the board
insert into stickers (board_id, sticker_type, position_x, position_y, rotation, scale, z_index)
values ($1, $2, $3, $4, $5, $6, $7)
returning *;

-- Move/rotate/resize a sticker
update stickers
set position_x = $2, position_y = $3, rotation = $4, scale = $5, z_index = $6
where id = $1
returning *;

-- Delete a sticker
delete from stickers where id = $1;
```

### 5.9 Search (across card types)

```sql
-- Full-text-ish search across title/description/content for a user
select * from cards
where user_id = $1
  and (
    title ilike '%' || $2 || '%'
    or description ilike '%' || $2 || '%'
    or content ilike '%' || $2 || '%'
  )
order by updated_at desc;
```

### 5.10 "Email my board" query (Resend trigger)

```sql
-- Featured/starred cards to include in the emailed board summary
select
  c.id, c.type, c.title, c.category, c.content, c.attribution,
  m.storage_path, m.thumbnail_url
from cards c
left join media m on m.card_id = c.id
where c.user_id = $1 and c.is_starred = true
order by c.updated_at desc;
```

*(The old §5.9 "Collections" block — create/list-with-counts/rename/delete a collection — has been removed. Its list-with-counts query now lives under §5.2 Boards, since a "collection" in the new model is a board.)*

---

## 6. Query-to-Feature Map (quick reference)

| App feature | Query section |
|---|---|
| Onboarding / welcome email trigger | 5.1, 5.2 |
| Dashboard canvas render (default board) | 5.3 (board cards), 5.8 (stickers) |
| Dashboard drag/reposition | 5.3 (position update) |
| Featured cards strip | 5.3 (starred cards) |
| Featured boards strip | 5.2 (starred boards) |
| Goals page list + filters | 5.4 |
| Goals progress widget | 5.4 (stats) |
| Tasks page list + filters | 5.5 |
| Task due-today / overdue badges | 5.5 |
| Task streak widget | 5.5 (completed this week) |
| Card expand modal (goal/task) | 5.3 (single card), 5.6, 5.7 |
| Subtask checklist | 5.6 |
| Image upload attach | 5.7 (image insert) |
| YouTube paste + embed | 5.7 (video insert) |
| Collections page (board grid, create/edit/delete/star) | 5.2 |
| A board's own canvas page (`/collections/[id]`) | 5.2 (single board), 5.3 (its cards), 5.8 (its stickers) |
| Search & filter bar | 5.9 |
| "Email my board" button | 5.10 |

---

*End of database reference. Pairs with `plan.md` for full build instructions.*
