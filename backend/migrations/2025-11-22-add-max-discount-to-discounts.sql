-- Migration: Add `max_discount` column to `discounts` table
-- Date: 2025-11-22
-- Purpose: Add optional `max_discount` decimal column used by backend logic

-- Safety: Use `IF NOT EXISTS` pattern where supported. MySQL < 8 doesn't support
-- `ADD COLUMN IF NOT EXISTS` for all column types; check manually if needed.

-- Recommended: run this against the production/dev database using your DB user.

ALTER TABLE discounts
  ADD COLUMN IF NOT EXISTS max_discount DECIMAL(10,2) NULL
  COMMENT 'Maksimal potongan untuk discount percentage (misal: percentage 25% max 50000)';

-- Verify (run after applying):
-- SHOW COLUMNS FROM discounts LIKE 'max_discount';
