// ================================================================
// SCENARIO 2: BASELINE LOAD TEST - SHORT VERSION (10 menit)
// ================================================================
// Test performa sistem pada beban normal - VERSI PENDEK
// Duration: 10 menit (instead of 30 menit)
// Virtual Users: 50 VUs (sama)
//
// Purpose:
// - Establish performance baseline
// - Measure response time pada normal load
// - Validate database & cache performance
// - Monitor system resources
//
// MENGAPA VERSI PENDEK?
// - 10 menit sudah cukup untuk collect 500+ requests (sample valid)
// - Metrics (p95, p99) sudah stabil setelah 5-10 menit
// - Hindari test timeout/berhenti sendiri
// - Tetap valid untuk skripsi/jurnal
//
// User Mix:
// - 60% Product browsing (30 VUs)
// - 30% Purchase flow (15 VUs)
// - 10% View history (5 VUs)
//
// CARA RUN:
// k6 run --out json=results/baseline-short-$(date +%Y%m%d).json scenarios/02-baseline-load-SHORT.js

import http from "k6/http";
import { check, sleep, group } from "k6";
import { SharedArray } from "k6/data";
import { Rate, Trend, Counter } from "k6/metrics";

// Import config - GUNAKAN STAGES SHORT!
import { stagesShort } from "../config/stages-short.js";
import { thresholds } from "../config/thresholds.js";
import { endpoints, buildUrl } from "../config/endpoints.js";

// Import helpers & checks
import { loginCustomer, getAuthHeaders } from "../lib/auth.js";
import { randomItem, randomInt, thinkTime } from "../lib/helpers.js";
import {
  checkLoginSuccess,
  checkProductListSuccess,
  checkCartSuccess,
  checkCheckoutSuccess,
  checkResponseTime,
} from "../lib/checks.js";

// ============================================
// CUSTOM METRICS
// ============================================
const errorRate = new Rate("errors");
const checkoutDuration = new Trend("checkout_duration");
const loginDuration = new Trend("login_duration");
const totalOrders = new Counter("total_orders");
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
// TEST CONFIGURATION
// ============================================
export let options = {
  // Baseline load SHORT: 50 VUs selama 10 menit (instead of 30)
  stages: stagesShort.baseline,

  // Thresholds untuk baseline (sama)
  thresholds: thresholds.baseline,

  // Tags untuk filtering results
  tags: {
    test_type: "baseline_short",
    duration: "10min",
    environment: __ENV.ENVIRONMENT || "local",
  },
};

/**
 * Setup function - dijalankan sekali di awal
 */
