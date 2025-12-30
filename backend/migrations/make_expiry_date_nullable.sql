-- Migration: Make expiry_date nullable in procurement_items table
-- Date: 2025-12-30
-- Description: Change expiry_date column to allow NULL values since not all items have expiry dates

-- Make expiry_date nullable (MySQL syntax)
ALTER TABLE procurement_items MODIFY COLUMN expiry_date DATE NULL;