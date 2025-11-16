-- ============================================================
-- DATABASE INDEXES MIGRATION untuk BaleTani
-- ============================================================
--
-- File ini berisi semua indexes yang ditambahkan ke models
-- untuk meningkatkan performance query.
--
-- CARA JALANKAN:
-- 1. Backup database dulu: mysqldump -u username -p database_name > backup.sql
-- 2. Jalankan script ini: mysql -u username -p database_name < database_indexes_migration.sql
-- 3. Atau copy-paste satu per satu ke MySQL Workbench/phpMyAdmin
--
-- IMPORTANT: Indexes akan mempercepat SELECT tapi sedikit memperlambat INSERT/UPDATE
-- Ini normal dan worth it untuk aplikasi e-commerce.
-- ============================================================

-- PRODUCTS TABLE INDEXES
-- Untuk filter produk per kategori, status aktif, dll
ALTER TABLE products ADD INDEX idx_product_category_active (category_id, is_active);
ALTER TABLE products ADD INDEX idx_product_active (is_active);  
ALTER TABLE products ADD INDEX idx_product_type (product_type);
ALTER TABLE products ADD INDEX idx_product_created (created_at);

-- ORDERS TABLE INDEXES  
-- Untuk order history per customer, filter status, admin order management
ALTER TABLE orders ADD INDEX idx_order_customer (customer_id);
ALTER TABLE orders ADD INDEX idx_order_status (order_status);
ALTER TABLE orders ADD INDEX idx_order_payment_status (payment_status);
ALTER TABLE orders ADD INDEX idx_order_created (created_at);
ALTER TABLE orders ADD INDEX idx_order_customer_status (customer_id, order_status);

-- CARTS TABLE INDEXES
-- Untuk ambil cart per customer, prevent duplicate cart items
ALTER TABLE carts ADD INDEX idx_cart_customer (customer_id);
ALTER TABLE carts ADD INDEX idx_cart_product (product_id); 
ALTER TABLE carts ADD UNIQUE INDEX idx_cart_customer_product (customer_id, product_id);

-- ORDER_ITEMS TABLE INDEXES
-- Untuk ambil items per order, tracking penjualan per product
ALTER TABLE order_items ADD INDEX idx_order_item_order (order_id);
ALTER TABLE order_items ADD INDEX idx_order_item_product (product_id);
ALTER TABLE order_items ADD INDEX idx_order_item_created (created_at);

-- ============================================================
-- VERIFICATION QUERIES (Opsional - untuk cek indexes berhasil)
-- ============================================================

-- Cek semua indexes yang baru ditambahkan
SHOW INDEX FROM products WHERE Key_name LIKE 'idx_product_%';
SHOW INDEX FROM orders WHERE Key_name LIKE 'idx_order_%';  
SHOW INDEX FROM carts WHERE Key_name LIKE 'idx_cart_%';
SHOW INDEX FROM order_items WHERE Key_name LIKE 'idx_order_item_%';

-- Test query performance (EXPLAIN akan show penggunaan index)
-- EXPLAIN SELECT * FROM products WHERE category_id = 'some-uuid' AND is_active = true;
-- EXPLAIN SELECT * FROM orders WHERE customer_id = 'some-uuid' ORDER BY created_at DESC;
-- EXPLAIN SELECT * FROM carts WHERE customer_id = 'some-uuid';

-- ============================================================
-- DONE! Indexes berhasil ditambahkan.
-- Query yang lambat sekarang harusnya jadi cepat.
-- ============================================================