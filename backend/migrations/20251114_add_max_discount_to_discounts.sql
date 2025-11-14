-- Migration: Add max_discount field to discounts table
-- Created: 2024-11-14
-- Purpose: Add maximum discount limit for percentage discounts

-- Add max_discount column
ALTER TABLE discounts 
ADD COLUMN max_discount DECIMAL(10, 2) NULL 
COMMENT 'Maksimal potongan untuk discount percentage (misal: percentage 25% max 50000)' 
AFTER value;

-- Update existing discounts dengan default NULL (no limit)
-- Admin bisa update manual via discount management
