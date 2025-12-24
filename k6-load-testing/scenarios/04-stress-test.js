// ================================================================
// SCENARIO 4: STRESS TEST - SHORT VERSION (6 menit)
// ================================================================
// Test untuk mencari breaking point sistem
// Duration: 6 menit (SHORT), Gradually increase sampai 300 VUs
//
// Purpose:
// - Find maximum capacity sistem
// - Document breaking point (saat error rate >20%)
// - Identify first component to fail (DB? Cache? CPU?)
// - Test graceful degradation
//
// Expected:
// - System akan mulai error saat load tertentu
// - Database connection pool mungkin saturated
// - Response time drastis meningkat
// - Rate limiter akan trigger heavily
//
// CARA RUN:
// k6 run scenarios/04-stress-test.js

import http from "k6/http";
import { check, sleep, group } from "k6";
import { SharedArray } from "k6/data";
import { Rate, Trend, Counter, Gauge } from "k6/metrics";

// Import config - GUNAKAN STAGES SHORT!
import { stagesShort } from "../config/stages-short.js";
import { thresholds } from "../config/thresholds.js";
import { endpoints, buildUrl } from "../config/endpoints.js";

import { loginCustomer, getAuthHeaders } from "../lib/auth.js";
import { randomItem, randomInt } from "../lib/helpers.js";

// Custom metrics untuk stress test
const errorRate = new Rate("errors");
const serverErrors = new Counter("server_errors_5xx");
const clientErrors = new Counter("client_errors_4xx");
const timeouts = new Counter("timeouts");
const slowRequests = new Counter("slow_requests_above_5s");
const currentVUs = new Gauge("current_vus");

// Load test data
const customers = new SharedArray("customers", function () {
  return JSON.parse(open("../data/customers.json"));
});

const products = new SharedArray("products", function () {
  return JSON.parse(open("../data/products.json"));
});

// Test configuration
export let options = {
  // Stress test SHORT: gradually increase to 300 VUs, 6 min total
  stages: stagesShort.stress,

  // Thresholds akan fail, tapi capture data
  thresholds: thresholds.stress,

  // Extend timeout untuk stress test
  httpDebug: "full",

  tags: {
    test_type: "stress_short",
    goal: "find_breaking_point",
    duration: "6min",
  },
};

/**
 * Setup function
 */
export function setup() {
  console.log("💥 Starting Stress Test - SHORT VERSION...");
  console.log(`   Duration: 6 minutes (SHORT)`);
  console.log(`   Ramping: 100 → 200 → 300 VUs`);
  console.log(`   Expected: System will start failing at some point`);
  console.log(`   Goal: Document max capacity`);
  console.log(
    `   ℹ️  SHORT VERSION: 6min, up to 300 VUs (enough to find breaking point)\n`
  );

  console.log("⚠️  MONITOR CLOSELY:");
  console.log("   - Database connection pool (max 100)");
  console.log("   - Backend CPU/Memory");
  console.log("   - Error rate spike");
  console.log("   - Response time >5 seconds\n");

  return {
    startTime: new Date().toISOString(),
  };
}

/**
 * Main test function - hammer the system
 */
export default function () {
  const BASE_URL = endpoints.health.replace("/api/health", "");

  // Track current VUs
  currentVUs.add(__VU);

  // Mix of all operations dengan minimal think time
  const behavior = Math.random();

  if (behavior < 0.4) {
    // 40% - Concurrent logins
    stressLogin(BASE_URL);
  } else if (behavior < 0.7) {
    // 30% - Concurrent cart operations
    stressCart(BASE_URL);
  } else {
    // 30% - Concurrent checkouts
    stressCheckout(BASE_URL);
  }
}

/**
 * Stress Login - Many concurrent logins
 */
function stressLogin(baseUrl) {
  group("Stress Login", function () {
    const customer = randomItem(customers);
    const startTime = Date.now();

    const token = loginCustomer(
      baseUrl,
      customer.phone_number,
      customer.password
    );

    const duration = Date.now() - startTime;

    if (!token) {
      errorRate.add(1);
    }

    // Check for slow requests
    if (duration > 5000) {
      slowRequests.add(1);
    }

    sleep(0.5); // Minimal delay
  });
}

