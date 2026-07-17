# Vision Board SaaS — Build Plan

**Project name (placeholder):** StillBoard
**Purpose:** A private, personal vision board app for goals, tasks, images, quotes, and videos. No social feed, no algorithm — just a personal cork board.

This document is the single source of truth for building the app. Follow it top to bottom. When you (Claude) are asked to build this later, use this file as the spec.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| UI primitives | shadcn/ui |
| Icons | lucide-react (no emojis anywhere in UI) |
| Auth | Clerk |
| Database | Supabase (Postgres) |
| File storage | Supabase Storage |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Video | YouTube iframe embed + oEmbed API |
| Transactional email | Resend (+ React Email for templates) |
| Forms | react-hook-form + zod |
| State/data fetching | Server Components + Server Actions (avoid heavy client state libs) |
| Deployment target | Vercel |

---

## 2. Environment Variables

Create `.env.local` with:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Folder Structure

```
/app
  /(marketing)
    page.tsx                # landing page
    layout.tsx
  /(auth)
    /sign-in/[[...sign-in]]/page.tsx
    /sign-up/[[...sign-up]]/page.tsx
  /(app)
    layout.tsx               # authenticated shell: sidebar + topbar
    /dashboard/page.tsx
    /goals/page.tsx
    /tasks/page.tsx
    /collections/page.tsx        # vision boards list (create/edit/delete/star)
    /collections/[id]/page.tsx   # a single vision board's canvas
    /settings/page.tsx
  /api
    /webhooks/clerk/route.ts
    /webhooks/resend/route.ts   # optional, for tracking
    /youtube/oembed/route.ts
    /email/send-board/route.ts
  layout.tsx
  globals.css

/components
  /board
    Board.tsx
    BoardCanvas.tsx
    StickyNote.tsx
    QuoteCard.tsx
    ImageCard.tsx
    VideoCard.tsx
    StickerLayer.tsx
    FeaturedStrip.tsx          # starred cards strip
    FeaturedBoardsStrip.tsx    # starred vision boards strip
  /cards
    CardEditorModal.tsx
    CardCompactView.tsx
    ColorPicker.tsx
    CategoryTag.tsx
  /goals
    GoalsList.tsx
    GoalProgress.tsx
  /tasks
    TasksList.tsx
    SubtaskChecklist.tsx
    RecurrenceControl.tsx
  /collections
    BoardGrid.tsx           # grid of the user's vision boards
    BoardCard.tsx           # single board tile: title, theme swatch, count, star toggle
    BoardEditorModal.tsx    # create/rename/theme-pick/delete a board
  /media
    ImageDropzone.tsx
    VideoUrlInput.tsx
  /layout
    Sidebar.tsx
    Topbar.tsx
    SearchFilterBar.tsx
  /ui                        # shadcn generated components

/lib
  /supabase
    client.ts                # browser client
    server.ts                # server client (service role for server actions)
  /clerk
    webhook-handlers.ts
  /resend
    client.ts
    templates/
      WelcomeEmail.tsx
      BoardShareEmail.tsx
  /youtube
    parse.ts                 # extract video ID from URL
    oembed.ts
  /actions                   # server actions (CRUD)
    boards.ts                # board CRUD, star/unstar, theme, set-default
    cards.ts
    goals.ts
    tasks.ts
    media.ts
    stickers.ts
  /types
    index.ts
  /utils.ts

/supabase
  /migrations
    0001_init.sql
    0002_rls_policies.sql
  seed.sql
```

---

## 4. Data Model (Supabase / Postgres)

Run as SQL migrations in `/supabase/migrations`.

