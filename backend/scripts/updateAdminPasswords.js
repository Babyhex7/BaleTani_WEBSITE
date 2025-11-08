/**
 * UPDATE ADMIN PASSWORDS
 * Update password untuk 8 admin agar sesuai dengan test credentials
 */

const { sequelize } = require("../src/config/database");
const { Admin } = require("../src/models");
const bcrypt = require("bcryptjs");

async function updatePasswords() {
  try {
    console.log("🔑 Updating Admin Passwords...\n");

    await sequelize.authenticate();

    const updates = [
      { phone: "6281234567808", password: "admin123", name: "Super Admin" },
      {
        phone: "6281234567807",
        password: "superwa123",
        name: "Super WA Admin",
      },
      {
        phone: "6281234567806",
        password: "superinventory123",
        name: "Super Inventory",
      },
      {
        phone: "6281234567805",
        password: "supercashier123",
        name: "Super Cashier",
      },
      { phone: "6281234567804", password: "finance123", name: "Finance Admin" },
      {
        phone: "6281234567803",
        password: "inventory123",
        name: "Inventory Admin",
      },
      { phone: "6281234567802", password: "wa123", name: "WA Admin" },
      { phone: "6281234567801", password: "kasir123", name: "Kasir" },
    ];

    console.log("═".repeat(80));

    for (const update of updates) {
      const admin = await Admin.findOne({
        where: { phone_number: update.phone },
      });

      if (!admin) {
        console.log(
          `❌ ${update.name.padEnd(20)} | ${update.phone} | NOT FOUND`
        );
        continue;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(update.password, salt);

      // Update password
      await Admin.update(
        { password_hash },
        { where: { phone_number: update.phone } }
      );

      console.log(
        `✅ ${update.name.padEnd(20)} | ${update.phone} | Password: ${
          update.password
        }`
      );
    }

    console.log("═".repeat(80));
    console.log("\n🎉 All passwords updated successfully!");
    console.log("\n📝 You can now test login with these credentials:");
    console.log("   Phone: 081234567808, Password: admin123 (Super Admin)");
    console.log("   Phone: 081234567801, Password: kasir123 (Kasir)");
    console.log("   etc...\n");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

updatePasswords();