/**
 * Stress Cart - Heavy cart operations
 */
function stressCart(baseUrl) {
  group("Stress Cart", function () {
    const customer = randomItem(customers);
    const token = loginCustomer(
      baseUrl,
      customer.phone_number,
      customer.password
    );

    if (!token) {
      errorRate.add(1);
      return;
    }

    // Rapid cart additions
    for (let i = 0; i < 3; i++) {
      const product = randomItem(products);
      const startTime = Date.now();

      let addRes = http.post(
        endpoints.cart.add,
        JSON.stringify({
          product_id: product.product_id,
          quantity: randomInt(1, 3),
        }),
        {
          headers: getAuthHeaders(token),
          tags: { name: "StressAddCart" },
          timeout: "10s", // Extend timeout
        }
      );

      // Track errors by type
      if (addRes.status >= 500) {
        serverErrors.add(1);
        errorRate.add(1);
      } else if (addRes.status >= 400 && addRes.status < 500) {
        clientErrors.add(1);
        if (addRes.status !== 429) {
          // 429 is expected
          errorRate.add(1);
        }
      } else if (addRes.status === 0) {
        timeouts.add(1);
        errorRate.add(1);
      }

      const duration = Date.now() - startTime;
      if (duration > 5000) {
        slowRequests.add(1);
      }

      sleep(0.2); // Very minimal delay
    }
  });
}

/**
 * Stress Checkout - Many concurrent checkouts
 */
function stressCheckout(baseUrl) {
  group("Stress Checkout", function () {
    const customer = randomItem(customers);
    const token = loginCustomer(
      baseUrl,
      customer.phone_number,
      customer.password
    );

    if (!token) {
      errorRate.add(1);
      return;
    }

    // Quick add to cart
    const product = randomItem(products);

    let addRes = http.post(
      endpoints.cart.add,
      JSON.stringify({
        product_id: product.product_id,
        quantity: 1,
      }),
      {
        headers: getAuthHeaders(token),
        tags: { name: "StressQuickAdd" },
        timeout: "10s",
      }
    );

    if (addRes.status !== 201 && addRes.status !== 200) {
      errorRate.add(1);
      return;
    }

    sleep(0.5);

    // Immediate checkout (no review)
    const startTime = Date.now();

    let checkoutRes = http.post(
      endpoints.orders.create,
      JSON.stringify({
        customer_name: customer.name,
        customer_phone: customer.phone_number,
        delivery_method: "pickup",
        delivery_address: customer.address || "Jl. Test",
        payment_method: "bank_transfer",
        bank_name: "BCA",
      }),
      {
        headers: getAuthHeaders(token),
        tags: { name: "StressCheckout" },
        timeout: "15s", // Checkout might be slow
      }
    );

    const duration = Date.now() - startTime;

    // Track errors
    if (checkoutRes.status >= 500) {
      serverErrors.add(1);
      errorRate.add(1);
    } else if (checkoutRes.status >= 400 && checkoutRes.status < 500) {
      clientErrors.add(1);
      if (checkoutRes.status !== 429) {
        errorRate.add(1);
      }
    } else if (checkoutRes.status === 0) {
      timeouts.add(1);
      errorRate.add(1);
    }

    if (duration > 5000) {
      slowRequests.add(1);
    }

    sleep(1);
  });
}

/**
 * Teardown function
 */
export function teardown(data) {
  console.log("\n💥 Stress Test completed!");
  console.log(`   Started: ${data.startTime}`);
  console.log(`   Ended: ${new Date().toISOString()}\n`);

  console.log("📊 BREAKING POINT ANALYSIS:");
  console.log("   Check metrics above for:");
  console.log("   - Max VUs before >20% error rate");
  console.log("   - Server errors (500+) count");
  console.log("   - Timeout count");
  console.log("   - Slow requests (>5s) count");
  console.log("   - First failure type\n");

  console.log("🔍 NEXT STEPS:");
  console.log("   1. Review backend logs for errors");
  console.log("   2. Check database connection pool status");
  console.log("   3. Analyze slow query log");
  console.log("   4. Document breaking point (X VUs)");
  console.log("   5. Identify bottleneck component\n");
}
