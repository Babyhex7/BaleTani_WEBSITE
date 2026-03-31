/**
 * Test Password Hashing Fix
 * Verify customer login works correctly
 */

const bcrypt = require("bcryptjs");
const { Customer } = require("../src/models");

const testCustomerLogin = async () => {
  try {
    console.log("🔍 Testing Customer Login...\n");

    // Find customer
    const customer = await Customer.findOne({
      where: { phone_number: "6281234567890" },
    });

    if (!customer) {
      console.log("❌ Customer not found!");
      process.exit(1);
    }

    console.log(`✅ Found customer: ${customer.full_name}`);
    console.log(`   Phone: ${customer.phone_number}`);
    console.log(`   Password hash (first 20 chars): ${customer.password_hash.substring(0, 20)}...`);

    // Test password comparison
    const testPassword = "customer12345";
    const isMatch = await customer.comparePassword(testPassword);

    if (isMatch) {
      console.log(`\n✅ PASSWORD VALIDATION SUCCESS!`);
      console.log(`   Password "${testPassword}" matches stored hash`);
      console.log(`   ✓ Login should work correctly`);
    } else {
      console.log(`\n❌ PASSWORD VALIDATION FAILED!`);
      console.log(`   Password "${testPassword}" does NOT match stored hash`);
      console.log(`   ✗ Login will fail with this password`);
      console.log(`\n💡 Solution: Re-seed the customer data:`);
      console.log(`   npm run seed:comprehensive`);
    }

    process.exit(isMatch ? 0 : 1);
  } catch (error) {
    console.error("❌ Test error:", error.message);
    process.exit(1);
  }
};

testCustomerLogin();
