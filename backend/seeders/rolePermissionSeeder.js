/**
 * ROLE PERMISSION SEEDER
 * Seed mapping antara role dan permission
 * Menentukan hak akses untuk setiap role
 */

const { Role, Permission, RolePermission } = require("../src/models");

// Mapping permission untuk setiap role
const rolePermissionsMap = {
  // 1. CASHIER - Hanya transaksi offline
  cashier: [
    { module: "products", action: "view" },
    { module: "offline_orders", action: "view" },
    { module: "offline_orders", action: "create" },
    { module: "offline_orders", action: "update_status" },
  ],

  // 2. WHATSAPP ADMIN - Hanya transaksi online
  whatsapp_admin: [
    { module: "products", action: "view" },
    { module: "online_orders", action: "view" },
    { module: "online_orders", action: "create" },
    { module: "online_orders", action: "update_status" },
  ],

  // 3. INVENTORY ADMIN - CRUD Procurement sampai proposed
  inventory_admin: [
    { module: "products", action: "view" },
    { module: "procurement", action: "view" },
    { module: "procurement", action: "create" },
    { module: "procurement", action: "update" }, // Hanya bisa update yang masih proposed
  ],

  // 4. FINANCE ADMIN - Read-only semua laporan
  finance_admin: [
    { module: "products", action: "view" },
    { module: "procurement", action: "view" },
    { module: "online_orders", action: "view" },
    { module: "offline_orders", action: "view" },
    { module: "b2b_transactions", action: "view" },
    { module: "reports", action: "view" },
  ],

  // 5. SUPER CASHIER - CRUD semua transaksi + customer data
  super_cashier: [
    { module: "products", action: "view" },
    { module: "online_orders", action: "view" },
    { module: "online_orders", action: "create" },
    { module: "online_orders", action: "update_status" },
    { module: "online_orders", action: "cancel" },
    { module: "offline_orders", action: "view" },
    { module: "offline_orders", action: "create" },
    { module: "offline_orders", action: "update_status" },
    { module: "offline_orders", action: "cancel" },
    { module: "customers", action: "view" },
    { module: "customers", action: "update" },
  ],

  // 6. SUPER WHATSAPP ADMIN - Sama seperti Super Cashier
  super_whatsapp_admin: [
    { module: "products", action: "view" },
    { module: "online_orders", action: "view" },
    { module: "online_orders", action: "create" },
    { module: "online_orders", action: "update_status" },
    { module: "online_orders", action: "cancel" },
    { module: "offline_orders", action: "view" },
    { module: "offline_orders", action: "create" },
    { module: "offline_orders", action: "update_status" },
    { module: "offline_orders", action: "cancel" },
    { module: "customers", action: "view" },
    { module: "customers", action: "update" },
  ],

  // 7. SUPER INVENTORY ADMIN - Approve procurement + CRUD product
  super_inventory_admin: [
    { module: "products", action: "view" },
    { module: "products", action: "create" },
    { module: "products", action: "update" },
    { module: "products", action: "delete" },
    { module: "procurement", action: "view" },
    { module: "procurement", action: "create" },
    { module: "procurement", action: "update" },
    { module: "procurement", action: "delete" },
    { module: "procurement", action: "approve" },
  ],

  // 8. SUPER ADMIN - Full access semua
  super_admin: [
    // Products
    { module: "products", action: "view" },
    { module: "products", action: "create" },
    { module: "products", action: "update" },
    { module: "products", action: "delete" },
    // Procurement
    { module: "procurement", action: "view" },
    { module: "procurement", action: "create" },
    { module: "procurement", action: "update" },
    { module: "procurement", action: "delete" },
    { module: "procurement", action: "approve" },
    // Online Orders
    { module: "online_orders", action: "view" },
    { module: "online_orders", action: "create" },
    { module: "online_orders", action: "update_status" },
    { module: "online_orders", action: "cancel" },
    // Offline Orders
    { module: "offline_orders", action: "view" },
    { module: "offline_orders", action: "create" },
    { module: "offline_orders", action: "update_status" },
    { module: "offline_orders", action: "cancel" },
    // B2B
    { module: "b2b_transactions", action: "view" },
    { module: "b2b_transactions", action: "create" },
    { module: "b2b_transactions", action: "update" },
    { module: "b2b_transactions", action: "delete" },
    // Customers
    { module: "customers", action: "view" },
    { module: "customers", action: "update" },
    // Reports
    { module: "reports", action: "view" },
    // User Management
    { module: "users", action: "view" },
    { module: "users", action: "create" },
    { module: "users", action: "update" },
    { module: "users", action: "delete" },
  ],
};

async function seedRolePermissions() {
  try {
    console.log("🔄 Seeding role permissions...\n");

    for (const [roleName, permissions] of Object.entries(rolePermissionsMap)) {
      console.log(`📋 Processing role: ${roleName}`);

      // Cari role berdasarkan role_name
      const role = await Role.findOne({ where: { role_name: roleName } });

      if (!role) {
        console.log(`⚠️  Role ${roleName} not found, skipping...`);
        continue;
      }

      let successCount = 0;

      // Tambahkan setiap permission ke role
      for (const perm of permissions) {
        const permission = await Permission.findOne({
          where: { module: perm.module, action: perm.action },
        });

        if (permission) {
          // Gunakan findOrCreate untuk avoid duplicate
          const [rolePermission, created] = await RolePermission.findOrCreate({
            where: {
              role_id: role.id,
              permission_id: permission.id,
            },
          });

          if (created) {
            successCount++;
          }
        } else {
          console.log(
            `   ⚠️  Permission not found: ${perm.module}.${perm.action}`
          );
        }
      }

      console.log(
        `   ✅ ${successCount} permissions assigned to ${roleName}\n`
      );
    }

    console.log("✅ Role permissions seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding role permissions:", error);
    process.exit(1);
  }
}

// Jalankan seeder
seedRolePermissions();
