// ================================================================
// SCENARIO 3: PEAK LOAD TEST - SHORT VERSION (8 menit)
// ================================================================
// Test performa sistem saat traffic tinggi (flash sale scenario)
// Duration: 8 menit (SHORT), 150 Virtual Users (VUs)
//
// Purpose:
// - Simulate flash sale / promo besar-besaran
// - Test kapasitas maksimal sistem
// - Monitor degradation performance saat high load
// - Validate rate limiting & cache effectiveness
//
// User Behavior:
// - Aggressive product browsing (minimal think time)
// - High concurrent add-to-cart operations
// - Many simultaneous checkouts
//
// CARA RUN:
// k6 run scenarios/03-peak-load.js

import http from "k6/http";
import { check, sleep, group } from "k6";
import { SharedArray } from "k6/data";
import { Rate, Trend, Counter } from "k6/metrics";

// Import config - GUNAKAN STAGES SHORT!
import { stagesShort } from "../config/stages-short.js";
import { thresholds } from "../config/thresholds.js";
import { endpoints, buildUrl } from "../config/endpoints.js";

// Import helpers
import { loginCustomer, getAuthHeaders } from "../lib/auth.js";
import { randomItem, randomInt, thinkTime } from "../lib/helpers.js";
import {
  checkProductListSuccess,
  checkCheckoutSuccess,
  checkRateLimited,
} from "../lib/checks.js";

// Custom metrics
const errorRate = new Rate("errors");
const rateLimitHits = new Counter("rate_limit_hits");
const checkoutAttempts = new Counter("checkout_attempts");
const checkoutSuccess = new Counter("checkout_success");

// Load test data
const customers = new SharedArray("customers", function () {
  return JSON.parse(open("../data/customers.json"));
});

const products = new SharedArray("products", function () {
  return JSON.parse(open("../data/products.json"));
});

// Test configuration
export let options = {
  // Peak load SHORT: 150 VUs, 8 menit total
  stages: stagesShort.peak,

  // Thresholds lebih toleran untuk peak
  thresholds: thresholds.peak,

  tags: {
    test_type: "peak_short",
    scenario: "flash_sale",
    duration: "8min",
  },
};

/**
 * Setup function
 */
export function setup() {
  console.log("🔥 Starting Peak Load Test - SHORT VERSION...");
  console.log(`   Duration: 8 minutes (SHORT)`);
  console.log(`   Target VUs: 150`);
  console.log(`   Expected: Higher response time, some 429 errors`);
  console.log(`   ℹ️  SHORT VERSION: 8min (vs 15min original)\n`);

  return {
    startTime: new Date().toISOString(),
  };
}

/**
 * Main test function
 */
export default function () {
  const BASE_URL = endpoints.health.replace("/api/health", "");

  // Randomly select user behavior
  const behavior = Math.random();

  if (behavior < 0.6) {
    // 60% - Aggressive browsing (high-demand products)
    aggressiveBrowsing(BASE_URL);
  } else if (behavior < 0.9) {
    // 30% - Fast purchase (quick checkout)
    fastPurchase(BASE_URL);
  } else {
    // 10% - Multiple cart adds (bulk buying)
    bulkBuying(BASE_URL);
  }
}

/**
 * Aggressive Browsing - Browse banyak products dengan cepat
 */
function aggressiveBrowsing(baseUrl) {
  group("Aggressive Browsing", function () {
    // Browse multiple pages quickly
    const pageCount = randomInt(3, 5);

    for (let page = 1; page <= pageCount; page++) {
      let res = http.get(
        buildUrl(endpoints.public.products, {
          page: page,
          limit: 20, // Load more items per page
        }),
        {
          tags: { name: "AggressiveBrowse", behavior: "aggressive" },
        }
      );

      if (res.status === 429) {
        rateLimitHits.add(1);
        checkRateLimited(res);
      } else {
        checkProductListSuccess(res) || errorRate.add(1);
      }

      sleep(randomInt(1, 3)); // Minimal think time (1-3 detik)
    }

    // View popular products quickly
    for (let i = 0; i < 5; i++) {
      const product = randomItem(products);

      let detailRes = http.get(
        endpoints.public.productDetail(product.product_id),
        {
          tags: { name: "QuickProductView", behavior: "aggressive" },
        }
      );

      if (detailRes.status !== 429) {
        check(detailRes, {
          "product detail loaded": (r) => r.status === 200,
        }) || errorRate.add(1);
      }

      sleep(randomInt(1, 2)); // Very fast browsing
    }
  });
}

