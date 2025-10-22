const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";
let authToken = "";
let createdCategoryId = null;

// Test configuration
const testCategory = {
  name: "Test Sayuran Organik",
  description: "Kategori untuk sayuran organik segar",
  icon: "🥬",
};

const updatedCategory = {
  name: "Test Sayuran Premium",
  description: "Kategori untuk sayuran premium pilihan",
  icon: "🥗",
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
async function runCategoryAPITests() {
  console.log("\n🚀 Starting Category API Tests...\n");

  try {
    // STEP 1: Login as admin
    console.log("Step 1: Logging in as admin...");
    const loginResponse = await axios.post(`${BASE_URL}/admin/auth/login`, {
      email: "admin@baletani.com",
      password: "admin123",
    });

    authToken = loginResponse.data.token;
    logResponse(1, "Admin Login", loginResponse);

    // Set default headers for authenticated requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

    // STEP 2: Create Category
    console.log("\nStep 2: Creating category...");
    const createResponse = await axios.post(
      `${BASE_URL}/admin/categories`,
      testCategory
    );

    createdCategoryId = createResponse.data.data.id;
    logResponse(2, "Create Category", createResponse);

    // STEP 3: Get All Categories
    console.log("\nStep 3: Getting all categories...");
    const getAllResponse = await axios.get(`${BASE_URL}/admin/categories`);
    logResponse(3, "Get All Categories", getAllResponse);

    // STEP 4: Get Category by ID
    console.log("\nStep 4: Getting category by ID...");
    const getByIdResponse = await axios.get(
      `${BASE_URL}/admin/categories/${createdCategoryId}`
    );
    logResponse(4, "Get Category by ID", getByIdResponse);

    // STEP 5: Update Category
    console.log("\nStep 5: Updating category...");
    const updateResponse = await axios.put(
      `${BASE_URL}/admin/categories/${createdCategoryId}`,
      updatedCategory
    );
    logResponse(5, "Update Category", updateResponse);

    // STEP 6: Search Categories
    console.log("\nStep 6: Searching categories...");
    const searchResponse = await axios.get(
      `${BASE_URL}/admin/categories?search=Premium`
    );
    logResponse(6, "Search Categories", searchResponse);

    // STEP 7: Filter by Active Status
    console.log("\nStep 7: Filtering active categories...");
    const filterResponse = await axios.get(
      `${BASE_URL}/admin/categories?is_active=true`
    );
    logResponse(7, "Filter Active Categories", filterResponse);

    // STEP 8: Soft Delete Category
    console.log("\nStep 8: Soft deleting category...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/admin/categories/${createdCategoryId}`
    );
    logResponse(8, "Soft Delete Category", deleteResponse);

    // STEP 9: Verify Soft Delete
    console.log("\nStep 9: Verifying soft delete...");
    const verifyDeleteResponse = await axios.get(
      `${BASE_URL}/admin/categories/${createdCategoryId}`
    );
    logResponse(9, "Verify Soft Delete", verifyDeleteResponse);

    // STEP 10: Restore Category
    console.log("\nStep 10: Restoring category...");
    const restoreResponse = await axios.post(
      `${BASE_URL}/admin/categories/${createdCategoryId}/restore`
    );
    logResponse(10, "Restore Category", restoreResponse);

    // STEP 11: Verify Restore
    console.log("\nStep 11: Verifying restore...");
    const verifyRestoreResponse = await axios.get(
      `${BASE_URL}/admin/categories/${createdCategoryId}`
    );
    logResponse(11, "Verify Restore", verifyRestoreResponse);

    // STEP 12: Test Pagination
    console.log("\nStep 12: Testing pagination...");
    const paginationResponse = await axios.get(
      `${BASE_URL}/admin/categories?page=1&limit=5`
    );
    logResponse(12, "Test Pagination", paginationResponse);

    // Final cleanup - delete test category
    console.log("\n🧹 Cleaning up test data...");
    await axios.delete(`${BASE_URL}/admin/categories/${createdCategoryId}`);
    console.log("✅ Test category deleted");

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL CATEGORY API TESTS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    logResponse("ERROR", "Test Failed", null, error);
    console.log("\n❌ Tests stopped due to error\n");
  }
}

// Run tests
runCategoryAPITests();
