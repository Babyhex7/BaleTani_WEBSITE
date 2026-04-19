-- Support fractional stock quantities (e.g. 0.5 kg)
ALTER TABLE products
MODIFY COLUMN total_stock DECIMAL(10,2) NOT NULL DEFAULT 0;
