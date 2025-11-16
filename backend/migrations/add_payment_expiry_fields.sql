-- =====================================================
-- Migration: Add payment expiry fields to orders table
-- Date: 2025-11-16
-- Purpose: Auto-cancel orders yang tidak dibayar dalam waktu tertentu
-- =====================================================

-- STEP 1: Cek apakah kolom sudah ada
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_expired_at';

-- STEP 2: Add payment_expired_at column (jika belum ada)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_expired_at DATETIME DEFAULT NULL
COMMENT 'Waktu expired untuk pembayaran (10 menit dari created_at)';

-- STEP 3: Add index for expired order checking (cron job performance)
-- DROP INDEX IF EXISTS idx_order_payment_expired ON orders;
CREATE INDEX IF NOT EXISTS idx_order_payment_expired 
ON orders(order_status, payment_expired_at)
COMMENT 'Index untuk cron job auto-cancel expired orders';

-- Note: cancelled_reason, cancelled_by, cancelled_at sudah ada di table

-- VERIFIKASI: Cek struktur table
-- SHOW COLUMNS FROM orders LIKE 'payment_expired_at';
-- SHOW INDEX FROM orders WHERE Key_name = 'idx_order_payment_expired';
