/**
 * Script untuk update tabel roles dengan 8 role admin
 * Customer tidak termasuk karena punya sistem login sendiri
 */

const { sequelize } = require("../src/config/database");
const { v4: uuidv4 } = require("uuid");

async function updateRolesTable() {
  try {
    console.log("🔄 Updating roles table with 8 admin roles...");

    // Gunakan role_name sesuai struktur tabel, bukan name
    // Tabel roles pakai UUID, bukan level
    await sequelize.query(`
      INSERT INTO roles (id, role_name, description, created_at, updated_at) VALUES
      ('${uuidv4()}', 'cashier', 'Kasir - Kelola transaksi offline', NOW(), NOW()),
      ('${uuidv4()}', 'whatsapp_admin', 'Admin WhatsApp - Kelola transaksi online', NOW(), NOW()),
      ('${uuidv4()}', 'inventory_admin', 'Admin Inventory - CRUD Procurement (proposed)', NOW(), NOW()),
      ('${uuidv4()}', 'finance_admin', 'Admin Finance - Lihat semua laporan', NOW(), NOW()),
      ('${uuidv4()}', 'super_cashier', 'Super Kasir - CRUD semua transaksi + customer data', NOW(), NOW()),
      ('${uuidv4()}', 'super_whatsapp_admin', 'Super Admin WA - CRUD semua transaksi + customer data', NOW(), NOW()),
      ('${uuidv4()}', 'super_inventory_admin', 'Super Admin Inventory - Approve procurement + CRUD product', NOW(), NOW()),
      ('${uuidv4()}', 'super_admin', 'Super Admin - Full access ke semua fitur', NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        description = VALUES(description),
        updated_at = NOW();
    `);

    console.log("✅ Roles updated successfully");
    console.log("\n📋 Roles Summary:");
    console.log("1. cashier");
    console.log("2. whatsapp_admin");
    console.log("3. inventory_admin");
    console.log("4. finance_admin");
    console.log("5. super_cashier");
    console.log("6. super_whatsapp_admin");
    console.log("7. super_inventory_admin");
    console.log("8. super_admin");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating roles:", error);
    process.exit(1);
  }
}

updateRolesTable();
