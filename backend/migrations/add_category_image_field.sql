-- Migration: Add category_image field to product_categories table
-- Date: 2024-12-18
-- Description: Add support for category images instead of just icons

ALTER TABLE product_categories
ADD COLUMN category_image VARCHAR(255) DEFAULT NULL COMMENT 'Path to category image file' AFTER description;

-- Note: Existing category_icon field can be kept for backward compatibility
-- or can be removed later if fully migrated to images
