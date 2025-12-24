// ================================================================
// SCENARIO 6: SPIKE TEST - SHORT VERSION (10 menit)
// ================================================================
// Test kemampuan sistem recover dari sudden traffic spike
// Duration: 10 menit (SHORT)
// Pattern: 20 → 200 → 20 VUs (sudden 10x spike)
//
// Purpose:
// - Test system behavior saat traffic surge tiba-tiba
// - Measure recovery time after load drop
// - Validate connection pool releases properly
// - Check for cascading failures
// - Monitor cache behavior during spike
//
// Success Criteria:
// - System survives spike without crashing
// - Recovery time <2 minutes after load drop
// - No stuck connections or zombie processes
// - Error rate during spike <10%
// - Performance returns to baseline after recovery
//
// CARA RUN:
// k6 run scenarios/06-spike-test.js

import http from "k6/http";
import { check, sleep, group } from "k6";
import { SharedArray } from "k6/data";
import { Rate, Trend, Counter, Gauge } from "k6/metrics";

// Import config - GUNAKAN STAGES SHORT!
import { stagesShort } from "../config/stages-short.js";
import { thresholds } from "../config/thresholds.js";
import { endpoints, buildUrl } from "../config/endpoints.js";

import { loginCustomer, getAuthHeaders } from "../lib/auth.js";
import { randomItem, randomInt, thinkTime } from "../lib/helpers.js";
import {
  checkProductListSuccess,
  checkCheckoutSuccess,
} from "../lib/checks.js";

// Custom metrics untuk spike test
const errorRate = new Rate("errors");
const spikeErrors = new Counter("spike_phase_errors");
const recoveryErrors = new Counter("recovery_phase_errors");
const responseTimeSpike = new Trend("response_time_during_spike");
const responseTimeRecovery = new Trend("response_time_during_recovery");
const currentPhase = new Gauge("current_phase"); // 1=baseline, 2=spike, 3=recovery

// Load test data
const customers = new SharedArray("customers", function () {
  return JSON.parse(open("../data/customers.json"));
});

const products = new SharedArray("products", function () {
  return JSON.parse(open("../data/products.json"));
});

// Test configuration
export let options = {
  // Spike pattern SHORT: 20 → 200 → 20 VUs, 10 min total
  stages: stagesShort.spike,

  // Thresholds untuk spike (toleran selama spike, strict untuk recovery)
  thresholds: thresholds.spike,

  tags: {
    test_type: "spike_short",
    pattern: "20_200_20",
    duration: "10min",
  },
};

// Track test phases
let testPhase = "baseline"; // baseline, spike, recovery
let phaseStartTime = Date.now();

/**
 * Setup function
 */
export function setup() {
  console.log("⚡ Starting Spike Test - Traffic Surge & Recovery...");
  console.log(`   Duration: 20 minutes`);
  console.log(`   Pattern: 20 VUs → 200 VUs → 20 VUs\n`);

  console.log("📋 TEST PHASES:");
  console.log("   Phase 1 (0-5 min):   Baseline (20 VUs)");
  console.log("   Phase 2 (5-7 min):   SPIKE to 200 VUs (10x increase!)");
  console.log("   Phase 3 (7-12 min):  Sustain spike (200 VUs)");
  console.log("   Phase 4 (12-14 min): DROP to 20 VUs");
  console.log("   Phase 5 (14-20 min): Recovery monitoring (20 VUs)\n");

  console.log("🎯 SUCCESS CRITERIA:");
  console.log("   - System survives spike (no crashes)");
  console.log("   - Error rate during spike <10%");
  console.log("   - Recovery time <2 minutes");
  console.log("   - Performance returns to baseline\n");

  return {
    startTime: new Date().toISOString(),
    baselineMetrics: {},
  };
}

/**
 * Main test function
 */
export default function (data) {
  const BASE_URL = endpoints.health.replace("/api/health", "");
  const currentTime = Date.now();
  const elapsedSeconds = (currentTime - phaseStartTime) / 1000;

  // Determine current phase based on time
  let phase;
  if (elapsedSeconds < 300) {
    // 0-5 min
    phase = "baseline";
    currentPhase.add(1);
  } else if (elapsedSeconds < 720) {
    // 5-12 min
    phase = "spike";
    currentPhase.add(2);
  } else {
    // 12-20 min
    phase = "recovery";
    currentPhase.add(3);
  }

  // Log phase transitions
  if (phase !== testPhase) {
    console.log(`\n🔄 Phase transition: ${testPhase} → ${phase}`);
    testPhase = phase;
  }

  // Behavior during different phases
  if (phase === "baseline") {
    // Normal behavior dengan realistic think time
    normalBehavior(BASE_URL, phase);
  } else if (phase === "spike") {
    // Aggressive behavior dengan minimal think time
    aggressiveBehavior(BASE_URL, phase);
  } else {
    // recovery
    // Return to normal behavior, monitor recovery
    normalBehavior(BASE_URL, phase);
  }
}

