/**
 * ADMIN DUMMY DATA SEEDER
 * Membuat 8 admin dengan 8 role berbeda untuk testing
 * Setiap admin punya username, email, password yang mudah diingat
 */

const bcrypt = require("bcryptjs");
const { Admin, Role } = require("../src/models");

// Dummy admin data untuk testing
const dummyAdmins = [
  {
    full_name: "Budi Santoso",
    phone_number: "081234567801",
    password: "kasir123", // Password akan di-hash
    role_name: "cashier",
  },
  {
    full_name: "Siti Aminah",
    phone_number: "081234567802",
    password: "wa123",
    role_name: "whatsapp_admin",
  },
  {
    full_name: "Joko Widodo",
    phone_number: "081234567803",
    password: "inventory123",
    role_name: "inventory_admin",
  },
  {
    full_name: "Sri Mulyani",
    phone_number: "081234567804",
    password: "finance123",
    role_name: "finance_admin",
  },
  {
    full_name: "Agus Supriadi",
    phone_number: "081234567805",
    password: "superkasir123",
    role_name: "super_cashier",
  },
  {
    full_name: "Dewi Lestari",
    phone_number: "081234567806",
    password: "superwa123",
    role_name: "super_whatsapp_admin",
  },
  {
    full_name: "Ahmad Dahlan",
    phone_number: "081234567807",
    password: "superinventory123",
    role_name: "super_inventory_admin",
  },
  {
    full_name: "Admin Utama",
    phone_number: "081234567808",
    password: "admin123",
    role_name: "super_admin",
  },
];

async function seedDummyAdmins() {
  try {
    console.log("🔄 Seeding dummy admin users...\n");

    for (const admin of dummyAdmins) {
      console.log(`📝 Creating admin: ${admin.phone_number}`);

      // Cari role berdasarkan role_name
      const role = await Role.findOne({
        where: { role_name: admin.role_name },
      });

      if (!role) {
        console.log(`⚠️  Role ${admin.role_name} not found, skipping...\n`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // Buat atau update admin - gunakan phone_number sebagai unique identifier
      const [createdAdmin, created] = await Admin.findOrCreate({
        where: { phone_number: admin.phone_number },
        defaults: {
          full_name: admin.full_name,
          phone_number: admin.phone_number,
          password_hash: hashedPassword,
          role_id: role.id,
          is_active: true,
        },
      });

      if (created) {
        console.log(`   ✅ Created: ${admin.full_name}`);
        console.log(`   � Phone: ${admin.phone_number}`);
        console.log(`   🔑 Password: ${admin.password}`);
        console.log(`   👤 Role: ${admin.role_name}\n`);
      } else {
        console.log(`   ⚠️  Admin ${admin.phone_number} already exists\n`);
      }
    }

    console.log("\n✅ Dummy admins seeded successfully!");
    console.log("\n📋 LOGIN CREDENTIALS:");
    console.log("=".repeat(60));
    dummyAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.role_name.toUpperCase()}`);
      console.log(`   Phone: ${admin.phone_number}`);
      console.log(`   Password: ${admin.password}`);
      console.log("-".repeat(60));
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding dummy admins:", error);
    process.exit(1);
  }
}

// Jalankan seeder
seedDummyAdmins();
