/**
 * TEST PASSWORD - Check if passwords from seeder work
 */

const { sequelize } = require("../src/config/database");
const { Admin } = require("../src/models");
const bcrypt = require("bcryptjs");

async function testPasswords() {
  try {
    console.log("🔐 Testing Admin Passwords...\n");

    await sequelize.authenticate();

    const testCases = [
      { phone: "6281234567808", password: "admin123", role: "Super Admin" },
      {
        phone: "6281234567807",
        password: "superwa123",
        role: "Super WA Admin",
      },
      {
        phone: "6281234567806",
        password: "superinventory123",
        role: "Super Inventory",
      },
      {
        phone: "6281234567805",
        password: "supercashier123",
        role: "Super Cashier",
      },
      { phone: "6281234567804", password: "finance123", role: "Finance Admin" },
      {
        phone: "6281234567803",
        password: "inventory123",
        role: "Inventory Admin",
      },
      { phone: "6281234567802", password: "wa123", role: "WA Admin" },
      { phone: "6281234567801", password: "kasir123", role: "Kasir" },
    ];

    console.log("═".repeat(80));
    console.log(
      "Role                    | Phone           | Password Correct?"
    );
    console.log("═".repeat(80));

    for (const test of testCases) {
      const admin = await Admin.findOne({
        where: { phone_number: test.phone },
      });

      if (!admin) {
        console.log(`${test.role.padEnd(23)} | ${test.phone} | ❌ NOT FOUND`);
        continue;
      }

      const isValid = await bcrypt.compare(test.password, admin.password_hash);

      if (isValid) {
        console.log(`${test.role.padEnd(23)} | ${test.phone} | ✅ VALID`);
      } else {
        console.log(
          `${test.role.padEnd(23)} | ${test.phone} | ❌ WRONG PASSWORD`
        );
      }
    }

    console.log("═".repeat(80));

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testPasswords();
