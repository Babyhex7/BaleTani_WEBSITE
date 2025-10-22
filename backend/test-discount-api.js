const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";
let authToken = "";
let createdDiscountId = null;
let testProductIds = [];

// Test configuration
const testDiscount = {
  name: "Flash Sale Akhir Tahun",
  description: "Diskon spesial untuk produk pilihan",
  discount_type: "percentage",
  discount_value: 25,
  start_date: new Date("2024-12-01"),
  end_date: new Date("2024-12-31"),
  is_active: true,
};

const updatedDiscount = {
  name: "Flash Sale Extended",
  discount_type: "percentage",
  discount_value: 30,
  end_date: new Date("2025-01-15"),
};

// Helper function to format response
function logResponse(stepNumber, stepName, response, error = null) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`STEP ${stepNumber}: ${stepName}`);
  console.log(`${"=".repeat(60)}`);

  if (error) {
    console.log("❌ ERROR:", error.response?.status || "Network Error");
    console.log("Message:", error.response?.data?.message || error.message);
    console.log("Data:", JSON.stringify(error.response?.data, null, 2));
  } else {
    console.log("✅ Status:", response.status);
    console.log("Success:", response.data.success);
    console.log("Message:", response.data.message || "No message");
    console.log("Data:", JSON.stringify(response.data.data, null, 2));
    if (response.data.pagination) {
      console.log(
        "Pagination:",
        JSON.stringify(response.data.pagination, null, 2)
      );
    }
  }
}