/**
 * Fast Purchase - Login -> Add to cart -> Checkout secepat mungkin
 */
function fastPurchase(baseUrl) {
  group("Fast Purchase", function () {
    // Quick login
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

    sleep(1); // Minimal delay

    // Quick add to cart (1-2 items)
    const itemCount = randomInt(1, 2);

    for (let i = 0; i < itemCount; i++) {
      const product = randomItem(products);

      let addRes = http.post(
        endpoints.cart.add,
        JSON.stringify({
          product_id: product.product_id,
          quantity: randomInt(1, 2),
        }),
        {
          headers: getAuthHeaders(token),
          tags: { name: "FastAddToCart", behavior: "fast" },
        }
      );

      if (addRes.status === 429) {
        rateLimitHits.add(1);
      } else {
        check(addRes, {
          "fast add cart: success": (r) => r.status === 201 || r.status === 200,
        }) || errorRate.add(1);
      }

      sleep(1);
    }

    // Quick checkout (no review)
    checkoutAttempts.add(1);

    let checkoutRes = http.post(
      endpoints.orders.create,
      JSON.stringify({
        customer_name: customer.name,
        customer_phone: customer.phone_number,
        delivery_method: "pickup", // Pickup lebih cepat
        delivery_address: customer.address || "Jl. Test",
        payment_method: "bank_transfer",
        bank_name: "BCA",
      }),
      {
        headers: getAuthHeaders(token),
        tags: { name: "FastCheckout", behavior: "fast" },
      }
    );

    if (checkoutRes.status === 201) {
      checkoutSuccess.add(1);
    } else if (checkoutRes.status === 429) {
      rateLimitHits.add(1);
    } else {
      errorRate.add(1);
    }

    sleep(randomInt(2, 5));
  });
}

/**
 * Bulk Buying - Add banyak items sekaligus
 */
function bulkBuying(baseUrl) {
  group("Bulk Buying", function () {
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

    sleep(1);

    // Add many items to cart (5-8 items)
    const itemCount = randomInt(5, 8);
    let successCount = 0;

    for (let i = 0; i < itemCount; i++) {
      const product = randomItem(products);

      let addRes = http.post(
        endpoints.cart.add,
        JSON.stringify({
          product_id: product.product_id,
          quantity: randomInt(2, 5), // Buy in bulk
        }),
        {
          headers: getAuthHeaders(token),
          tags: { name: "BulkAddToCart", behavior: "bulk" },
        }
      );

      if (addRes.status === 201 || addRes.status === 200) {
        successCount++;
      } else if (addRes.status === 429) {
        rateLimitHits.add(1);
        break; // Stop adding if rate limited
      } else {
        errorRate.add(1);
      }

      sleep(0.5); // Very fast adding
    }

    // Checkout if at least some items added
    if (successCount > 0) {
      sleep(2); // Quick review

      checkoutAttempts.add(1);

      let checkoutRes = http.post(
        endpoints.orders.create,
        JSON.stringify({
          customer_name: customer.name,
          customer_phone: customer.phone_number,
          delivery_method: "delivery",
          delivery_address: customer.address || "Jl. Test",
          payment_method: "bank_transfer",
          bank_name: "BCA",
        }),
        {
          headers: getAuthHeaders(token),
          tags: { name: "BulkCheckout", behavior: "bulk" },
        }
      );

      if (checkoutRes.status === 201) {
        checkoutSuccess.add(1);
      } else {
        errorRate.add(1);
      }
    }

    sleep(randomInt(3, 7));
  });
}

/**
 * Teardown function
 */
export function teardown(data) {
  console.log("\n✅ Peak Load Test completed!");
  console.log(`   Started: ${data.startTime}`);
  console.log(`   Ended: ${new Date().toISOString()}`);
  console.log("\n⚠️  Check for:");
  console.log("   - Response time degradation");
  console.log("   - Rate limit hits (429 errors)");
  console.log("   - Database connection pool usage");
  console.log("   - Cache effectiveness\n");
}