```sql
-- users (mirrors Clerk user, synced via webhook)
create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  name text,
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

-- boards: a user's vision boards. Users can have many.
-- Created/edited/deleted from the Collections page, and starred to
-- feature them on the Dashboard.
create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null default 'My Vision Board',
  theme text default 'cork', -- cork | linen | gradient | dark
  is_default boolean default true,   -- board auto-created on signup; opens on Dashboard's canvas
  is_starred boolean default false,  -- featured boards shown on Dashboard
  created_at timestamptz default now()
);

-- cards: unified table for goal / task / image / quote / video
-- Every card belongs to exactly one board (its grouping mechanism).
create table cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  board_id uuid references boards(id) on delete cascade,
  type text not null check (type in ('goal','task','image','quote','video')),
  title text,
  description text,
  content text,              -- quote text, or freeform note body
  attribution text,          -- for quote cards
  color text default '#FFF3B0',
  category text,             -- career, health, travel, relationships, home, etc.
  target_year int,           -- for goals, e.g. 2026
  due_date date,             -- for tasks
  priority text check (priority in ('low','medium','high')),
  is_recurring boolean default false,
  recurrence_rule text,      -- e.g. 'daily','weekly','monthly'
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

-- subtasks (checklist inside a task card)
create table subtasks (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  title text not null,
  is_completed boolean default false,
  position int default 0
);

-- media attached to a card (image upload OR youtube link)
create table media (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  media_type text not null check (media_type in ('image','video')),
  storage_path text,         -- supabase storage path, for images
  youtube_url text,          -- raw url
  youtube_video_id text,     -- parsed id
  thumbnail_url text,
  created_at timestamptz default now()
);

-- decorative stickers placed directly on a board (not attached to cards)
create table stickers (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  sticker_type text not null, -- 'star','arrow','tape','flower', etc.
  position_x float default 0,
  position_y float default 0,
  rotation float default 0,
  scale float default 1,
  z_index int default 1
);
```

### Row Level Security

Enable RLS on every table. Policy pattern (repeat per table, adjusted for join path):

```sql
alter table cards enable row level security;

create policy "Users can CRUD their own cards"
on cards
for all
using (
  user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub')
)
with check (
  user_id = (select id from users where clerk_id = auth.jwt() ->> 'sub')
);
```

Note: Since Clerk (not Supabase Auth) issues the JWT, configure Supabase to accept Clerk's JWT via a custom JWT template in Clerk, and set Supabase's JWT secret accordingly. Document the exact steps in Section 6.

---

## 5. Page-by-Page Specification

### 5.1 Dashboard (`/dashboard`)
- Overview hub, with two horizontally scrollable strips at the top:
  - **Featured boards strip:** any vision board with `is_starred = true` (board title, theme swatch, card count) — clicking one opens that board's full canvas at `/collections/[id]`
  - **Featured cards strip:** any card with `is_starred = true`, pulled across all of the user's boards
- Below the strips, a freeform canvas renders the user's **default board** (`boards.is_default = true`): absolute-positioned cards using `position_x/y`, draggable via dnd-kit, plus its sticker layer
- Theme switcher (cork / linen / gradient / dark) — persists to `boards.theme` for the board currently open on screen
- Floating "+" button (lucide `Plus`) opens a quick-add menu: Goal, Task, Image, Quote, Video, Sticker — added to whichever board is currently open
- Empty state (new user, no cards yet): friendly prompt with `Sparkles` icon and CTA to add first card

### 5.2 Goals Page (`/goals`)
- List/grid of goal-type cards styled as sticky notes with slight random rotation
- **Compact card view (default):** title, category tag, star toggle (`Star` icon), checkbox (`CheckCircle2` icon), attached image thumbnail if present
- **Click to expand:** modal/drawer showing full detail — description, target year, due date, category, attached video, edit/delete controls
- Filter bar: by category, by starred, by completed, by target year
- Progress widget: circular or bar progress showing % of goals completed, count by category

### 5.3 Tasks Page (`/tasks`)
- Same sticky-note card system as Goals, scoped to `type = 'task'`
- Compact view adds priority flag indicator (colored dot or `Flag` icon) and due date
- Expanded view: subtask checklist (add/remove/check subtasks), recurrence toggle + rule picker, priority selector
- Filter bar: by priority, by due date (overdue/today/upcoming), by recurring, by completed

### 5.4 Collections Page (`/collections`)
- Grid of the user's **vision boards** (`BoardGrid.tsx` / `BoardCard.tsx`): title, theme preview swatch, card count, star toggle (`Star` icon), default-board indicator
- **Create** a new vision board from this page (title + theme picker, via `BoardEditorModal.tsx`)
- **Edit** a board: rename, change theme
- **Delete** a board (confirmation required; cascades to its cards, media, and stickers)
- **Star/unstar** a board to feature it on the Dashboard's featured boards strip
- Click a board tile → `/collections/[id]` opens that board's full freeform canvas (same canvas component used for the default board on the Dashboard), scoped to that board's own cards and stickers

