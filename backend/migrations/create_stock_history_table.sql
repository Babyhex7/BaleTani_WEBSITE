-- Migration: Create stock_history table
-- Date: 2024-12-20
-- Description: Track stock changes for products (additions from procurement, reductions from orders)

CREATE TABLE stock_history (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id VARCHAR(36) NOT NULL,
  change_type ENUM('procurement', 'order', 'manual') NOT NULL COMMENT 'Type of stock change',
  quantity_change DECIMAL(10,2) NOT NULL COMMENT 'Positive for addition, negative for reduction',
  reason TEXT COMMENT 'Description of the change',
  reference_id VARCHAR(36) COMMENT 'ID of related procurement/order',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_stock_history_product (product_id),
  INDEX idx_stock_history_type (change_type),
  INDEX idx_stock_history_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;