/**
 * ================================================================
 * TEST CASE: CATEGORY & DISCOUNT MANAGEMENT
 * ================================================================
 * Testing CRUD operations for:
 * - Categories Management
 * - Discount Management
 * - Product-Discount Association
 *
 * Run: node test-category-discount.js
 * ================================================================
 */

const http = require("http");

// ============================================
// CONFIGURATION
// ============================================
const BASE_URL = "localhost";
const PORT = 5000;

// Test Data Storage
let authToken = "";
let testCategoryId = null;
let testDiscountId = null;
let testProductId = null;

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function printHeader(text) {
  console.log(`\n${colors.cyan}${"=".repeat(70)}${colors.reset}`);
  console.log(`${colors.cyan}  ${text}${colors.reset}`);
  console.log(`${colors.cyan}${"=".repeat(70)}${colors.reset}\n`);
}

function printResult(testName, success, data = null) {
  const icon = success ? "✓" : "✗";
  const color = success ? colors.green : colors.red;
  console.log(`${color}${icon} ${testName}${colors.reset}`);
  if (data && !success) {
    console.log(
      `  ${colors.yellow}Response:${colors.reset}`,
      JSON.stringify(data, null, 2)
    );
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// TEST CASES
// ============================================

/**
 * TEST 1: Admin Login
 */
async function testAdminLogin() {
  printHeader("TEST 1: Admin Authentication");

  const postData = {
    phone_number: "6282111111111",
    password: "admin123",
  };

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/auth/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await makeRequest(options, postData);
    const success = response.status === 200 && response.data.success;

    if (success && response.data.data.token) {
      authToken = response.data.data.token;
      printResult(`Login as ${response.data.data.user.full_name}`, true);
      console.log(`${colors.blue}  Token saved${colors.reset}`);
    } else {
      printResult("Admin Login", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Admin Login - Error", false, { error: error.message });
    return false;
  }
}

// ============================================
// CATEGORY TESTS
// ============================================

/**
 * TEST 2: Create Category
 */
async function testCreateCategory() {
  printHeader("TEST 2: Create Category");

  // Generate unique name with timestamp to avoid conflicts
  const timestamp = Date.now();
  const postData = {
    category_name: `Sayuran Segar Test ${timestamp}`,
    description: "Kategori untuk sayuran segar organik pilihan",
    is_active: true,
  };

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/categories",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options, postData);
    const success = response.status === 201;

    if (success && response.data.data) {
      testCategoryId = response.data.data.id;
      printResult("Create Category", true);
      console.log(
        `  ${colors.blue}Category ID:${colors.reset}`,
        testCategoryId
      );
      console.log(
        `  ${colors.blue}Category Name:${colors.reset}`,
        response.data.data.category_name
      );
    } else {
      printResult("Create Category", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Create Category - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 3: Get All Categories
 */
async function testGetAllCategories() {
  printHeader("TEST 3: Get All Categories");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/categories?page=1&limit=10",
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Get All Categories", true);
      console.log(
        `  ${colors.yellow}Total Categories:${colors.reset}`,
        response.data.data.pagination.totalItems
      );
    } else {
      printResult("Get All Categories", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Get All Categories - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 4: Get Category by ID
 */
async function testGetCategoryById() {
  printHeader("TEST 4: Get Category by ID");

  if (!testCategoryId) {
    printResult("Get Category by ID - Skipped", false, {
      error: "No category ID",
    });
    return false;
  }

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/categories/${testCategoryId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Get Category by ID", true);
      console.log(
        `  ${colors.yellow}Category:${colors.reset}`,
        response.data.data.category_name
      );
      console.log(
        `  ${colors.yellow}Products:${colors.reset}`,
        response.data.data.product_count
      );
    } else {
      printResult("Get Category by ID", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Get Category by ID - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 5: Update Category
 */
async function testUpdateCategory() {
  printHeader("TEST 5: Update Category");

  if (!testCategoryId) {
    printResult("Update Category - Skipped", false, {
      error: "No category ID",
    });
    return false;
  }

  // Generate unique name with timestamp to avoid conflicts
  const timestamp = Date.now();
  const putData = {
    category_name: `Sayuran Segar Premium ${timestamp}`,
    description: "Kategori untuk sayuran segar organik premium pilihan terbaik",
  };

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/categories/${testCategoryId}`,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options, putData);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Update Category", true);
      console.log(
        `  ${colors.blue}Updated Name:${colors.reset}`,
        response.data.data.category_name
      );
    } else {
      printResult("Update Category", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Update Category - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 6: Toggle Category Status
 */
async function testToggleCategoryStatus() {
  printHeader("TEST 6: Toggle Category Status");

  if (!testCategoryId) {
    printResult("Toggle Category Status - Skipped", false, {
      error: "No category ID",
    });
    return false;
  }

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/categories/${testCategoryId}/toggle-status`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Toggle Category Status", true);
      console.log(
        `  ${colors.yellow}Status:${colors.reset}`,
        response.data.data.is_active ? "Active" : "Inactive"
      );
    } else {
      printResult("Toggle Category Status", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Toggle Category Status - Error", false, {
      error: error.message,
    });
    return false;
  }
}

// ============================================
// DISCOUNT TESTS
// ============================================

/**
 * TEST 7: Create Discount
 */
async function testCreateDiscount() {
  printHeader("TEST 7: Create Discount");

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  // Generate unique name with timestamp
  const timestamp = Date.now();
  const postData = {
    discount_name: `Flash Sale 20% Test ${timestamp}`,
    discount_type: "percentage",
    value: 20,
    start_date: today.toISOString().split("T")[0],
    end_date: nextMonth.toISOString().split("T")[0],
    is_active: true,
  };

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/discounts",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options, postData);
    const success = response.status === 201;

    if (success && response.data.data) {
      testDiscountId = response.data.data.id;
      printResult("Create Discount", true);
      console.log(
        `  ${colors.blue}Discount ID:${colors.reset}`,
        testDiscountId
      );
      console.log(
        `  ${colors.blue}Discount Name:${colors.reset}`,
        response.data.data.discount_name
      );
      console.log(
        `  ${colors.blue}Type:${colors.reset}`,
        response.data.data.discount_type
      );
      console.log(
        `  ${colors.blue}Value:${colors.reset}`,
        response.data.data.value
      );
    } else {
      printResult("Create Discount", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Create Discount - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 8: Get All Discounts
 */
async function testGetAllDiscounts() {
  printHeader("TEST 8: Get All Discounts");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/discounts?page=1&limit=10",
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Get All Discounts", true);
      console.log(
        `  ${colors.yellow}Total Discounts:${colors.reset}`,
        response.data.data.pagination.totalItems
      );
    } else {
      printResult("Get All Discounts", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Get All Discounts - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 9: Get Discount by ID
 */
async function testGetDiscountById() {
  printHeader("TEST 9: Get Discount by ID");

  if (!testDiscountId) {
    printResult("Get Discount by ID - Skipped", false, {
      error: "No discount ID",
    });
    return false;
  }

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/discounts/${testDiscountId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Get Discount by ID", true);
      console.log(
        `  ${colors.yellow}Discount:${colors.reset}`,
        response.data.data.discount_name
      );
      console.log(
        `  ${colors.yellow}Status:${colors.reset}`,
        response.data.data.status
      );
      console.log(
        `  ${colors.yellow}Products:${colors.reset}`,
        response.data.data.product_count
      );
    } else {
      printResult("Get Discount by ID", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Get Discount by ID - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 10: Update Discount
 */
async function testUpdateDiscount() {
  printHeader("TEST 10: Update Discount");

  if (!testDiscountId) {
    printResult("Update Discount - Skipped", false, {
      error: "No discount ID",
    });
    return false;
  }

  // Generate unique name with timestamp
  const timestamp = Date.now();
  const putData = {
    discount_name: `Flash Sale 25% Premium ${timestamp}`,
    value: 25,
  };

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/discounts/${testDiscountId}`,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options, putData);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Update Discount", true);
      console.log(
        `  ${colors.blue}Updated Name:${colors.reset}`,
        response.data.data.discount_name
      );
      console.log(
        `  ${colors.blue}Updated Value:${colors.reset}`,
        response.data.data.value
      );
    } else {
      printResult("Update Discount", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Update Discount - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 11: Filter Discounts by Status
 */
async function testFilterDiscounts() {
  printHeader("TEST 11: Filter Discounts by Status (Active)");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/discounts?status=active&page=1&limit=10",
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Filter Active Discounts", true);
      console.log(
        `  ${colors.yellow}Active Discounts:${colors.reset}`,
        response.data.data.discounts.length
      );
    } else {
      printResult("Filter Active Discounts", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Filter Active Discounts - Error", false, {
      error: error.message,
    });
    return false;
  }
}

/**
 * TEST 12: Toggle Discount Status
 */
async function testToggleDiscountStatus() {
  printHeader("TEST 12: Toggle Discount Status");

  if (!testDiscountId) {
    printResult("Toggle Discount Status - Skipped", false, {
      error: "No discount ID",
    });
    return false;
  }

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/discounts/${testDiscountId}/toggle-status`,
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Toggle Discount Status", true);
      console.log(
        `  ${colors.yellow}Status:${colors.reset}`,
        response.data.data.is_active ? "Active" : "Inactive"
      );
    } else {
      printResult("Toggle Discount Status", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Toggle Discount Status - Error", false, {
      error: error.message,
    });
    return false;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log(`\n${colors.magenta}${"█".repeat(70)}${colors.reset}`);
  console.log(`${colors.magenta}█${" ".repeat(68)}█${colors.reset}`);
  console.log(
    `${colors.magenta}█       🧪 CATEGORY & DISCOUNT MANAGEMENT API TESTS 🧪       █${colors.reset}`
  );
  console.log(`${colors.magenta}█${" ".repeat(68)}█${colors.reset}`);
  console.log(`${colors.magenta}${"█".repeat(70)}${colors.reset}`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    { name: "Admin Login", fn: testAdminLogin },
    { name: "Create Category", fn: testCreateCategory },
    { name: "Get All Categories", fn: testGetAllCategories },
    { name: "Get Category by ID", fn: testGetCategoryById },
    { name: "Update Category", fn: testUpdateCategory },
    { name: "Toggle Category Status", fn: testToggleCategoryStatus },
    { name: "Create Discount", fn: testCreateDiscount },
    { name: "Get All Discounts", fn: testGetAllDiscounts },
    { name: "Get Discount by ID", fn: testGetDiscountById },
    { name: "Update Discount", fn: testUpdateDiscount },
    { name: "Filter Discounts", fn: testFilterDiscounts },
    { name: "Toggle Discount Status", fn: testToggleDiscountStatus },
  ];

  for (const test of tests) {
    results.total++;
    try {
      const success = await test.fn();
      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }
      await delay(500);
    } catch (error) {
      results.failed++;
      console.error(
        `${colors.red}✗ ${test.name} - Unexpected Error: ${error.message}${colors.reset}`
      );
    }
  }

  // Print Summary
  printHeader("TEST SUMMARY");
  console.log(`${colors.cyan}Total Tests:${colors.reset} ${results.total}`);
  console.log(`${colors.green}Passed:${colors.reset} ${results.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${results.failed}`);
  console.log(
    `${colors.yellow}Success Rate:${colors.reset} ${(
      (results.passed / results.total) *
      100
    ).toFixed(2)}%`
  );

  if (testCategoryId) {
    console.log(
      `\n${colors.blue}Test Category ID:${colors.reset} ${testCategoryId}`
    );
  }
  if (testDiscountId) {
    console.log(
      `${colors.blue}Test Discount ID:${colors.reset} ${testDiscountId}`
    );
  }

  console.log(`\n${colors.magenta}${"█".repeat(70)}${colors.reset}`);
  console.log(`${colors.magenta}█${" ".repeat(68)}█${colors.reset}`);
  console.log(
    `${colors.magenta}█                    🎉 TESTS COMPLETED 🎉                    █${colors.reset}`
  );
  console.log(`${colors.magenta}█${" ".repeat(68)}█${colors.reset}`);
  console.log(`${colors.magenta}${"█".repeat(70)}${colors.reset}\n`);
}

// Run tests
runAllTests().catch((error) => {
  console.error(`${colors.red}Fatal Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
