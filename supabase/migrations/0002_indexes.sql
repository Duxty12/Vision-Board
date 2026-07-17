-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0002_indexes.sql
-- Performance indexes for StillBoard.
-- Source of truth: database.md § 3.1
-- ─────────────────────────────────────────────────────────────────────────────

-- Boards
create index idx_boards_user_id on boards(user_id);

-- Collections
create index idx_collections_user_id on collections(user_id);

-- Cards — primary lookups
create index idx_cards_user_id       on cards(user_id);
create index idx_cards_board_id      on cards(board_id);
create index idx_cards_collection_id on cards(collection_id);
create index idx_cards_type          on cards(type);

-- Cards — filtered views (Goals page, Tasks page, Featured strip)
create index idx_cards_is_starred   on cards(is_starred)   where is_starred = true;
create index idx_cards_is_completed on cards(is_completed);

-- Subtasks
create index idx_subtasks_card_id on subtasks(card_id);

-- Media
create index idx_media_card_id on media(card_id);

-- Stickers
create index idx_stickers_board_id on stickers(board_id);
