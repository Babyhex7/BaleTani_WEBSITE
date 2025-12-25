// ================================================================
// SCENARIO 5: ENDURANCE TEST - SHORT VERSION (30 menit)
// ================================================================
// Test stabilitas sistem jangka menengah - VERSI PENDEK
// Duration: 30 menit (instead of 4 JAM!)
// Virtual Users: 50 VUs (constant)
//
// Purpose:
// - Detect memory leaks & resource leaks
// - Monitor performance degradation over time
// - Validate system stability
// - Check database connection pool behavior
//
// MENGAPA 30 MENIT CUKUP?
// - Memory leak pattern terlihat dalam 15-30 menit pertama
// - Performance degradation trend sudah jelas
// - 4 jam hanya confirm trend yang sama
// - Hindari test berhenti sendiri di tengah jalan
// - Tetap valid untuk dokumentasi skripsi
//
// Monitoring:
// - Response time trend (apakah naik seiring waktu?)
// - Error rate trend (apakah meningkat?)
// - Memory usage (perlu monitor manual via Task Manager)
// - Database connections (perlu check via MySQL)
//
// CARA RUN:
// k6 run --out json=results/endurance-short-$(date +%Y%m%d).json scenarios/05-endurance-SHORT.js
//
// TIPS:
// - Jalankan sambil monitor Task Manager (lihat memory backend)
// - Check MySQL connections: SHOW PROCESSLIST;
// - Jika mau lebih lama, edit stages-short.js

import http from "k6/http";
import { check, sleep, group } from "k6";
import { SharedArray } from "k6/data";
import { Rate, Trend, Counter, Gauge } from "k6/metrics";

// Import config - GUNAKAN STAGES SHORT!
import { stagesShort } from "../config/stages-short.js";
import { thresholds } from "../config/thresholds.js";
import { endpoints, buildUrl } from "../config/endpoints.js";

// Import helpers
import { loginCustomer, getAuthHeaders } from "../lib/auth.js";
import { randomItem, randomInt, thinkTime } from "../lib/helpers.js";

// ============================================
// CUSTOM METRICS FOR ENDURANCE
// ============================================
const errorRate = new Rate("errors");
const memoryUsage = new Gauge("memory_usage_mb"); // Track jika ada memory info
const responseTimeTrend = new Trend("response_time_trend");
const slowRequests = new Counter("slow_requests_above_1s");
const totalIterations = new Counter("total_iterations");

// Track metrics over time intervals
let startTime = Date.now();
let intervalMetrics = {
  minute5: { requests: 0, errors: 0, avgResponseTime: 0 },
  minute10: { requests: 0, errors: 0, avgResponseTime: 0 },
  minute15: { requests: 0, errors: 0, avgResponseTime: 0 },
  minute20: { requests: 0, errors: 0, avgResponseTime: 0 },
  minute25: { requests: 0, errors: 0, avgResponseTime: 0 },
  minute30: { requests: 0, errors: 0, avgResponseTime: 0 },
};

// ============================================
// LOAD TEST DATA
// ============================================
const customers = new SharedArray("customers", function () {
  return JSON.parse(open("../data/customers.json"));
});

const products = new SharedArray("products", function () {
  return JSON.parse(open("../data/products.json"));
});

// ============================================
// TEST CONFIGURATION
// ============================================
export let options = {
  // Endurance SHORT: 50 VUs selama 30 menit (instead of 4 hours)
  stages: stagesShort.endurance,

  // Thresholds untuk endurance
  thresholds: {
    "http_req_duration": ["p(95)<1500", "p(99)<3000"], // Slightly relaxed
    "http_req_failed": ["rate<0.03"], // <3% error rate
    "errors": ["rate<0.03"],
    "slow_requests_above_1s": ["count<50"], // Max 50 slow requests
  },

  tags: {
    test_type: "endurance_short",
    duration: "30min",
    environment: __ENV.ENVIRONMENT || "local",
  },
};

/**
 * Setup function
 */
export function setup() {
  console.log("⏱️  Starting Endurance Test - SHORT VERSION...");
  console.log(`   Base URL: ${endpoints.health.replace("/api/health", "")}`);
  console.log(`   Duration: 30 minutes (SHORT)`);
  console.log(`   Target VUs: 50 (constant)`);
  console.log(`   \n   ℹ️  SHORT VERSION: 30min test (vs 4 hours original)`);
  console.log(`   ℹ️  Cukup untuk detect memory leak & degradation pattern\n`);

  console.log("📊 WHAT TO MONITOR:");
  console.log("   - Response time trend (should be stable)");
  console.log("   - Error rate trend (should not increase)");
  console.log("   - Memory usage (check Task Manager manually)");
  console.log("   - Database connections (check MySQL: SHOW PROCESSLIST)\n");

  // Health check
  let healthCheck = http.get(endpoints.health);
  if (healthCheck.status !== 200) {
    throw new Error("❌ Backend not accessible!");
  }

  console.log("✅ Backend accessible. Starting endurance test...\n");

  return {
    startTime: new Date().toISOString(),
  };
}

