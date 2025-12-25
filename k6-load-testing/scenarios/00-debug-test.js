// ================================================================
// SCENARIO 0: DEBUG TEST - Isolasi Masalah dengan VU Kecil
// ================================================================
// Test dengan 10 VUs untuk debug connection pool issues
// Duration: 5 menit
//
// Purpose:
// - Isolasi masalah concurrent connections
// - Validate database connection pool
// - Debug endpoint failures
// - Monitor detailed logs
//
// User Mix:
// - 70% Product browsing (7 VUs)
// - 30% Purchase flow (3 VUs)
//
// CARA RUN:
// k6 run scenarios/00-debug-test.js

import http from "k6/http";
import { check, sleep, group } from "k6";
import { SharedArray } from "k6/data";
import { Rate, Trend, Counter } from "k6/metrics";

// Import config
import { endpoints, buildUrl } from "../config/endpoints.js";

// Import helpers & checks
import { loginCustomer } from "../lib/auth.js";
import { randomItem, randomInt, thinkTime } from "../lib/helpers.js";

// ============================================
// CUSTOM METRICS
// ============================================
const errorRate = new Rate("errors");
const loginDuration = new Trend("login_duration");
const totalCartItems = new Counter("total_cart_items");

// ============================================
// LOAD TEST DATA
// ============================================
const customers = new SharedArray("customers", function () {
  return JSON.parse(open("../data/customers.json"));
});

const products = new SharedArray("products", function () {
  return JSON.parse(open("../data/products.json"));
});

const categories = new SharedArray("categories", function () {
  return JSON.parse(open("../data/categories.json"));
});

// ============================================
// TEST CONFIGURATION - 10 VUs for debugging
// ============================================
export let options = {
  stages: [
    { duration: "1m", target: 10 }, // Ramp up to 10 VUs
    { duration: "3m", target: 10 }, // Stay at 10 VUs
    { duration: "1m", target: 0 }, // Ramp down
  ],

  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"],
    http_req_failed: ["rate<0.05"], // Allow 5% failure for debugging
    errors: ["rate<0.05"],
  },

  tags: {
    test_type: "debug",
    duration: "5min",
    environment: __ENV.ENVIRONMENT || "local",
  },
};

/**
 * Setup function
 */
