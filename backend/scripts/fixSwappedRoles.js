/**
 * FIX SWAPPED ROLES SCRIPT
 * Fix 2 admin yang role-nya tertukar
 */

const { sequelize } = require("../src/config/database");
const { Admin, Role } = require("../src/models");

async function fixSwappedRoles() {
  try {
    console.log("🔧 Fixing Swapped Roles...\n");

    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Get roles
    const superWARole = await Role.findOne({
      where: { role_name: "super_whatsapp_admin" },
    });
    const superInvRole = await Role.findOne({
      where: { role_name: "super_inventory_admin" },
    });

    if (!superWARole || !superInvRole) {
      console.error("❌ Roles not found in database!");
      process.exit(1);
    }

    console.log("📋 Roles Found:");
    console.log(`   - super_whatsapp_admin: ${superWARole.id}`);
    console.log(`   - super_inventory_admin: ${superInvRole.id}`);
    console.log("");

    // Fix admin 6281234567807 → should be super_whatsapp_admin
    const admin1 = await Admin.findOne({
      where: { phone_number: "6281234567807" },
      include: [{ model: Role, as: "role" }],
    });

    if (admin1) {
      console.log(`🔄 Updating ${admin1.full_name} (${admin1.phone_number})`);
      console.log(`   Current role: ${admin1.role.role_name}`);
      console.log(`   New role: super_whatsapp_admin`);

      await admin1.update({ role_id: superWARole.id });
      console.log(`   ✅ Updated successfully\n`);
    } else {
      console.log(`⚠️  Admin 6281234567807 not found\n`);
    }

    // Fix admin 6281234567806 → should be super_inventory_admin
    const admin2 = await Admin.findOne({
      where: { phone_number: "6281234567806" },
      include: [{ model: Role, as: "role" }],
    });

    if (admin2) {
      console.log(`🔄 Updating ${admin2.full_name} (${admin2.phone_number})`);
      console.log(`   Current role: ${admin2.role.role_name}`);
      console.log(`   New role: super_inventory_admin`);

      await admin2.update({ role_id: superInvRole.id });
      console.log(`   ✅ Updated successfully\n`);
    } else {
      console.log(`⚠️  Admin 6281234567806 not found\n`);
    }

    console.log("🎉 Role fix completed!");
    console.log("\n✅ Now all 8 admins should have correct roles.");
    console.log("   Run: node scripts/checkAdminRoles.js to verify\n");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run fix
fixSwappedRoles();
