-- ============================================
-- BaleTani Database Initialization
-- This script runs when MySQL container starts
-- ============================================

-- Set character set
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Set timezone
SET time_zone = '+07:00';

-- Grant privileges
GRANT ALL PRIVILEGES ON baletani.* TO 'baletani_user'@'%';
FLUSH PRIVILEGES;

-- Info log
SELECT 'BaleTani database initialized successfully!' AS message;
