const { sequelize } = require("../src/config/database");
const Admin = require("../src/models/admin.model");
const Role = require("../src/models/role.model");

const ADMIN_ACCOUNTS = [
  {
    phone_number: "6281234567890",
    full_name: "Super Admin",
    role_name: "super_admin",
    password: "admin12345", // ubah password setelah pertama kali login
  },
  {
    phone_number: "6282345678901",
    full_name: "Super WhatsApp Admin",
    role_name: "super_whatsapp_admin",
    password: "admin12345",
  },
  {
    phone_number: "6283456789012",
    full_name: "Super Cashier",
    role_name: "super_cashier",
    password: "admin12345",
  },
  {
    phone_number: "6284567890123",
    full_name: "Super Inventory Admin",
    role_name: "super_inventory_admin",
    password: "admin12345",
  },
  {
    phone_number: "6285678901234",
    full_name: "WhatsApp Admin",
    role_name: "whatsapp_admin",
    password: "admin12345",
  },
  {
    phone_number: "6286789012345",
    full_name: "Cashier",
    role_name: "cashier",
    password: "admin12345",
  },
  {
    phone_number: "6287890123456",
    full_name: "Finance Admin",
    role_name: "finance_admin",
    password: "admin12345",
  },
  {
    phone_number: "6288901234567",
    full_name: "Inventory Admin",
    role_name: "inventory_admin",
    password: "admin12345",
  },
];

async function seedAdmins() {
  try {
    console.log("🔄 Seeding admin accounts for all roles...\n");

    let successCount = 0;
    let skipCount = 0;

    for (const adminData of ADMIN_ACCOUNTS) {
      // Find role ID
      const role = await Role.findOne({
        where: { role_name: adminData.role_name },
      });

      if (!role) {
        console.warn(
          `⚠️  Role not found: ${adminData.role_name}. Run 'npm run seed:roles' first.`
        );
        skipCount++;
        continue;
      }

      // Create or find admin
      const [admin, created] = await Admin.findOrCreate({
        where: { phone_number: adminData.phone_number },
        defaults: {
          phone_number: adminData.phone_number,
          full_name: adminData.full_name,
          role_id: role.id,
          password_hash: adminData.password, // Will be hashed by hook
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (created) {
        console.log(`✅ Created admin: ${admin.full_name}`);
        console.log(`   Phone: ${admin.phone_number}`);
        console.log(`   Role: ${adminData.role_name}`);
        console.log(`   Password: ${adminData.password}`);
        console.log("");
        successCount++;
      } else {
        console.log(`⏭️  Admin already exists: ${admin.full_name}`);
        skipCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`📊 Seeding Summary:`);
    console.log(`   Created: ${successCount} new accounts`);
    console.log(`   Skipped: ${skipCount} existing accounts`);
    console.log(`   Total: ${ADMIN_ACCOUNTS.length} roles`);
    console.log("=".repeat(60));
    console.log(
      "\n⚠️  IMPORTANT: Ubah password semua akun setelah login pertama kali!"
    );
    console.log(
      "💡 Untuk testing, password sementara untuk semua akun adalah: admin12345"
    );
    console.log("\n🎉 Admin seeding completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admins:", error.message);
    process.exit(1);
  }
}

seedAdmins();
