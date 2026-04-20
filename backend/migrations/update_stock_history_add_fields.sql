-- Migration: Add additional columns to stock_history for better auditing
-- Date: 2026-04-20

ALTER TABLE stock_history
  ADD COLUMN previous_qty DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER quantity_change,
  ADD COLUMN new_qty DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER previous_qty,
  ADD COLUMN actor_id VARCHAR(36) NULL AFTER reference_id,
  ADD COLUMN reference_type ENUM('procurement','order','manual','seed','init') NOT NULL DEFAULT 'manual' AFTER actor_id,
  ADD COLUMN metadata JSON NULL AFTER reference_type,
  ADD COLUMN idempotency_key VARCHAR(100) NULL AFTER metadata;

-- Composite index for faster per-product time-range queries
CREATE INDEX IF NOT EXISTS idx_stock_history_product_created ON stock_history (product_id, created_at);
