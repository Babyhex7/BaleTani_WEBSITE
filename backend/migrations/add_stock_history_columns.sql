-- Migration: Add missing columns to stock_history table
-- Date: 2026-04-25
-- Description: Add previous_qty and new_qty columns

ALTER TABLE stock_history 
ADD COLUMN IF NOT EXISTS previous_qty DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS new_qty DECIMAL(10, 2) NOT NULL DEFAULT 0;
