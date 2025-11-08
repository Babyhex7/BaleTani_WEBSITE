/**
 * CHECK ADMIN ROLES SCRIPT
 * Script untuk mengecek apakah 8 admin dengan role berbeda sudah ada di database
 */

const { sequelize } = require("../src/config/database");
const { Admin, Role } = require("../src/models");

async function checkAdminRoles() {
  try {
    console.log("🔍 Checking Admin Roles Status...\n");

    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Define expected admins (gunakan format 62 karena dinormalisasi di database)
    const expectedAdmins = [
      { phone: "6281234567808", role_code: "super_admin", name: "Super Admin" },
      {
        phone: "6281234567807",
        role_code: "super_whatsapp_admin",
        name: "Super WhatsApp Admin",
      },
      {
        phone: "6281234567806",
        role_code: "super_inventory_admin",
        name: "Super Inventory Admin",
      },
      {
        phone: "6281234567805",
        role_code: "super_cashier",
        name: "Super Cashier",
      },
      {
        phone: "6281234567804",
        role_code: "finance_admin",
        name: "Finance Admin",
      },
      {
        phone: "6281234567803",
        role_code: "inventory_admin",
        name: "Inventory Admin",
      },
      {
        phone: "6281234567802",
        role_code: "whatsapp_admin",
        name: "WhatsApp Admin",
      },
      { phone: "6281234567801", role_code: "cashier", name: "Kasir" },
    ];

    // Check each admin
    console.log("📊 Checking Admin Accounts:\n");
    console.log("═".repeat(80));
    console.log(
      "Phone Number    | Full Name                 | Role Code              | Status"
    );
    console.log("═".repeat(80));

    const results = [];

    for (const expected of expectedAdmins) {
      const admin = await Admin.findOne({
        where: { phone_number: expected.phone },
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "role_name", "description"],
          },
        ],
      });

      if (!admin) {
        console.log(
          `${expected.phone} | ${expected.name.padEnd(
            25
          )} | ${expected.role_code.padEnd(22)} | ❌ NOT FOUND`
        );
        results.push({
          phone: expected.phone,
          status: "missing",
          expected_role: expected.role_code,
        });
      } else if (!admin.role) {
        console.log(
          `${expected.phone} | ${admin.full_name.padEnd(25)} | ${" ".repeat(
            22
          )} | ⚠️  NO ROLE`
        );
        results.push({
          phone: expected.phone,
          status: "no_role",
          admin_id: admin.id,
          expected_role: expected.role_code,
        });
      } else if (admin.role.role_name !== expected.role_code) {
        console.log(
          `${expected.phone} | ${admin.full_name.padEnd(
            25
          )} | ${admin.role.role_name.padEnd(22)} | ⚠️  WRONG ROLE`
        );
        results.push({
          phone: expected.phone,
          status: "wrong_role",
          admin_id: admin.id,
          current_role: admin.role.role_name,
          expected_role: expected.role_code,
        });
      } else {
        console.log(
          `${expected.phone} | ${admin.full_name.padEnd(
            25
          )} | ${admin.role.role_name.padEnd(22)} | ✅ OK`
        );
        results.push({
          phone: expected.phone,
          status: "ok",
          admin_id: admin.id,
          role: admin.role.role_name,
        });
      }
    }

    console.log("═".repeat(80));
    console.log("");

    // Summary
    const okCount = results.filter((r) => r.status === "ok").length;
    const missingCount = results.filter((r) => r.status === "missing").length;
    const noRoleCount = results.filter((r) => r.status === "no_role").length;
    const wrongRoleCount = results.filter(
      (r) => r.status === "wrong_role"
    ).length;

    console.log("📈 Summary:");
    console.log(`✅ OK:         ${okCount}/8`);
    console.log(`❌ Missing:    ${missingCount}/8`);
    console.log(`⚠️  No Role:   ${noRoleCount}/8`);
    console.log(`⚠️  Wrong Role: ${wrongRoleCount}/8`);
    console.log("");

    // Recommendations
    if (okCount === 8) {
      console.log("🎉 Perfect! All 8 admin accounts are ready for testing!");
      console.log(
        "✅ You can now run the login tests in api-tests/10-role-login-test.http"
      );
    } else {
      console.log("⚠️  Action Required:\n");

      if (missingCount > 0) {
        console.log("❌ Missing Admins - Need to create:");
        results
          .filter((r) => r.status === "missing")
          .forEach((r) => {
            console.log(`   - Phone: ${r.phone}, Role: ${r.expected_role}`);
          });
        console.log("\n   Run: node seeders/adminSeeder.js\n");
      }

      if (noRoleCount > 0) {
        console.log("⚠️  Admins Without Role - Need to assign role:");
        results
          .filter((r) => r.status === "no_role")
          .forEach((r) => {
            console.log(
              `   - Phone: ${r.phone}, Expected Role: ${r.expected_role}`
            );
          });
        console.log("\n   Need to update admin.role_id in database\n");
      }

      if (wrongRoleCount > 0) {
        console.log("⚠️  Admins with Wrong Role - Need to update:");
        results
          .filter((r) => r.status === "wrong_role")
          .forEach((r) => {
            console.log(
              `   - Phone: ${r.phone}, Current: ${r.current_role}, Expected: ${r.expected_role}`
            );
          });
        console.log("\n   Need to update admin.role_id in database\n");
      }
    }

    await sequelize.close();
    process.exit(okCount === 8 ? 0 : 1);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run check
checkAdminRoles();
