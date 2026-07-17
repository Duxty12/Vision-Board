-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data for StillBoard (development only)
-- Run after migrations: supabase db reset --local
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Seed users (use service role; clerk_id is placeholder) ──────────────────
insert into users (id, clerk_id, email, name, onboarding_complete) values
  ('00000000-0000-0000-0000-000000000001', 'user_seed_alice', 'alice@example.com', 'Alice', true),
  ('00000000-0000-0000-0000-000000000002', 'user_seed_bob',   'bob@example.com',   'Bob',   false);

-- ─── Seed boards ─────────────────────────────────────────────────────────────
insert into boards (id, user_id, title, theme, is_default) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alice''s Vision Board', 'cork',  true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Bob''s Vision Board',   'linen', true);

-- ─── Seed collections ────────────────────────────────────────────────────────
insert into collections (id, user_id, name, color) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026 Goals',     '#FFF3B0'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Health Journey', '#B7F0D4');

-- ─── Seed cards ──────────────────────────────────────────────────────────────
insert into cards (
  id, user_id, board_id, collection_id,
  type, title, description, content, attribution, color,
  category, target_year, due_date, priority,
  is_recurring, is_completed, is_starred,
  position_x, position_y, width, height, z_index, rotation
) values
  -- Goal card
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'goal', 'Run a half marathon', 'Complete a 21km race by end of year', null, null,
    '#B7F0D4', 'health', 2026, null, null,
    false, false, true,
    120, 80, 220, 220, 1, -2.5
  ),
  -- Task card
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    null,
    'task', 'Morning run 5km', 'Run every morning before 7am', null, null,
    '#FFF3B0', null, null, '2026-08-01', 'medium',
    true, false, false,
    380, 120, 220, 240, 2, 1.8
  ),
  -- Quote card
  (
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    null,
    'quote', null, null,
    'The secret of getting ahead is getting started.',
    'Mark Twain',
    '#E0C3FC', null, null, null, null,
    false, false, true,
    640, 60, 240, 200, 3, 2.2
  ),
  -- Image card (placeholder storage path)
  (
    '30000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'image', 'Dream Home', 'My future home in the mountains', null, null,
    '#FFD8B1', 'home', null, null, null,
    false, false, false,
    200, 340, 260, 240, 4, -1.2
  ),
  -- Video card
  (
    '30000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    null,
    'video', 'Morning Motivation', 'Watch every morning', null, null,
    '#BAE6FD', null, null, null, null,
    false, false, false,
    500, 320, 280, 220, 5, 0.8
  );

-- ─── Seed subtasks for the task card ─────────────────────────────────────────
insert into subtasks (card_id, title, is_completed, position) values
  ('30000000-0000-0000-0000-000000000002', 'Buy running shoes', true,  0),
  ('30000000-0000-0000-0000-000000000002', 'Set 6am alarm',     false, 1),
  ('30000000-0000-0000-0000-000000000002', 'Plan route',        false, 2);

-- ─── Seed media for image and video cards ────────────────────────────────────
insert into media (card_id, media_type, storage_path, youtube_url, youtube_video_id, thumbnail_url) values
  (
    '30000000-0000-0000-0000-000000000004',
    'image',
    '00000000-0000-0000-0000-000000000001/30000000-0000-0000-0000-000000000004/hero.jpg',
    null, null, null
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    'video',
    null,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
  );
