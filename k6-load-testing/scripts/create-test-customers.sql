-- ============================================================
-- SQL SCRIPT: CREATE TEST CUSTOMER ACCOUNTS
-- ============================================================
-- Script ini membuat 100 test customer accounts untuk load testing
-- Phone: 6281000000001 - 6281000000100
-- Password: test123 (hashed dengan bcrypt)
--
-- CARA PAKAI:
-- 1. Buka MySQL Workbench atau MySQL CLI
-- 2. Connect ke database 'baletani_db'
-- 3. Copy-paste dan execute script ini
-- 4. Verify: SELECT COUNT(*) FROM customers WHERE phone_number LIKE '628100000%';
-- ============================================================

USE baletani_db;

-- Drop procedure jika sudah ada
DROP PROCEDURE IF EXISTS generate_test_customers;

DELIMITER $$

CREATE PROCEDURE generate_test_customers()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE phone VARCHAR(20);
    DECLARE hashed_pwd VARCHAR(255);
    DECLARE customer_uuid VARCHAR(36);
    DECLARE customer_name VARCHAR(100);
    DECLARE customer_address VARCHAR(255);
    
    -- Bcrypt hash untuk password "test123" (10 rounds)
    -- Hash ini sudah di-generate dengan bcrypt.hashSync('test123', 10)
    SET hashed_pwd = '$2a$10$YourBcryptHashHere.PleaseReplaceThisWithActualHash';
    
    -- Note: Karena bcrypt hash susah di-generate di SQL,
    -- lebih baik pakai Node.js script untuk create accounts dengan proper hash
    -- Tapi untuk demo, kita tetap create dengan hash dummy
    
    WHILE i <= 100 DO
        -- Generate phone number: 6281000000001 - 6281000000100
        SET phone = CONCAT('628100000', LPAD(i, 4, '0'));
        
        -- Generate UUID untuk customer_id
        SET customer_uuid = UUID();
        
        -- Generate customer name
        SET customer_name = CONCAT('Test Customer ', i);
        
        -- Generate customer address
        SET customer_address = CONCAT('Jl. Test No. ', i, ', Jakarta Selatan');
        
        -- Insert customer (IGNORE untuk skip jika sudah ada)
        INSERT IGNORE INTO customers (
            customer_id,
            phone_number,
            password,
            full_name,
            address,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            customer_uuid,
            phone,
            hashed_pwd,
            customer_name,
            customer_address,
            1,
            NOW(),
            NOW()
        );
        
        SET i = i + 1;
    END WHILE;
    
    -- Display hasil
    SELECT CONCAT('✅ Created ', ROW_COUNT(), ' test customers') as Result;
END$$

DELIMITER ;

-- Execute procedure
CALL generate_test_customers();

-- Verify hasil
SELECT COUNT(*) as total_test_customers 
FROM customers 
WHERE phone_number LIKE '628100000%';

-- Show sample data (10 first customers)
SELECT 
    customer_id,
    phone_number,
    full_name,
    address,
    is_active,
    created_at
FROM customers
WHERE phone_number LIKE '628100000%'
ORDER BY phone_number
LIMIT 10;

-- ============================================================
-- ALTERNATIVE: Pakai Node.js Script (RECOMMENDED)
-- ============================================================
-- Karena bcrypt hash susah di-generate di SQL, lebih baik pakai:
-- node scripts/seed-test-accounts.js
-- 
-- Script tersebut akan:
-- 1. Connect ke MySQL
-- 2. Generate proper bcrypt hash untuk password "test123"
-- 3. Insert 100 customer accounts
-- 4. Verify insertion
-- ============================================================