// Main test function
async function runDiscountAPITests() {
  console.log("\n🚀 Starting Discount API Tests...\n");

  try {
    // STEP 1: Login as admin
    console.log("Step 1: Logging in as admin...");
    const loginResponse = await axios.post(`${BASE_URL}/admin/auth/login`, {
      email: "admin@baletani.com",
      password: "admin123",
    });

    authToken = loginResponse.data.token;
    logResponse(1, "Admin Login", loginResponse); // Set default headers
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

    // STEP 2: Create test products for discount assignment
    console.log("\nStep 2: Creating test products...");
    const product1 = await axios.post(`${BASE_URL}/admin/products`, {
      name: "Test Product Discount 1",
      sku: "TEST-DISC-001",
      category_id: 1,
      selling_price: 50000,
      purchase_price: 40000,
      total_stock: 50,
      min_stock: 10,
      unit: "kg",
    });

    const product2 = await axios.post(`${BASE_URL}/admin/products`, {
      name: "Test Product Discount 2",
      sku: "TEST-DISC-002",
      category_id: 1,
      selling_price: 75000,
      purchase_price: 60000,
      total_stock: 30,
      min_stock: 5,
      unit: "kg",
    });

    testProductIds = [product1.data.data.id, product2.data.data.id];
    logResponse(2, "Create Test Products", product1);

    // STEP 3: Create Discount
    console.log("\nStep 3: Creating discount...");
    const createResponse = await axios.post(
      `${BASE_URL}/admin/discounts`,
      testDiscount
    );

    createdDiscountId = createResponse.data.data.id;
    logResponse(3, "Create Discount", createResponse);

    // STEP 4: Get All Discounts
    console.log("\nStep 4: Getting all discounts...");
    const getAllResponse = await axios.get(`${BASE_URL}/admin/discounts`);
    logResponse(4, "Get All Discounts", getAllResponse);

    // STEP 5: Get Discount by ID
    console.log("\nStep 5: Getting discount by ID...");
    const getByIdResponse = await axios.get(
      `${BASE_URL}/admin/discounts/${createdDiscountId}`
    );
    logResponse(5, "Get Discount by ID", getByIdResponse);

    // STEP 6: Assign Products to Discount
    console.log("\nStep 6: Assigning products to discount...");
    const assignResponse = await axios.post(
      `${BASE_URL}/admin/discounts/${createdDiscountId}/products`,
      { product_ids: testProductIds }
    );
    logResponse(6, "Assign Products to Discount", assignResponse);

    // STEP 7: Verify Products Assigned
    console.log("\nStep 7: Verifying products assigned...");
    const verifyAssignResponse = await axios.get(
      `${BASE_URL}/admin/discounts/${createdDiscountId}`
    );
    logResponse(7, "Verify Products Assigned", verifyAssignResponse);

    // STEP 8: Update Discount
    console.log("\nStep 8: Updating discount...");
    const updateResponse = await axios.put(
      `${BASE_URL}/admin/discounts/${createdDiscountId}`,
      updatedDiscount
    );
    logResponse(8, "Update Discount", updateResponse);

    // STEP 9: Filter by Discount Type
    console.log("\nStep 9: Filtering by discount type...");
    const filterTypeResponse = await axios.get(
      `${BASE_URL}/admin/discounts?discount_type=percentage`
    );
    logResponse(9, "Filter by Type", filterTypeResponse);

    // STEP 10: Filter by Status
    console.log("\nStep 10: Filtering by status (active)...");
    const filterStatusResponse = await axios.get(
      `${BASE_URL}/admin/discounts?status=active`
    );
    logResponse(10, "Filter by Status", filterStatusResponse);

    // STEP 11: Search Discounts
    console.log("\nStep 11: Searching discounts...");
    const searchResponse = await axios.get(
      `${BASE_URL}/admin/discounts?search=Flash`
    );
    logResponse(11, "Search Discounts", searchResponse);

    // STEP 12: Remove One Product from Discount
    console.log("\nStep 12: Removing one product from discount...");
    const removeProductResponse = await axios.delete(
      `${BASE_URL}/admin/discounts/${createdDiscountId}/products/${testProductIds[0]}`
    );
    logResponse(12, "Remove Product from Discount", removeProductResponse);

    // STEP 13: Verify Product Removed
    console.log("\nStep 13: Verifying product removed...");
    const verifyRemoveResponse = await axios.get(
      `${BASE_URL}/admin/discounts/${createdDiscountId}`
    );
    logResponse(13, "Verify Product Removed", verifyRemoveResponse);

    // STEP 14: Test Fixed Discount Type
    console.log("\nStep 14: Creating fixed discount...");
    const fixedDiscount = {
      name: "Fixed Discount Test",
      description: "Test diskon dengan nilai tetap",
      discount_type: "fixed",
      discount_value: 10000,
      start_date: new Date("2024-12-01"),
      end_date: new Date("2024-12-31"),
      is_active: true,
    };

    const fixedDiscountResponse = await axios.post(
      `${BASE_URL}/admin/discounts`,
      fixedDiscount
    );
    logResponse(14, "Create Fixed Discount", fixedDiscountResponse);

    // STEP 15: Soft Delete Discount
    console.log("\nStep 15: Soft deleting discount...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/admin/discounts/${createdDiscountId}`
    );
    logResponse(15, "Soft Delete Discount", deleteResponse);

    // STEP 16: Verify Soft Delete
    console.log("\nStep 16: Verifying soft delete...");
    const verifyDeleteResponse = await axios.get(
      `${BASE_URL}/admin/discounts/${createdDiscountId}`
    );
    logResponse(16, "Verify Soft Delete", verifyDeleteResponse);

    // STEP 17: Test Validation - Invalid Percentage
    console.log("\nStep 17: Testing validation (invalid percentage)...");
    try {
      await axios.post(`${BASE_URL}/admin/discounts`, {
        name: "Invalid Discount",
        discount_type: "percentage",
        discount_value: 150, // Invalid: > 100
        start_date: new Date("2024-12-01"),
        end_date: new Date("2024-12-31"),
      });
      console.log("⚠️ Warning: Validation test did not fail as expected");
    } catch (validationError) {
      logResponse(
        17,
        "Test Validation (Expected Failure)",
        null,
        validationError
      );
    }

    // STEP 18: Test Validation - Invalid Date Range
    console.log("\nStep 18: Testing validation (invalid date range)...");
    try {
      await axios.post(`${BASE_URL}/admin/discounts`, {
        name: "Invalid Date Discount",
        discount_type: "percentage",
        discount_value: 20,
        start_date: new Date("2024-12-31"),
        end_date: new Date("2024-12-01"), // End before start
      });
      console.log("⚠️ Warning: Date validation test did not fail as expected");
    } catch (dateValidationError) {
      logResponse(
        18,
        "Test Date Validation (Expected Failure)",
        null,
        dateValidationError
      );
    }

    // Final cleanup
    console.log("\n🧹 Cleaning up test data...");

    // Delete test discounts
    await axios.delete(`${BASE_URL}/admin/discounts/${createdDiscountId}`);
    await axios.delete(
      `${BASE_URL}/admin/discounts/${fixedDiscountResponse.data.data.id}`
    );

    // Delete test products
    for (const productId of testProductIds) {
      await axios.delete(`${BASE_URL}/admin/products/${productId}`);
    }

    console.log("✅ Test data cleaned up");

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL DISCOUNT API TESTS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    logResponse("ERROR", "Test Failed", null, error);
    console.log("\n❌ Tests stopped due to error\n");

    // Attempt cleanup even on error
    if (createdDiscountId) {
      try {
        await axios.delete(`${BASE_URL}/admin/discounts/${createdDiscountId}`);
      } catch (e) {}
    }

    for (const productId of testProductIds) {
      try {
        await axios.delete(`${BASE_URL}/admin/products/${productId}`);
      } catch (e) {}
    }
  }
}

// Run tests
runDiscountAPITests();
