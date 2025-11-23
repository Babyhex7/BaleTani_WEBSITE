-- Migration: Remove service_fee column from orders table
-- Date: 2025-11-23
-- Description: Menghapus kolom service_fee yang tidak digunakan

-- Drop the service_fee column
ALTER TABLE orders DROP COLUMN IF EXISTS service_fee;

-- Verification query (optional - comment out after running)
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' 
-- AND column_name = 'service_fee';
