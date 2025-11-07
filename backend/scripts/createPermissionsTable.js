/**
 * Script untuk membuat tabel permissions
 * Mengelola daftar permission yang tersedia di sistem
 */

const { sequelize } = require("../src/config/database");

async function createPermissionsTable() {
  try {
    console.log("🔄 Creating permissions table...");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        module VARCHAR(50) NOT NULL COMMENT 'Module/fitur sistem (products, orders, dll)',
        action VARCHAR(50) NOT NULL COMMENT 'Aksi yang bisa dilakukan (view, create, update, delete)',
        description TEXT COMMENT 'Deskripsi permission',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_permission (module, action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✅ Permissions table created successfully");

    // Insert master permissions
    console.log("🔄 Inserting master permissions...");

    await sequelize.query(`
      INSERT INTO permissions (module, action, description) VALUES
      -- Products
      ('products', 'view', 'Melihat daftar produk'),
      ('products', 'create', 'Membuat produk baru'),
      ('products', 'update', 'Mengubah data produk'),
      ('products', 'delete', 'Menghapus produk'),
      
      -- Procurement
      ('procurement', 'view', 'Melihat daftar procurement'),
      ('procurement', 'create', 'Membuat procurement baru'),
      ('procurement', 'update', 'Mengubah procurement'),
      ('procurement', 'delete', 'Menghapus procurement'),
      ('procurement', 'approve', 'Menyetujui procurement'),
      
      -- Online Orders
      ('online_orders', 'view', 'Melihat pesanan online'),
      ('online_orders', 'create', 'Membuat pesanan online'),
      ('online_orders', 'update_status', 'Mengubah status pesanan online'),
      ('online_orders', 'cancel', 'Membatalkan pesanan online'),
      
      -- Offline Orders
      ('offline_orders', 'view', 'Melihat pesanan offline'),
      ('offline_orders', 'create', 'Membuat pesanan offline'),
      ('offline_orders', 'update_status', 'Mengubah status pesanan offline'),
      ('offline_orders', 'cancel', 'Membatalkan pesanan offline'),
      
      -- B2B Transactions
      ('b2b_transactions', 'view', 'Melihat transaksi B2B'),
      ('b2b_transactions', 'create', 'Membuat transaksi B2B'),
      ('b2b_transactions', 'update', 'Mengubah transaksi B2B'),
      ('b2b_transactions', 'delete', 'Menghapus transaksi B2B'),
      
      -- Customers
      ('customers', 'view', 'Melihat data customer'),
      ('customers', 'update', 'Mengubah data customer'),
      
      -- Reports
      ('reports', 'view', 'Melihat laporan'),
      
      -- Users/Admin Management
      ('users', 'view', 'Melihat daftar admin'),
      ('users', 'create', 'Membuat admin baru'),
      ('users', 'update', 'Mengubah data admin'),
      ('users', 'delete', 'Menghapus admin')
      ON DUPLICATE KEY UPDATE description = VALUES(description);
    `);

    console.log("✅ Master permissions inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating permissions table:", error);
    process.exit(1);
  }
}

createPermissionsTable();