### 5.5 Card Detail / Editor (shared modal component)
- Used on the Dashboard canvas, Goals, Tasks, and any individual board's canvas (`/collections/[id]`)
- Fields shown depend on `type`:
  - goal: title, description, category, target_year, due_date, color, image, video, star, complete
  - task: title, description, priority, due_date, recurrence, subtasks, color, image, video, star, complete
  - image: title/caption, image upload
  - quote: content (text), attribution, color
  - video: title, youtube url, description
- Color picker: palette of ~8 pastel swatches + "shuffle" button (random pastel)
- Save via server action → optimistic UI update

### 5.6 Settings Page (`/settings`)
- Profile info (from Clerk)
- "Email me my board" button → triggers Resend send
- Theme preference
- Account/sign-out (Clerk `<UserButton />`)

---

## 6. Third-Party Integration Setup

### 6.1 Clerk (Authentication)
1. Create Clerk app, enable Email/Password + Google OAuth.
2. Add `<ClerkProvider>` in root layout; protect `(app)` route group with Clerk middleware (`middleware.ts` using `authMiddleware`/`clerkMiddleware`).
3. Create a Clerk **JWT template** named `supabase` that includes the Supabase-expected claims, so Clerk-issued JWTs can be passed to Supabase for RLS (`auth.jwt() ->> 'sub'` = Clerk user id).
4. Set up webhook endpoint `/api/webhooks/clerk`:
   - Listen for `user.created` → insert row into `users` table, then call Resend to send the welcome email, then mark `onboarding_complete` after first board/card is created (or immediately after a default board is auto-created).
   - Also create a **default vision board** for the new user in this same handler (`is_default = true`).
