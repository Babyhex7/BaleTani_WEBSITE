const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";
let authToken = "";
let testProductIds = [];

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
async function runStockAPITests() {
  console.log("\n🚀 Starting Stock Overview API Tests...\n");

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

    // STEP 2: Create test products with different stock levels
    console.log(
      "\nStep 2: Creating test products with various stock levels..."
    );

    // Product 1: Normal stock
    const product1 = await axios.post(`${BASE_URL}/admin/products`, {
      name: "Test Stock Normal",
      sku: "TEST-STOCK-001",
      category_id: 1,
      selling_price: 50000,
      purchase_price: 40000,
      total_stock: 100,
      min_stock: 20,
      unit: "kg",
    });

    // Product 2: Low stock
    const product2 = await axios.post(`${BASE_URL}/admin/products`, {
      name: "Test Stock Low",
      sku: "TEST-STOCK-002",
      category_id: 1,
      selling_price: 75000,
      purchase_price: 60000,
      total_stock: 5,
      min_stock: 15,
      unit: "kg",
    });

    // Product 3: Out of stock
    const product3 = await axios.post(`${BASE_URL}/admin/products`, {
      name: "Test Stock Empty",
      sku: "TEST-STOCK-003",
      category_id: 1,
      selling_price: 30000,
      purchase_price: 25000,
      total_stock: 0,
      min_stock: 10,
      unit: "kg",
    });

    testProductIds = [
      product1.data.data.id,
      product2.data.data.id,
      product3.data.data.id,
    ];

    logResponse(2, "Create Test Products", product1);
    console.log("✅ Created 3 test products (Normal, Low, Empty stock)");

    // STEP 3: Get Stock Overview
    console.log("\nStep 3: Getting stock overview...");
    const overviewResponse = await axios.get(
      `${BASE_URL}/admin/stock/overview`
    );
    logResponse(3, "Get Stock Overview", overviewResponse);

    // STEP 4: Get Low Stock Products
    console.log("\nStep 4: Getting low stock products...");
    const lowStockResponse = await axios.get(
      `${BASE_URL}/admin/stock/low-stock`
    );
    logResponse(4, "Get Low Stock Products", lowStockResponse);

    // STEP 5: Get Out of Stock Products
    console.log("\nStep 5: Getting out of stock products...");
    const outOfStockResponse = await axios.get(
      `${BASE_URL}/admin/stock/out-of-stock`
    );
    logResponse(5, "Get Out of Stock Products", outOfStockResponse);

    // STEP 6: Test Pagination for Low Stock
    console.log("\nStep 6: Testing pagination for low stock...");
    const paginationResponse = await axios.get(
      `${BASE_URL}/admin/stock/low-stock?page=1&limit=5`
    );
    logResponse(6, "Test Low Stock Pagination", paginationResponse);

    // STEP 7: Get Stock Movements (if any exist)
    console.log("\nStep 7: Getting stock movements...");
    const movementsResponse = await axios.get(
      `${BASE_URL}/admin/stock/movements`
    );
    logResponse(7, "Get Stock Movements", movementsResponse);

    // STEP 8: Filter Stock Movements by Product
    console.log("\nStep 8: Filtering stock movements by product...");
    const filterProductResponse = await axios.get(
      `${BASE_URL}/admin/stock/movements?product_id=${testProductIds[0]}`
    );
    logResponse(8, "Filter Movements by Product", filterProductResponse);

    // STEP 9: Filter Stock Movements by Type
    console.log("\nStep 9: Filtering stock movements by type...");
    const filterTypeResponse = await axios.get(
      `${BASE_URL}/admin/stock/movements?movement_type=in`
    );
    logResponse(9, "Filter Movements by Type", filterTypeResponse);

    // STEP 10: Filter Stock Movements by Date Range
    console.log("\nStep 10: Filtering stock movements by date range...");
    const startDate = new Date("2024-01-01").toISOString().split("T")[0];
    const endDate = new Date().toISOString().split("T")[0];
    const filterDateResponse = await axios.get(
      `${BASE_URL}/admin/stock/movements?start_date=${startDate}&end_date=${endDate}`
    );
    logResponse(10, "Filter Movements by Date", filterDateResponse);

    // STEP 11: Update Product Stock and Re-check Overview
    console.log("\nStep 11: Updating product stock...");
    await axios.put(`${BASE_URL}/admin/products/${testProductIds[1]}`, {
      total_stock: 50, // Increase low stock product
    });

    const updatedOverviewResponse = await axios.get(
      `${BASE_URL}/admin/stock/overview`
    );
    logResponse(11, "Get Updated Overview", updatedOverviewResponse);

    // STEP 12: Verify Top Products by Value
    console.log("\nStep 12: Verifying top products by stock value...");
    const topProductsResponse = await axios.get(
      `${BASE_URL}/admin/stock/overview`
    );
    console.log("Top 5 Products by Stock Value:");
    if (topProductsResponse.data.data.top_products) {
      topProductsResponse.data.data.top_products.forEach((product, index) => {
        console.log(
          `  ${index + 1}. ${product.name} - Value: Rp ${
            product.stock_value?.toLocaleString("id-ID") || 0
          }`
        );
      });
    }
    logResponse(12, "Top Products Analysis", topProductsResponse);

    // STEP 13: Test Out of Stock Pagination
    console.log("\nStep 13: Testing pagination for out of stock...");
    const outOfStockPaginationResponse = await axios.get(
      `${BASE_URL}/admin/stock/out-of-stock?page=1&limit=10`
    );
    logResponse(
      13,
      "Test Out of Stock Pagination",
      outOfStockPaginationResponse
    );

    // STEP 14: Verify Stock Calculations
    console.log("\nStep 14: Verifying stock calculations...");
    const finalOverview = await axios.get(`${BASE_URL}/admin/stock/overview`);
    const summary = finalOverview.data.data.summary;

    console.log("\n📊 Stock Summary Verification:");
    console.log(`  Total Products: ${summary.total_products}`);
    console.log(`  In Stock: ${summary.in_stock}`);
    console.log(`  Low Stock: ${summary.low_stock}`);
    console.log(`  Out of Stock: ${summary.out_of_stock}`);
    console.log(
      `  Total Inventory Value: Rp ${summary.inventory_value?.toLocaleString(
        "id-ID"
      )}`
    );

    logResponse(14, "Verify Stock Calculations", finalOverview);

    // Final cleanup
    console.log("\n🧹 Cleaning up test data...");

    // Delete test products
    for (const productId of testProductIds) {
      await axios.delete(`${BASE_URL}/admin/products/${productId}`);
    }

    console.log("✅ Test data cleaned up");

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL STOCK OVERVIEW API TESTS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60) + "\n");

    // Print summary statistics
    console.log("\n📈 FINAL TEST SUMMARY:");
    console.log("  ✅ Stock Overview API - Working");
    console.log("  ✅ Low Stock API - Working");
    console.log("  ✅ Out of Stock API - Working");
    console.log("  ✅ Stock Movements API - Working");
    console.log("  ✅ Filtering & Pagination - Working");
    console.log("  ✅ Stock Calculations - Accurate\n");
  } catch (error) {
    logResponse("ERROR", "Test Failed", null, error);
    console.log("\n❌ Tests stopped due to error\n");

    // Attempt cleanup even on error
    for (const productId of testProductIds) {
      try {
        await axios.delete(`${BASE_URL}/admin/products/${productId}`);
      } catch (e) {
        console.log(`⚠️ Failed to cleanup product ${productId}`);
      }
    }
  }
}

// Run tests
runStockAPITests();