export function setup() {
  console.log("📊 Starting Baseline Load Test - SHORT VERSION...");
  console.log(`   Base URL: ${endpoints.health.replace("/api/health", "")}`);
  console.log(`   Duration: 10 minutes (SHORT)`);
  console.log(`   Target VUs: 50`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   \n   ℹ️  SHORT VERSION: 10min test (vs 30min original)`);
  console.log(`   ℹ️  Metrics tetap valid untuk dokumentasi\n`);

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
 * Main test function - dijalankan oleh setiap VU
 */
export default function () {
  const BASE_URL = endpoints.health.replace("/api/health", "");

  // Randomly select user behavior (60/30/10 split)
  const behavior = Math.random();

  if (behavior < 0.6) {
    // 60% - Product Browsing Journey
    productBrowsingJourney(BASE_URL);
  } else if (behavior < 0.9) {
    // 30% - Purchase Flow Journey
    purchaseFlowJourney(BASE_URL);
  } else {
    // 10% - Order History Journey
    orderHistoryJourney(BASE_URL);
  }

  // Think time between iterations
  sleep(randomInt(2, 5));
}

/**
 * Journey 1: Product Browsing (40% of users)
 */
function productBrowsingJourney(baseUrl) {
  group("Product Browsing Journey", function () {
    // 1. View product list
    let listRes = http.get(buildUrl(baseUrl, "/api/public/products"), {
      tags: { name: "GetProducts" },
    });

    check(listRes, {
      "product list: status 200": (r) => r.status === 200,
      "product list: has data": (r) => {
        try {
          return JSON.parse(r.body).data.products.length > 0;
        } catch (e) {
          return false;
        }
      },
    }) || errorRate.add(1);

    thinkTime();

    // 2. View random category
    let category = randomItem(categories);
    let categoryRes = http.get(
      buildUrl(baseUrl, `/api/public/products?category=${category.id}`),
      { tags: { name: "FilterByCategory" } }
    );

    check(categoryRes, {
      "category filter: status 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    thinkTime();

    // 3. View product details
    let product = randomItem(products);
    let detailRes = http.get(
      buildUrl(baseUrl, `/api/public/products/${product.id}`),
      { tags: { name: "GetProductDetail" } }
    );

    check(detailRes, {
      "product detail: status 200": (r) => r.status === 200,
      "product detail: has name": (r) => {
        try {
          return JSON.parse(r.body).data.name !== undefined;
        } catch (e) {
          return false;
        }
      },
    }) || errorRate.add(1);

    thinkTime();
  });
}

/**
 * Journey 2: Purchase Flow (40% of users)
 */
function purchaseFlowJourney(baseUrl) {
  group("Purchase Flow Journey", function () {
    // 1. Login
    let customer = randomItem(customers);
    let loginStart = Date.now();

    let authResult = loginCustomer(baseUrl, customer.phone, customer.password);

    if (!authResult.success) {
      errorRate.add(1);
      return; // Skip rest if login failed
    }

    loginDuration.add(Date.now() - loginStart);

    let token = authResult.token;
    thinkTime();

    // 2. Browse products
    let productsRes = http.get(buildUrl(baseUrl, "/api/public/products"), {
      tags: { name: "BrowseProducts" },
    });

    check(productsRes, {
      "browse: status 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    thinkTime();

    // 3. Add to cart (simulate 2-4 items)
    let itemsToAdd = randomInt(2, 4);
    for (let i = 0; i < itemsToAdd; i++) {
      let product = randomItem(products);
      let quantity = randomInt(1, 3);

      // Note: Cart is client-side (Zustand + localStorage)
      // No actual API call needed, just track metric
      totalCartItems.add(quantity);

      sleep(0.5); // Simulate add to cart delay
    }

    thinkTime();

    // 4. Checkout
    let checkoutStart = Date.now();

    let orderPayload = {
      customer_name: customer.name,
      customer_phone: customer.phone,
      delivery_method: "delivery",
      delivery_address: "Jl. Test No. 123, Jakarta",
      payment_method: "transfer",
      bank_name: "BCA",
      items: Array.from({ length: itemsToAdd }, () => {
        let product = randomItem(products);
        return {
          product_id: product.id,
          quantity: randomInt(1, 2),
        };
      }),
    };

    let checkoutRes = http.post(
      buildUrl(baseUrl, "/api/customer/orders/create"),
      JSON.stringify(orderPayload),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        tags: { name: "Checkout" },
      }
    );

    let checkoutSuccess = check(checkoutRes, {
      "checkout: status 201": (r) => r.status === 201,
      "checkout: has order_id": (r) => {
        try {
          return JSON.parse(r.body).data.order_id !== undefined;
        } catch (e) {
          return false;
        }
      },
    });

    if (checkoutSuccess) {
      checkoutDuration.add(Date.now() - checkoutStart);
      totalOrders.add(1);
    } else {
      errorRate.add(1);
    }

    thinkTime();
  });
}

/**
 * Journey 3: Order History (20% of users)
 */
function orderHistoryJourney(baseUrl) {
  group("Order History Journey", function () {
    // 1. Login
    let customer = randomItem(customers);
    let authResult = loginCustomer(baseUrl, customer.phone, customer.password);

    if (!authResult.success) {
      errorRate.add(1);
      return;
    }

    let token = authResult.token;
    thinkTime();

    // 2. Get order history
    let historyRes = http.get(buildUrl(baseUrl, "/api/customer/orders"), {
      headers: getAuthHeaders(token),
      tags: { name: "GetOrderHistory" },
    });

    check(historyRes, {
      "order history: status 200": (r) => r.status === 200,
      "order history: is array": (r) => {
        try {
          return Array.isArray(JSON.parse(r.body).data.orders);
        } catch (e) {
          return false;
        }
      },
    }) || errorRate.add(1);

    thinkTime();

    // 3. Get profile
    let profileRes = http.get(buildUrl(baseUrl, "/api/customer/auth/profile"), {
      headers: getAuthHeaders(token),
      tags: { name: "GetProfile" },
    });

    check(profileRes, {
      "profile: status 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    thinkTime();
  });
}

/**
 * Teardown function
 */
export function teardown(data) {
  console.log("\n📊 Baseline Load Test - SHORT VERSION Complete!");
  console.log(`   Duration: 10 minutes`);
  console.log(`   Started: ${data.startTime}`);
  console.log(`   Finished: ${new Date().toISOString()}`);
  console.log(
    `\n   ℹ️  Check results/baseline-short-*.json for detailed metrics`
  );
}
