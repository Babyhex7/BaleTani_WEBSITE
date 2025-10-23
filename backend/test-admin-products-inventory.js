/**
 * ================================================================
 * TEST CASE: ADMIN PRODUCTS & INVENTORY MANAGEMENT
 * ================================================================
 * Testing CRUD operations for:
 * - Dashboard Statistics
 * - Products Management
 * - Categories Management
 * - Discount Management
 * - Inventory Management
 *
 * Run: node test-admin-products-inventory.js
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
let testProductId = null;
let testCategoryId = null;
let testDiscountId = null;

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

/**
 * Make HTTP Request
 */
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

/**
 * Print Section Header
 */
function printHeader(text) {
  console.log(`\n${colors.cyan}${"=".repeat(70)}${colors.reset}`);
  console.log(`${colors.cyan}  ${text}${colors.reset}`);
  console.log(`${colors.cyan}${"=".repeat(70)}${colors.reset}\n`);
}

/**
 * Print Test Result
 */
function printResult(testName, success, data = null) {
  const icon = success ? "✓" : "✗";
  const color = success ? colors.green : colors.red;
  console.log(`${color}${icon} ${testName}${colors.reset}`);
  if (data) {
    console.log(
      `  ${colors.yellow}Response:${colors.reset}`,
      JSON.stringify(data, null, 2)
    );
  }
}