/**
 * Main test function - continuous load
 */
export default function () {
  const BASE_URL = endpoints.health.replace("/api/health", "");

  totalIterations.add(1);

  // Calculate elapsed time
  let elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);

  // Mix of operations (simulate real usage)
  const behavior = Math.random();

  if (behavior < 0.5) {
    // 50% - Product browsing
    productBrowsing(BASE_URL);
  } else if (behavior < 0.8) {
    // 30% - Purchase flow
    purchaseFlow(BASE_URL);
  } else {
    // 20% - Order history
    orderHistory(BASE_URL);
  }

  // Minimal think time (to maintain consistent load)
  sleep(randomInt(1, 3));
}

/**
 * Product browsing flow
 */
function productBrowsing(baseUrl) {
  group("Product Browsing", function () {
    let start = Date.now();

    // Get products
    let res = http.get(`${baseUrl}/api/public/products`, {
      tags: { name: "GetProducts" },
    });

    let duration = Date.now() - start;
    responseTimeTrend.add(duration);

    if (duration > 1000) {
      slowRequests.add(1);
    }

    check(res, {
      "status 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);

    // Get product detail
    let product = randomItem(products);
    start = Date.now();

    let detailRes = http.get(
      `${baseUrl}/api/public/products/${product.product_id}`,
      {
        tags: { name: "ProductDetail" },
      }
    );

    duration = Date.now() - start;
    responseTimeTrend.add(duration);

    if (duration > 1000) {
      slowRequests.add(1);
    }

    check(detailRes, {
      "detail status 200": (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

/**
 * Purchase flow
 */
function purchaseFlow(baseUrl) {
  group("Purchase Flow", function () {
    // Login
    let customer = randomItem(customers);
    let authResult = loginCustomer(baseUrl, customer.phone_number, customer.password);

    if (!authResult.success) {
      errorRate.add(1);
      return;
    }

    sleep(1);

    // Checkout
    let start = Date.now();

    let orderPayload = {
      customer_name: customer.name,
      customer_phone: customer.phone_number,
      delivery_method: "self_pickup",
      payment_method: "cash",
      items: [
        {
          product_id: randomItem(products).product_id,
          quantity: randomInt(1, 2),
        },
      ],
    };

    let checkoutRes = http.post(
      `${baseUrl}/api/customer/orders/create`,
      JSON.stringify(orderPayload),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authResult.token}`,
        },
        tags: { name: "Checkout" },
      }
    );

    let duration = Date.now() - start;
    responseTimeTrend.add(duration);

    if (duration > 1000) {
      slowRequests.add(1);
    }

    check(checkoutRes, {
      "checkout status 201": (r) => r.status === 201,
    }) || errorRate.add(1);
  });
}

/**
 * Order history
 */
function orderHistory(baseUrl) {
  group("Order History", function () {
    let customer = randomItem(customers);
    let authResult = loginCustomer(baseUrl, customer.phone_number, customer.password);

    if (!authResult.success) {
      errorRate.add(1);
      return;
    }

    sleep(1);

    let start = Date.now();

    let historyRes = http.get(`${baseUrl}/api/customer/orders/history`, {
      headers: getAuthHeaders(authResult.token),
      tags: { name: "OrderHistory" },
    });

    let duration = Date.now() - start;
    responseTimeTrend.add(duration);

    if (duration > 1000) {
      slowRequests.add(1);
    }

    check(historyRes, {
      "history status 200": (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

/**
 * Teardown function
 */
export function teardown(data) {
  console.log("\n⏱️  Endurance Test - SHORT VERSION Complete!");
  console.log(`   Duration: 30 minutes`);
  console.log(`   Started: ${data.startTime}`);
  console.log(`   Finished: ${new Date().toISOString()}`);
  console.log(`\n📊 ANALYSIS CHECKLIST:`);
  console.log(`   [ ] Response time trend - stable atau naik?`);
  console.log(`   [ ] Error rate - konsisten atau meningkat?`);
  console.log(`   [ ] Memory usage - check Task Manager`);
  console.log(`   [ ] Database connections - check MySQL`);
  console.log(`\n   ℹ️  Jika semua stabil = PASS ✅`);
  console.log(`   ℹ️  Jika ada degradation = investigate further`);
}