5. Verify webhook signature using `svix` (Clerk's webhook library) and `CLERK_WEBHOOK_SECRET`.

### 6.2 Supabase (Database + Storage)
1. Create Supabase project. Run migrations from `/supabase/migrations`.
2. Configure Supabase to trust Clerk JWTs (Project Settings → Auth → JWT secret matches Clerk's signing key for the `supabase` template, or use Clerk's official Supabase integration if available).
3. Create a Storage bucket `board-media` (public read, authenticated write) with per-user folder convention: `board-media/{user_id}/{card_id}/{filename}`.
4. Storage policy: user can only upload/read/delete within their own `{user_id}` folder.
5. Server actions in `/lib/actions/*` use the Supabase server client with the user's forwarded JWT for RLS-respecting queries; use the service role client only inside the Clerk webhook handler (no user JWT exists yet at that point).

### 6.3 Media Management (Images)
1. `ImageDropzone.tsx` uses `react-dropzone` for drag-and-drop + click-to-browse.
2. On drop: client uploads directly to Supabase Storage (signed URL or client SDK), gets back `storage_path`.
3. Insert a `media` row linked to the card with `media_type = 'image'`.
4. Generate/display a resized thumbnail (Supabase image transformation URL params, or `next/image` with the public storage URL).

### 6.4 YouTube Video Embedding
1. `VideoUrlInput.tsx`: user pastes any YouTube URL format (watch, youtu.be, shorts).
2. `/lib/youtube/parse.ts`: regex-based extraction of the 11-character video ID from all common URL formats.
3. Call YouTube oEmbed endpoint (`https://www.youtube.com/oembed?url=...&format=json`) via `/api/youtube/oembed` route to fetch title + thumbnail for preview before saving.
4. Store `youtube_url`, `youtube_video_id`, `thumbnail_url` in the `media` table.
5. Render with a lightweight facade (thumbnail + play button) that swaps to an actual `<iframe src="https://www.youtube.com/embed/{id}">` only on click, for performance.

### 6.5 Resend (Transactional Email)
1. Verify sending domain in Resend dashboard; set `RESEND_FROM_EMAIL`.
2. Build email templates with React Email in `/lib/resend/templates/`:
   - `WelcomeEmail.tsx`: welcome message + "how to design your first board" tip sheet (3–5 short tips) + CTA button linking to `/dashboard`.
   - `BoardShareEmail.tsx`: renders a summary of the user's starred/featured cards (title, category, image if present) as a clean HTML email.
3. `/api/email/send-board/route.ts`: server route triggered by the "Email my board" button. Fetches the user's featured cards server-side, renders `BoardShareEmail`, sends via Resend SDK.
4. Clerk webhook (`user.created`) triggers `WelcomeEmail` send.

---

## 7. Design System Notes

- **Icons:** lucide-react only. No system emojis anywhere in UI copy, cards, or notifications.
  - Star toggle → `Star` (filled when starred) — used for both cards and vision boards
  - Task/goal complete → `CheckCircle2` / `Circle`
  - Image card → `Image`
  - Video card → `Video` / `PlayCircle`
  - Sticker layer → `Sticker`
  - Add → `Plus`
  - Pin/board → `Pin`
  - Priority flag → `Flag`
  - Search → `Search`
  - Filter → `SlidersHorizontal`
  - Category tag → `Tag`
- **Sticky notes:** random slight rotation (-3deg to 3deg), soft drop shadow, pastel palette (8 preset colors), rounded corner or slightly torn-paper edge treatment, hand-drawn-style checkbox (custom SVG, not default browser checkbox).
- **Stickers:** small SVG set (star, arrow, washi-tape strip, flower, heart) — draggable, rotatable, resizable, stored per-board.
- **Typography:** a warm serif for quote cards (e.g., "Lora" or "Playfair Display"), clean sans-serif for UI text (e.g., "Inter").
- **Board themes:** cork (textured brown background), linen (soft neutral woven texture), gradient (soft pastel gradient), dark (muted charcoal with warm accent sticky notes).

---

## 8. Build Order / Milestones

Build in this order so each phase is independently testable:

**Phase 1 — Foundation**
1. Next.js + TypeScript + Tailwind + shadcn/ui scaffold
2. Clerk integration: sign-up/sign-in pages, middleware protection, `<UserButton />`
3. Supabase project + run migrations + RLS policies
4. Clerk webhook → create `users` row + default `boards` row

**Phase 2 — Core CRUD**
5. Server actions for cards (create/read/update/delete) scoped by type
6. Goals page: list, compact card, expand modal, checkbox, star toggle
7. Tasks page: reuse card system, add subtasks + priority + recurrence
8. Color picker + shuffle

**Phase 3 — Media**
9. Supabase Storage bucket + policies
10. Image drag-and-drop upload → attach to card
11. YouTube URL parser + oEmbed preview + embed facade

**Phase 4 — Dashboard**
12. Freeform board canvas with dnd-kit drag positioning (renders the default board)
13. Featured cards strip (starred cards)
14. Sticker layer (add/drag/rotate/scale)
15. Theme switcher

**Phase 5 — Vision Boards & Filters**
16. Boards CRUD (create/rename/change theme/delete) + star/unstar, on the Collections page; board canvas at `/collections/[id]` reusing the Dashboard's canvas component
17. Featured boards strip on the Dashboard
18. Search & filter bar (category, starred, completed, media type)
19. Progress widgets (goals % complete, tasks this week)

**Phase 6 — Email**
20. Resend welcome email on signup (via Clerk webhook)
21. "Email my board" button + `BoardShareEmail` template + send route

**Phase 7 — Polish**
22. Empty states, loading states, error handling
23. Responsive/mobile layout for board canvas
24. Onboarding flow (theme pick + first card prompt) tied to welcome email
25. Final QA pass against this spec

---

## 9. Open Decisions to Confirm Before Building

- Whether "Email my board" sends featured cards from just the default board, or aggregates starred cards across all of the user's vision boards
- Free-form pixel positioning vs. a snapping grid on a board's canvas
- Whether recurring tasks auto-regenerate a new card instance on completion, or just reset their own checkbox on a schedule
- Whether the featured boards strip on the Dashboard shows a live mini-preview of each board's canvas, or just metadata (title, theme swatch, card count)
- Whether a user can delete their only remaining board, or must always have at least one (likely the default board)

---

*End of plan. When ready to build, provide this file back and specify which phase to start with (recommended: Phase 1).*
