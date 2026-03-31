/**
 * Fix Customer Password - Reset Customer Table
 * Menghapus dan re-seed customer dengan password hashing yang benar
 */

const { sequelize } = require("../src/config/database");
const { Customer } = require("../src/models");

const fixCustomerPassword = async () => {
  try {
    console.log("🔧 Fixing Customer Password Hash Issue...\n");

    // Option 1: Delete semua customer (safe approach)
    const deletedCount = await Customer.destroy({
      where: {}, // Delete all
      force: true,
    });

    console.log(`✅ Deleted ${deletedCount} customer records`);
    console.log(`\n📝 Next step: Run the seeder to recreate customers with correct password hashing`);
    console.log(`\n   Run this command:\n`);
    console.log(`   npm run seed:comprehensive`);
    console.log(`\n✨ After seeding, login dengan:\n`);
    console.log(`   Phone: 6281234567890 atau 08123456789 atau +628123456789`);
    console.log(`   Password: customer12345\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

fixCustomerPassword();
