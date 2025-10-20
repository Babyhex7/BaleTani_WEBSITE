/**
 * Simple Test Script untuk Product API
 * Run: node test-product-api.js
 */

const http = require("http");

const baseURL = "localhost";
const port = 5000;

// Helper function untuk HTTP request
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseURL,
      port: port,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log("\n🧪 ========== TESTING BALETANI PRODUCT API ==========\n");

  try {
    // TEST 1: Health Check
    console.log("1️⃣  Testing Health Check...");
    const health = await makeRequest("GET", "/api/health");
    console.log("   Status:", health.status);
    console.log("   Response:", JSON.stringify(health.data, null, 2));

    // TEST 2: Login sebagai Admin
    console.log("\n2️⃣  Testing Admin Login...");
    const loginData = {
      phone_number: "6282111111111", // Super Administrator
      password: "admin123",
    };
    const login = await makeRequest("POST", "/api/admin/auth/login", loginData);
    console.log("   Status:", login.status);

    if (login.status === 200 && login.data.data && login.data.data.token) {
      console.log("   ✅ Login Success!");
      console.log("   Token:", login.data.data.token.substring(0, 50) + "...");

      const token = login.data.data.token;

      // TEST 3: Get All Products
      console.log("\n3️⃣  Testing Get All Products...");
      const products = await makeRequest(
        "GET",
        "/api/admin/products",
        null,
        token
      );
      console.log("   Status:", products.status);
      console.log("   Total Products:", products.data.pagination?.total || 0);

      // TEST 4: Create Category (kalau belum ada)
      console.log("\n4️⃣  Creating Test Category...");
      const categoryData = {
        category_name: "Test Category - " + Date.now(),
        description: "Category untuk testing",
        is_active: true,
      };
      // Note: Belum ada endpoint category, skip dulu atau buat manual

      // TEST 5: Create Product
      console.log("\n5️⃣  Testing Create Product...");
      const productData = {
        name: "Apel Malang Test - " + Date.now(),
        product_type: "online",
        description: "Apel segar dari Malang",
        selling_price: 25000,
        unit: "kg",
        shelf_life_days: 7,
        is_active: true,
      };
      const createProduct = await makeRequest(
        "POST",
        "/api/admin/products",
        productData,
        token
      );
      console.log("   Status:", createProduct.status);

      if (createProduct.status === 201) {
        console.log("   ✅ Product Created!");
        console.log("   Product ID:", createProduct.data.data.id);

        const productId = createProduct.data.data.id;

        // TEST 6: Get Product Detail
        console.log("\n6️⃣  Testing Get Product Detail...");
        const detail = await makeRequest(
          "GET",
          `/api/admin/products/${productId}`,
          null,
          token
        );
        console.log("   Status:", detail.status);
        console.log("   Product Name:", detail.data.data?.name);

        // TEST 7: Update Product
        console.log("\n7️⃣  Testing Update Product...");
        const updateData = {
          selling_price: 28000,
          description: "Apel segar dari Malang - UPDATED",
        };
        const update = await makeRequest(
          "PUT",
          `/api/admin/products/${productId}`,
          updateData,
          token
        );
        console.log("   Status:", update.status);
        console.log("   Updated Price:", update.data.data?.selling_price);

        // TEST 8: Get Products with Filter
        console.log("\n8️⃣  Testing Get Products with Filter...");
        const filtered = await makeRequest(
          "GET",
          "/api/admin/products?product_type=online&limit=5",
          null,
          token
        );
        console.log("   Status:", filtered.status);
        console.log(
          "   Filtered Products:",
          filtered.data.pagination?.total || 0
        );

        // TEST 9: Soft Delete Product
        console.log("\n9️⃣  Testing Soft Delete Product...");
        const deleteResult = await makeRequest(
          "DELETE",
          `/api/admin/products/${productId}`,
          null,
          token
        );
        console.log("   Status:", deleteResult.status);
        console.log("   Message:", deleteResult.data.message);

        // TEST 10: Restore Product
        console.log("\n🔟 Testing Restore Product...");
        const restore = await makeRequest(
          "POST",
          `/api/admin/products/${productId}/restore`,
          null,
          token
        );
        console.log("   Status:", restore.status);
        console.log("   Message:", restore.data.message);
      } else {
        console.log("   ❌ Failed to create product");
        console.log("   Error:", createProduct.data);
      }
    } else {
      console.log("   ❌ Login Failed!");
      console.log("   Response:", login.data);
    }
  } catch (error) {
    console.error("\n❌ Test Error:", error.message);
  }

  console.log("\n🏁 ========== TEST COMPLETED ==========\n");
}

// Run tests
runTests();
