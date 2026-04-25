-- Migration: Fix all missing columns
-- Date: 2025-04-25
-- Description: Add ALL missing columns to stock_history and fix procurement_items

-- 1. Add missing columns to stock_history table (semua kolom yang diperlukan)
ALTER TABLE stock_history 
ADD COLUMN IF NOT EXISTS previous_qty DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS new_qty DECIMAL(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS actor_id CHAR(36) NULL,
ADD COLUMN IF NOT EXISTS reference_type ENUM('procurement', 'order', 'manual', 'seed', 'init') NOT NULL DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS metadata JSON NULL,
ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100) NULL;

-- 2. Make expiry_date nullable in procurement_items (if not already)
ALTER TABLE procurement_items MODIFY COLUMN expiry_date DATE NULL;
