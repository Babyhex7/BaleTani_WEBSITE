/**
 * ADMIN SEEDER - 8 ROLES
 * Create 8 admin accounts dengan role berbeda untuk testing RBAC
 */

const { sequelize } = require("../src/config/database");
const { Admin, Role } = require("../src/models");
const bcrypt = require("bcryptjs");

async function seedAdmins() {
  try {
    console.log("🌱 Starting Admin Seeder...\n");

    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Data admin yang akan dibuat (gunakan format 62 karena dinormalisasi)
    const adminsData = [
      {
        phone_number: "6281234567808",
        full_name: "Super Admin",
        password: "admin123",
        role_code: "super_admin",
      },
      {
        phone_number: "6281234567807",
        full_name: "Super WhatsApp Admin",
        password: "superwa123",
        role_code: "super_whatsapp_admin",
      },
      {
        phone_number: "6281234567806",
        full_name: "Super Inventory Admin",
        password: "superinventory123",
        role_code: "super_inventory_admin",
      },
      {
        phone_number: "6281234567805",
        full_name: "Super Kasir",
        password: "supercashier123",
        role_code: "super_cashier",
      },
      {
        phone_number: "6281234567804",
        full_name: "Admin Finance",
        password: "finance123",
        role_code: "finance_admin",
      },
      {
        phone_number: "6281234567803",
        full_name: "Admin Inventory",
        password: "inventory123",
        role_code: "inventory_admin",
      },
      {
        phone_number: "6281234567802",
        full_name: "Admin WhatsApp",
        password: "wa123",
        role_code: "whatsapp_admin",
      },
      {
        phone_number: "6281234567801",
        full_name: "Kasir 1",
        password: "kasir123",
        role_code: "cashier",
      },
    ];

    console.log("📊 Creating 8 Admin Accounts:\n");
    console.log("═".repeat(80));

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const adminData of adminsData) {
      try {
        // Cek apakah admin sudah ada
        const existingAdmin = await Admin.findOne({
          where: { phone_number: adminData.phone_number },
        });

        if (existingAdmin) {
          console.log(
            `⏭️  ${adminData.full_name.padEnd(25)} | ${
              adminData.phone_number
            } | SKIPPED (already exists)`
          );
          skippedCount++;
          continue;
        }

        // Cari role berdasarkan role_code
        const role = await Role.findOne({
          where: { role_name: adminData.role_code },
        });

        if (!role) {
          console.log(
            `❌ ${adminData.full_name.padEnd(25)} | ${
              adminData.phone_number
            } | ERROR (role '${adminData.role_code}' not found)`
          );
          errorCount++;
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(adminData.password, salt);

        // Create admin
        await Admin.create({
          phone_number: adminData.phone_number,
          full_name: adminData.full_name,
          password_hash: password_hash,
          role_id: role.id,
          is_active: true,
        });

        console.log(
          `✅ ${adminData.full_name.padEnd(25)} | ${
            adminData.phone_number
          } | CREATED`
        );
        createdCount++;
      } catch (error) {
        console.log(
          `❌ ${adminData.full_name.padEnd(25)} | ${
            adminData.phone_number
          } | ERROR: ${error.message}`
        );
        errorCount++;
      }
    }

    console.log("═".repeat(80));
    console.log("\n📈 Summary:");
    console.log(`✅ Created:  ${createdCount}/8`);
    console.log(`⏭️  Skipped:  ${skippedCount}/8`);
    console.log(`❌ Errors:   ${errorCount}/8`);
    console.log("");

    if (errorCount > 0) {
      console.log("⚠️  Some admins failed to create!");
      console.log("   Please check if roles exist by running:");
      console.log("   node seeders/roleSeeder.js\n");
    } else if (createdCount > 0) {
      console.log("🎉 Admin seeding completed successfully!");
      console.log("\n📝 Test Credentials:");
      console.log("═".repeat(80));
      adminsData.forEach((admin) => {
        console.log(
          `${admin.role_code.padEnd(25)} | ${admin.phone_number} | ${
            admin.password
          }`
        );
      });
      console.log("═".repeat(80));
      console.log(
        "\n✅ You can now test login in: api-tests/10-role-login-test.http\n"
      );
    } else {
      console.log("ℹ️  All admins already exist. No action taken.\n");
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run seeder
seedAdmins();
