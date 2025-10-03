# BaleTani Fresh Market - Database Setup

## Schema SQL untuk MySQL

```sql
-- Create Database
CREATE DATABASE baletani_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE baletani_db;

-- 1. Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer','admin','staff') DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Products
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4. Promos
CREATE TABLE promos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    discount_percent DECIMAL(5,2),
    start_date DATETIME,
    end_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Promo_Products (relasi promo ke produk)
CREATE TABLE promo_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    promo_id INT NOT NULL,
    product_id INT NOT NULL,
    discount_percent DECIMAL(5,2),
    FOREIGN KEY (promo_id) REFERENCES promos(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 6. Carts
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. Cart_Items
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 8. Orders
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    customer_name VARCHAR(100),
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid','cancelled') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. Order_Items
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 10. Reviews (opsional)
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 11. Inventory_Logs
CREATE TABLE inventory_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type ENUM('in','out') NOT NULL,
    quantity INT NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 12. Transactions
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    type ENUM('cash-in','cash-out') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 13. Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('order','inventory','promo','system'),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
-- Admin user (password: admin123)
INSERT INTO users (full_name, email, password, role) VALUES
('Admin BaleTani', 'admin@baletani.com', '$2a$10$X5N5SZOTOnqfyV5.mHrTI.A6u6Z2RKBmK4Q3xjLB5s1w7RXJx0N6G', 'admin');

-- Sample categories
INSERT INTO categories (name, description) VALUES
('Sayuran', 'Sayuran segar organik langsung dari kebun'),
('Buah-buahan', 'Buah-buahan segar dan manis pilihan terbaik'),
('Daging & Unggas', 'Daging dan unggas segar berkualitas premium'),
('Seafood', 'Ikan dan seafood segar langsung dari laut');

-- Sample products
INSERT INTO products (category_id, name, description, base_price, stock, image_url) VALUES
(1, 'Sayur Bayam Segar', 'Bayam organik segar langsung dari kebun petani lokal', 8000.00, 50, '/images/bayam.jpg'),
(1, 'Tomat Cherry Premium', 'Tomat cherry manis dan segar, cocok untuk salad', 15000.00, 30, '/images/tomat-cherry.jpg'),
(2, 'Apel Fuji Import', 'Apel Fuji import berkualitas tinggi, manis dan renyah', 25000.00, 25, '/images/apel-fuji.jpg'),
(4, 'Ikan Salmon Fillet', 'Salmon fillet segar, kaya omega-3', 45000.00, 15, '/images/salmon.jpg');
```

## Environment Variables Setup

### Backend (.env)

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=baletani_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_CUSTOMER_URL=http://localhost:5173
FRONTEND_ADMIN_URL=http://localhost:5174
```

### Frontend Customer (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="BaleTani Fresh Market"
VITE_APP_DESCRIPTION="Dari kebun ke Balé, dari Balé ke rumahmu"
VITE_WHATSAPP_NUMBER=6281234567890
VITE_INSTAGRAM_URL=https://instagram.com/baletani
VITE_FACEBOOK_URL=https://facebook.com/baletani
```
