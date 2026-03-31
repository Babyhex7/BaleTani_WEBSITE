const { sequelize } = require("../src/config/database");
const Role = require("../src/models/role.model");
const Admin = require("../src/models/admin.model");
const { normalizePhoneNumber } = require("../src/utils/phoneHelper");

const ROLES = [
  {
    role_name: "super_admin",
    description: "Akses penuh ke semua fitur admin dashboard",
  },
  {
    role_name: "super_whatsapp_admin",
    description: "Admin WhatsApp dengan akses penuh ke semua fitur",
  },
  {
    role_name: "super_cashier",
    description: "Kasir dengan akses penuh ke semua fitur",
  },
  {
    role_name: "super_inventory_admin",
    description: "Admin inventori dengan akses penuh ke semua fitur",
  },
  {
    role_name: "whatsapp_admin",
    description: "Admin WhatsApp standar dengan akses terbatas",
  },
  {
    role_name: "cashier",
    description: "Kasir standar dengan akses terbatas",
  },
  {
    role_name: "finance_admin",
    description: "Admin keuangan dengan akses ke data finansial",
  },
  {
    role_name: "inventory_admin",
    description: "Admin inventori standar dengan akses terbatas",
  },
];

const ADMIN_ACCOUNTS = [
  { phone_number: "6281234567890", full_name: "Super Admin", role_name: "super_admin", password: "admin12345" },
  { phone_number: "6282345678901", full_name: "Super WhatsApp Admin", role_name: "super_whatsapp_admin", password: "admin12345" },
  { phone_number: "6283456789012", full_name: "Super Cashier", role_name: "super_cashier", password: "admin12345" },
  { phone_number: "6284567890123", full_name: "Super Inventory Admin", role_name: "super_inventory_admin", password: "admin12345" },
  { phone_number: "6285678901234", full_name: "WhatsApp Admin", role_name: "whatsapp_admin", password: "admin12345" },
  { phone_number: "6286789012345", full_name: "Cashier", role_name: "cashier", password: "admin12345" },
  { phone_number: "6287890123456", full_name: "Finance Admin", role_name: "finance_admin", password: "admin12345" },
  { phone_number: "6288901234567", full_name: "Inventory Admin", role_name: "inventory_admin", password: "admin12345" },
];

async function seedRoles() {
  console.log("📋 Seeding roles...");
  let created = 0, skipped = 0;
  for (const roleData of ROLES) {
    const [role, isCreated] = await Role.findOrCreate({
      where: { role_name: roleData.role_name },
      defaults: { role_name: roleData.role_name, description: roleData.description, created_at: new Date(), updated_at: new Date() },
    });
    if (isCreated) { console.log(`✅ Created role: ${role.role_name}`); created++; }
    else { console.log(`⏭️  Role already exists: ${role.role_name}`); skipped++; }
  }
  console.log(`\n📊 Roles Summary: ${created} created, ${skipped} skipped\n`);
}

async function seedAdmins() {
  console.log("👥 Seeding admin accounts...");
  let created = 0, skipped = 0;
  for (const adminData of ADMIN_ACCOUNTS) {
    const role = await Role.findOne({ where: { role_name: adminData.role_name } });
    if (!role) { console.warn(`⚠️  Role not found: ${adminData.role_name}`); continue; }
    const [admin, isCreated] = await Admin.findOrCreate({
      where: { phone_number: adminData.phone_number },
      defaults: { phone_number: adminData.phone_number, full_name: adminData.full_name, role_id: role.id, password_hash: adminData.password, is_active: true, created_at: new Date(), updated_at: new Date() },
    });
    if (isCreated) { console.log(`✅ Created admin: ${admin.full_name} (${adminData.role_name})`); created++; }
    else { console.log(`⏭️  Admin already exists: ${admin.full_name}`); skipped++; }
  }
  console.log(`\n📊 Admins Summary: ${created} created, ${skipped} skipped\n`);
}

async function main() {
  try {
    console.log("🚀 Starting database seeders...\n");
    await sequelize.authenticate();
    console.log("✅ Database connection established\n");
    console.log("Step 1: Seeding roles\n" + "=".repeat(60));
    await seedRoles();
    console.log("Step 2: Seeding admin accounts\n" + "=".repeat(60));
    await seedAdmins();
    console.log("=".repeat(60));
    console.log("🎉 All seeders completed successfully!");
    console.log("\n💡 Lihat docs/DAFTAR_AKUN_ADMIN.md untuk daftar lengkap akun admin");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) { main(); }
module.exports = { seedRoles, seedAdmins };
