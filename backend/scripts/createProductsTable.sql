-- Create products table manually
-- Run this script to create the products table before running the server

USE baletani_db;

-- Drop table if exists (be careful in production!)
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_discounts;
DROP TABLE IF EXISTS procurement_items;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS products;

-- Create products table (without foreign keys first)
CREATE TABLE products (
    id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    product_type ENUM('online', 'offline') NOT NULL,
    category_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
    description TEXT NULL,
    selling_price DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    shelf_life_days INT NOT NULL,
    total_stock DECIMAL(10, 2) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL DEFAULT NULL,
    deleted_by CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
    
    INDEX idx_category_id (category_id),
    INDEX idx_deleted_by (deleted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add foreign keys after table is created
ALTER TABLE products 
    ADD CONSTRAINT fk_products_category 
    FOREIGN KEY (category_id) REFERENCES product_categories(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE products 
    ADD CONSTRAINT fk_products_deleted_by 
    FOREIGN KEY (deleted_by) REFERENCES users(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Create product_images table
CREATE TABLE product_images (
    id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
    product_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL DEFAULT NULL,
    deleted_by CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
    
    INDEX idx_product_id (product_id),
    INDEX idx_deleted_by (deleted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add foreign keys for product_images
ALTER TABLE product_images 
    ADD CONSTRAINT fk_product_images_product 
    FOREIGN KEY (product_id) REFERENCES products(id) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE product_images 
    ADD CONSTRAINT fk_product_images_deleted_by 
    FOREIGN KEY (deleted_by) REFERENCES users(id) 
    ON DELETE SET NULL ON UPDATE CASCADE;

SELECT 'Tables created successfully!' AS status;