/**
 * Normal Behavior - Baseline & Recovery phases
 */
function normalBehavior(baseUrl, phase) {
  group(`Normal Behavior (${phase})`, function () {
    const requestStart = Date.now();

    // 1. Browse products
    let productsRes = http.get(
      buildUrl(endpoints.public.products, {
        page: randomInt(1, 3),
        limit: 12,
      }),
      {
        tags: { name: "BrowseProducts", phase: phase },
      }
    );

    const responseTime = Date.now() - requestStart;

    if (phase === "recovery") {
      responseTimeRecovery.add(responseTime);
    }

    checkProductListSuccess(productsRes) || errorRate.add(1);

    if (!checkProductListSuccess(productsRes) && phase === "recovery") {
      recoveryErrors.add(1);
    }

    thinkTime(5, 10); // Normal think time

    // 2. View product detail
    const product = randomItem(products);

    let detailRes = http.get(
      endpoints.public.productDetail(product.product_id),
      {
        tags: { name: "ProductDetail", phase: phase },
      }
    );

    check(detailRes, {
      "detail: status 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    thinkTime(5, 10);
  });
}

/**
 * Aggressive Behavior - Spike phase
 */
function aggressiveBehavior(baseUrl, phase) {
  group(`Aggressive Behavior (${phase})`, function () {
    const requestStart = Date.now();

    // Quick login
    const customer = randomItem(customers);
    const token = loginCustomer(
      baseUrl,
      customer.phone_number,
      customer.password
    );

    if (!token) {
      errorRate.add(1);
      spikeErrors.add(1);
      return;
    }

    sleep(0.5); // Minimal delay

    // Quick browse
    let productsRes = http.get(
      buildUrl(endpoints.public.products, {
        page: 1,
        limit: 20,
      }),
      {
        headers: getAuthHeaders(token),
        tags: { name: "SpikeBrowse", phase: phase },
      }
    );

    const responseTime = Date.now() - requestStart;
    responseTimeSpike.add(responseTime);

    if (!checkProductListSuccess(productsRes)) {
      errorRate.add(1);
      spikeErrors.add(1);
    }

    sleep(1);

    // Quick add to cart
    const product = randomItem(products);

    let addCartRes = http.post(
      endpoints.cart.add,
      JSON.stringify({
        product_id: product.product_id,
        quantity: 1,
      }),
      {
        headers: getAuthHeaders(token),
        tags: { name: "SpikeAddCart", phase: phase },
      }
    );

    if (
      addCartRes.status !== 201 &&
      addCartRes.status !== 200 &&
      addCartRes.status !== 429
    ) {
      errorRate.add(1);
      spikeErrors.add(1);
    }

    sleep(1);

    // Some users try to checkout during spike
    if (Math.random() < 0.3) {
      // 30% attempt checkout
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
          tags: { name: "SpikeCheckout", phase: phase },
        }
      );

      if (!checkCheckoutSuccess(checkoutRes) && checkoutRes.status !== 429) {
        errorRate.add(1);
        spikeErrors.add(1);
      }
    }

    sleep(1); // Minimal delay
  });
}

/**
 * Teardown function
 */
export function teardown(data) {
  console.log("\n⚡ Spike Test completed!");
  console.log(`   Started: ${data.startTime}`);
  console.log(`   Ended: ${new Date().toISOString()}\n`);

  console.log("📊 SPIKE TEST ANALYSIS:\n");

  console.log("✅ PASS if:");
  console.log("   - System survived spike (no crashes)");
  console.log("   - Error rate during spike <10%");
  console.log("   - Error rate during recovery <2%");
  console.log("   - Recovery time <2 minutes\n");

  console.log("🔍 CHECK METRICS:");
  console.log("   - Compare baseline vs spike response times");
  console.log("   - Check error count during spike phase");
  console.log("   - Verify recovery phase errors low");
  console.log("   - Monitor database connections released\n");

  console.log("⚠️  POTENTIAL ISSUES:");
  console.log("   - Cascading failures (errors continue after spike)");
  console.log("   - Connection pool not releasing");
  console.log("   - Cache thrashing during spike");
  console.log("   - Long recovery time (>2 minutes)\n");

  console.log("📋 NEXT STEPS:");
  console.log("   1. Review backend logs during spike");
  console.log("   2. Check database connection pool behavior");
  console.log("   3. Analyze response time trends");
  console.log("   4. Document spike capacity (max VUs survived)\n");
}
