const { sequelize } = require("../src/config/database");
const Role = require("../src/models/role.model");

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

async function seedRoles() {
  try {
    console.log("🔄 Seeding roles...");

    for (const roleData of ROLES) {
      const [role, created] = await Role.findOrCreate({
        where: { role_name: roleData.role_name },
        defaults: {
          role_name: roleData.role_name,
          description: roleData.description,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      if (created) {
        console.log(`✅ Created role: ${role.role_name}`);
      } else {
        console.log(`⏭️  Role already exists: ${role.role_name}`);
      }
    }

    console.log("🎉 Role seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding roles:", error.message);
    process.exit(1);
  }
}

seedRoles();
