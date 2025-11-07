/**
 * Script untuk membuat tabel role_permissions
 * Menghubungkan role dengan permission (Many-to-Many)
 */

const { sequelize } = require("../src/config/database");

async function createRolePermissionsTable() {
  try {
    console.log("🔄 Creating role_permissions table...");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_id INT NOT NULL COMMENT 'ID role dari tabel roles',
        permission_id INT NOT NULL COMMENT 'ID permission dari tabel permissions',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_permission (role_id, permission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✅ Role permissions table created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating role_permissions table:", error);
    process.exit(1);
  }
}

createRolePermissionsTable();