export function setup() {
  console.log("🔧 Starting DEBUG Test - Low VU Count...");
  console.log(`   Base URL: ${endpoints.health.replace("/api/health", "")}`);
  console.log(`   Duration: 5 minutes`);
  console.log(`   Target VUs: 10 (untuk debug)`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   \n   🎯 GOAL: Isolasi masalah dengan load rendah\n`);

  // Verify backend is accessible
  let healthCheck = http.get(endpoints.health);
  if (healthCheck.status !== 200) {
    throw new Error("❌ Backend not accessible! Make sure backend is running.");
  }

  console.log("✅ Backend accessible. Starting test...\n");

  return {
    startTime: new Date().toISOString(),
  };
}

/**
 * Main test function
 */
export default function () {
  const BASE_URL = endpoints.health.replace("/api/health", "");

  // 70/30 split for debugging
  const behavior = Math.random();

  if (behavior < 0.7) {
    // 70% - Product Browsing
    productBrowsingJourney(BASE_URL);
  } else {
    // 30% - Purchase Flow
    purchaseFlowJourney(BASE_URL);
  }

  // Think time between iterations
  sleep(randomInt(2, 4));
}

/**
 * Journey 1: Product Browsing (Debug version)
 */
function productBrowsingJourney(baseUrl) {
  group("Product Browsing Journey", function () {
    // 1. View product list
    let listRes = http.get(`${baseUrl}/api/public/products`, {
      tags: { name: "GetProducts" },
    });

    let listCheck = check(listRes, {
      "product list: status 200": (r) => r.status === 200,
      "product list: has data": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success && body.data.products.length > 0;
        } catch (e) {
          console.error(`❌ Product list parse error: ${e.message}`);
          console.error(`   Response: ${r.body.substring(0, 200)}`);
          return false;
        }
      },
    });

    if (!listCheck) {
      errorRate.add(1);
      console.error(`❌ Product list failed - Status: ${listRes.status}`);
      if (listRes.status !== 200) {
        console.error(`   Body: ${listRes.body.substring(0, 300)}`);
      }
      return; // Skip rest if list failed
    }

    thinkTime();

    // 2. View random category
    let category = randomItem(categories);
    let categoryRes = http.get(
      `${baseUrl}/api/public/products?category=${category.id}`,
      { tags: { name: "FilterByCategory" } }
    );

    let categoryCheck = check(categoryRes, {
      "category filter: status 200": (r) => r.status === 200,
    });

    if (!categoryCheck) {
      errorRate.add(1);
      console.error(
        `❌ Category filter failed - Status: ${categoryRes.status}`
      );
    }

    thinkTime();

    // 3. View product details
    let product = randomItem(products);
    let detailRes = http.get(
      `${baseUrl}/api/public/products/${product.product_id}`,
      { tags: { name: "GetProductDetail" } }
    );

    let detailCheck = check(detailRes, {
      "product detail: status 200": (r) => r.status === 200,
      "product detail: has name": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success && body.data.name !== undefined;
        } catch (e) {
          return false;
        }
      },
    });

    if (!detailCheck) {
      errorRate.add(1);
      console.error(`❌ Product detail failed - Status: ${detailRes.status}`);
    }

    thinkTime();
  });
}

/**
 * Journey 2: Purchase Flow (Debug version)
 */
function purchaseFlowJourney(baseUrl) {
  group("Purchase Flow Journey", function () {
    // 1. Login
    let customer = randomItem(customers);
    let loginStart = Date.now();

    let authResult = loginCustomer(
      baseUrl,
      customer.phone_number,
      customer.password
    );

    if (!authResult.success) {
      errorRate.add(1);
      console.error(`❌ Login failed for customer ${customer.phone_number}`);
      console.error(`   Error: ${authResult.error}`);
      console.error(`   Status: ${authResult.statusCode}`);
      return; // Skip rest if login failed
    }

    loginDuration.add(Date.now() - loginStart);

    let token = authResult.token;
    thinkTime();

    // 2. Browse products
    let productsRes = http.get(`${baseUrl}/api/public/products`, {
      tags: { name: "BrowseProducts" },
    });

    let browseCheck = check(productsRes, {
      "browse: status 200": (r) => r.status === 200,
    });

    if (!browseCheck) {
      errorRate.add(1);
      console.error(`❌ Browse failed - Status: ${productsRes.status}`);
      return;
    }

    thinkTime();

    // 3. Add items to cart
    let itemsToAdd = randomInt(1, 3);
    let cartItems = [];
    for (let i = 0; i < itemsToAdd; i++) {
      let product = randomItem(products);
      let quantity = randomInt(1, 2);
      
      let cartData = {
        product_id: product.product_id,
        quantity: quantity,
      };

      let cartRes = http.post(
        `${baseUrl}/api/customer/cart`,
        JSON.stringify(cartData),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          tags: { name: "AddToCart" },
        }
      );

      if (cartRes.status === 201 || cartRes.status === 200) {
        cartItems.push({
          product_id: product.product_id,
          quantity: quantity,
        });
        totalCartItems.add(quantity);
      }
      sleep(0.3);
    }

    if (cartItems.length === 0) {
      errorRate.add(1);
      console.error("❌ No items added to cart");
      return;
    }

    thinkTime();

    // 4. Checkout with items
    let checkoutData = {
      customer_name: customer.name || "Load Test User",
      customer_phone: customer.phone_number,
      delivery_method: "delivery",
      delivery_address: customer.address || "Jakarta",
      payment_method: "bank_transfer",
      bank_name: "BCA",
      items: cartItems
    };

    let checkoutRes = http.post(
      `${baseUrl}/api/customer/orders/create`,
      JSON.stringify(checkoutData),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        tags: { name: "Checkout" },
      }
    );

    let checkoutCheck = check(checkoutRes, {
      "checkout: status 201": (r) => r.status === 201,
      "checkout: has order_id": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success && body.data !== undefined;
        } catch (e) {
          return false;
        }
      },
    });

    if (!checkoutCheck) {
      errorRate.add(1);
      console.error(`❌ Checkout failed - Status: ${checkoutRes.status}`);
      if (checkoutRes.status !== 201 && checkoutRes.status !== 200) {
        console.error(`   Body: ${checkoutRes.body.substring(0, 300)}`);
      }
    }

    thinkTime();
  });
}

/**
 * Teardown function
 */
export function teardown(data) {
  console.log(`\n🔧 Debug Test Complete!`);
  console.log(`   Duration: 5 minutes`);
  console.log(`   Started: ${data.startTime}`);
  console.log(`   Finished: ${new Date().toISOString()}`);
  console.log(`   \n   📝 Check backend logs untuk detailed error analysis\n`);
}
