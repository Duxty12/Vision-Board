-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0004_vision_boards.sql
-- Drop collections support and add starring support to boards table.
-- Source of truth: database.md Revision Changelog
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Drop the cards collection index
DROP INDEX IF EXISTS idx_cards_collection_id;
DROP INDEX IF EXISTS idx_collections_user_id;

-- 2. Drop the collections table (cascade to remove policies)
DROP TABLE IF EXISTS collections CASCADE;

-- 3. Drop the collection_id column from cards
ALTER TABLE cards DROP COLUMN IF EXISTS collection_id;

-- 4. Add is_starred column to boards table
ALTER TABLE boards ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false NOT NULL;

-- 5. Create partial index for starred boards
CREATE INDEX IF NOT EXISTS idx_boards_is_starred ON boards(is_starred) WHERE is_starred = true;
