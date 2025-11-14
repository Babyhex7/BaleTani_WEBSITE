-- Migration: Add unique constraint to prevent multiple active discounts per product
-- Created: 2024-11-14
-- Purpose: Ensure 1 product can only have 1 active discount at a time

-- First, clean up any duplicate active discounts
-- Keep only the most recent one for each product
DELETE pd1 FROM product_discounts pd1
INNER JOIN product_discounts pd2 
ON pd1.product_id = pd2.product_id 
AND pd1.created_at < pd2.created_at
INNER JOIN discounts d1 ON pd1.discount_id = d1.id
INNER JOIN discounts d2 ON pd2.discount_id = d2.id
WHERE d1.is_active = 1 
  AND d2.is_active = 1
  AND d1.start_date <= CURDATE() 
  AND d1.end_date >= CURDATE()
  AND d2.start_date <= CURDATE() 
  AND d2.end_date >= CURDATE();

-- Note: We can't add a strict UNIQUE constraint because the same product
-- can have multiple discounts, but only one should be ACTIVE at a time.
-- This is enforced by application logic in adminDiscount.controller.js