/**
 * Delay function
 */
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
      printResult(`Role: ${response.data.data.user.role.role_name}`, true);
      console.log(
        `${colors.blue}  Token: ${authToken.substring(0, 30)}...${colors.reset}`
      );
    } else {
      printResult("Admin Login", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Admin Login - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 2: Get Dashboard Statistics
 */
async function testDashboardStats() {
  printHeader("TEST 2: Dashboard Statistics");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/dashboard/stats",
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Get Dashboard Stats", true);
      console.log(
        `  ${colors.yellow}Total Products:${colors.reset}`,
        response.data.data.totalProducts || 0
      );
      console.log(
        `  ${colors.yellow}Total Orders Today:${colors.reset}`,
        response.data.data.totalOrdersToday || 0
      );
      console.log(
        `  ${colors.yellow}Total Sales:${colors.reset}`,
        response.data.data.totalSales || 0
      );
      console.log(
        `  ${colors.yellow}Low Stock Products:${colors.reset}`,
        response.data.data.lowStockCount || 0
      );
    } else {
      printResult("Get Dashboard Stats", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Get Dashboard Stats - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 3: Get All Products (Before Create)
 */
async function testGetAllProducts() {
  printHeader("TEST 3: Get All Products");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/products?page=1&limit=10",
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Get All Products", true);
      console.log(
        `  ${colors.yellow}Total Products:${colors.reset}`,
        response.data.data.total || 0
      );
      console.log(
        `  ${colors.yellow}Current Page:${colors.reset}`,
        response.data.data.currentPage || 1
      );
      console.log(
        `  ${colors.yellow}Products in this page:${colors.reset}`,
        response.data.data.products?.length || 0
      );
    } else {
      printResult("Get All Products", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Get All Products - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 4: Get All Categories
 */
async function testGetCategories() {
  printHeader("TEST 4: Get All Categories");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/categories",
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
        response.data.data.length || 0
      );

      if (response.data.data.length > 0) {
        testCategoryId = response.data.data[0].id;
        console.log(
          `  ${colors.blue}Using Category ID:${colors.reset}`,
          testCategoryId
        );
        console.log(
          `  ${colors.blue}Category Name:${colors.reset}`,
          response.data.data[0].category_name
        );
      }
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
 * TEST 5: Create New Product
 */
async function testCreateProduct() {
  printHeader("TEST 5: Create New Product");

  const postData = {
    name: "Tomat Merah Organik Test",
    product_type: "online",
    category_id: testCategoryId,
    description:
      "Tomat merah segar pilihan untuk memasak. Dipetik langsung dari kebun organik.",
    selling_price: 25000,
    unit: "kg",
    shelf_life_days: 7,
    is_active: true,
  };

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/products",
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
      testProductId = response.data.data.id;
      printResult("Create Product", true);
      console.log(`  ${colors.blue}Product ID:${colors.reset}`, testProductId);
      console.log(
        `  ${colors.blue}Product Name:${colors.reset}`,
        response.data.data.name
      );
      console.log(
        `  ${colors.blue}Selling Price:${colors.reset}`,
        response.data.data.selling_price
      );
    } else {
      printResult("Create Product", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Create Product - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 6: Get Product by ID
 */
async function testGetProductById() {
  printHeader("TEST 6: Get Product Detail");

  if (!testProductId) {
    printResult("Get Product by ID - Skipped", false, {
      error: "No product ID available",
    });
    return false;
  }

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/products/${testProductId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Get Product by ID", true);
      console.log(
        `  ${colors.yellow}Product Name:${colors.reset}`,
        response.data.data.name
      );
      console.log(
        `  ${colors.yellow}Product Type:${colors.reset}`,
        response.data.data.product_type
      );
      console.log(
        `  ${colors.yellow}Category:${colors.reset}`,
        response.data.data.category?.category_name || "N/A"
      );
      console.log(
        `  ${colors.yellow}Price:${colors.reset}`,
        response.data.data.selling_price
      );
      console.log(
        `  ${colors.yellow}Stock:${colors.reset}`,
        response.data.data.total_stock
      );
      console.log(
        `  ${colors.yellow}Active:${colors.reset}`,
        response.data.data.is_active
      );
    } else {
      printResult("Get Product by ID", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Get Product by ID - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 7: Update Product
 */
async function testUpdateProduct() {
  printHeader("TEST 7: Update Product");

  if (!testProductId) {
    printResult("Update Product - Skipped", false, {
      error: "No product ID available",
    });
    return false;
  }

  const putData = {
    name: "Tomat Merah Organik Premium (Updated)",
    selling_price: 28000,
    description:
      "Tomat merah premium pilihan terbaik. Dipetik langsung dari kebun organik terpercaya.",
    is_active: true,
  };

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/products/${testProductId}`,
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
      printResult("Update Product", true);
      console.log(
        `  ${colors.blue}Updated Name:${colors.reset}`,
        response.data.data.name
      );
      console.log(
        `  ${colors.blue}Updated Price:${colors.reset}`,
        response.data.data.selling_price
      );
    } else {
      printResult("Update Product", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Update Product - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 8: Search Products
 */
async function testSearchProducts() {
  printHeader("TEST 8: Search Products");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/products?search=tomat&page=1&limit=5",
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Search Products (keyword: tomat)", true);
      console.log(
        `  ${colors.yellow}Found Products:${colors.reset}`,
        response.data.data.products?.length || 0
      );
      if (response.data.data.products?.length > 0) {
        response.data.data.products.forEach((product, index) => {
          console.log(
            `  ${colors.blue}  ${index + 1}. ${product.name}${colors.reset}`
          );
        });
      }
    } else {
      printResult("Search Products", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Search Products - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 9: Filter Products by Type
 */
async function testFilterProductsByType() {
  printHeader("TEST 9: Filter Products by Type");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/products?product_type=online&page=1&limit=5",
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Filter Products by Type (online)", true);
      console.log(
        `  ${colors.yellow}Online Products:${colors.reset}`,
        response.data.data.products?.length || 0
      );
    } else {
      printResult("Filter Products by Type", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Filter Products by Type - Error", false, {
      error: error.message,
    });
    return false;
  }
}

/**
 * TEST 10: Get Low Stock Products
 */
async function testGetLowStockProducts() {
  printHeader("TEST 10: Get Low Stock Products");

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: "/api/admin/dashboard/low-stock",
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success) {
      printResult("Get Low Stock Products", true);
      const products = response.data.data || [];
      console.log(
        `  ${colors.yellow}Low Stock Count:${colors.reset}`,
        products.length
      );
      if (products.length > 0) {
        products.slice(0, 3).forEach((product, index) => {
          console.log(
            `  ${colors.red}  ${index + 1}. ${product.name} - Stock: ${
              product.total_stock
            }${colors.reset}`
          );
        });
      }
    } else {
      printResult("Get Low Stock Products", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Get Low Stock Products - Error", false, {
      error: error.message,
    });
    return false;
  }
}

/**
 * TEST 11: Soft Delete Product
 */
async function testSoftDeleteProduct() {
  printHeader("TEST 11: Soft Delete Product");

  if (!testProductId) {
    printResult("Soft Delete Product - Skipped", false, {
      error: "No product ID available",
    });
    return false;
  }

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/products/${testProductId}`,
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success) {
      printResult("Soft Delete Product", true);
      console.log(
        `  ${colors.yellow}Message:${colors.reset}`,
        response.data.message
      );
    } else {
      printResult("Soft Delete Product", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Soft Delete Product - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 12: Restore Deleted Product
 */
async function testRestoreProduct() {
  printHeader("TEST 12: Restore Deleted Product");

  if (!testProductId) {
    printResult("Restore Product - Skipped", false, {
      error: "No product ID available",
    });
    return false;
  }

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/products/${testProductId}/restore`,
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success = response.status === 200;

    if (success && response.data.data) {
      printResult("Restore Product", true);
      console.log(
        `  ${colors.yellow}Restored Product:${colors.reset}`,
        response.data.data.name
      );
      console.log(
        `  ${colors.yellow}Status:${colors.reset}`,
        response.data.data.is_active ? "Active" : "Inactive"
      );
    } else {
      printResult("Restore Product", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Restore Product - Error", false, { error: error.message });
    return false;
  }
}

/**
 * TEST 13: Verify Product After Restore
 */
async function testVerifyRestoredProduct() {
  printHeader("TEST 13: Verify Restored Product");

  if (!testProductId) {
    printResult("Verify Restored Product - Skipped", false, {
      error: "No product ID available",
    });
    return false;
  }

  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api/admin/products/${testProductId}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const response = await makeRequest(options);
    const success =
      response.status === 200 && response.data.data.deleted_at === null;

    if (success) {
      printResult("Verify Product is Restored", true);
      console.log(
        `  ${colors.green}✓ Product is successfully restored${colors.reset}`
      );
      console.log(
        `  ${colors.yellow}Product Name:${colors.reset}`,
        response.data.data.name
      );
      console.log(
        `  ${colors.yellow}Deleted At:${colors.reset}`,
        response.data.data.deleted_at || "null"
      );
    } else {
      printResult("Verify Product is Restored", false, response.data);
    }

    return success;
  } catch (error) {
    printResult("Verify Restored Product - Error", false, {
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
    `${colors.magenta}█     🧪 BALETANI ADMIN PRODUCTS & INVENTORY API TESTS 🧪     █${colors.reset}`
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
    { name: "Dashboard Stats", fn: testDashboardStats },
    { name: "Get All Products", fn: testGetAllProducts },
    { name: "Get Categories", fn: testGetCategories },
    { name: "Create Product", fn: testCreateProduct },
    { name: "Get Product by ID", fn: testGetProductById },
    { name: "Update Product", fn: testUpdateProduct },
    { name: "Search Products", fn: testSearchProducts },
    { name: "Filter Products", fn: testFilterProductsByType },
    { name: "Low Stock Products", fn: testGetLowStockProducts },
    { name: "Soft Delete Product", fn: testSoftDeleteProduct },
    { name: "Restore Product", fn: testRestoreProduct },
    { name: "Verify Restored Product", fn: testVerifyRestoredProduct },
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
      await delay(500); // Delay between tests
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

  if (testProductId) {
    console.log(
      `\n${colors.blue}Test Product ID:${colors.reset} ${testProductId}`
    );
    console.log(
      `${colors.blue}You can use this ID for further testing${colors.reset}`
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
