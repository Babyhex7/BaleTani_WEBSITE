/**
 * MASTER SEEDER untuk RBAC
 * Menjalankan semua seeder secara berurutan
 *
 * Urutan eksekusi:
 * 1. Create permissions table
 * 2. Create role_permissions table
 * 3. Update roles (8 admin roles)
 * 4. Seed role-permission mapping
 * 5. Seed dummy admin users
 */

const { execSync } = require("child_process");
const path = require("path");

const scripts = [
  {
    name: "Create Permissions Table",
    path: path.join(__dirname, "createPermissionsTable.js"),
  },
  {
    name: "Create Role Permissions Table",
    path: path.join(__dirname, "createRolePermissionsTable.js"),
  },
  {
    name: "Update Roles (8 Admin Roles)",
    path: path.join(__dirname, "updateRolesFor8Admins.js"),
  },
  {
    name: "Seed Role Permissions Mapping",
    path: path.join(__dirname, "../seeders/rolePermissionSeeder.js"),
  },
  {
    name: "Seed Dummy Admin Users",
    path: path.join(__dirname, "../seeders/adminDummySeeder.js"),
  },
];

async function runAllSeeders() {
  console.log("🚀 Starting RBAC Setup...\n");
  console.log("=".repeat(60));

  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    console.log(`\n[${i + 1}/${scripts.length}] ${script.name}`);
    console.log("-".repeat(60));

    try {
      execSync(`node "${script.path}"`, { stdio: "inherit" });
    } catch (error) {
      console.error(`\n❌ Error running: ${script.name}`);
      console.error(error.message);
      process.exit(1);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ RBAC Setup Completed Successfully!");
  console.log("=".repeat(60));
  console.log("\n📝 Next Steps:");
  console.log("1. Backend server siap dengan RBAC");
  console.log("2. Gunakan credential dari output di atas untuk login");
  console.log("3. Test permission di setiap endpoint");
  console.log("\n");
}

runAllSeeders().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
