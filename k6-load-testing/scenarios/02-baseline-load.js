// ================================================================
// SCENARIO 2: BASELINE LOAD TEST (Normal Traffic)
// ================================================================
// Test performa sistem pada beban normal
// Duration: 30 menit, 50 Virtual Users (VUs)
//
// Purpose:
// - Establish performance baseline
// - Measure response time pada normal load
// - Validate database & cache performance
// - Monitor system resources
//
// User Mix:
// - 60% Product browsing (30 VUs)
// - 30% Purchase flow (15 VUs)
// - 10% View history (5 VUs)
//
// CARA RUN:
// k6 run scenarios/02-baseline-load.js
//
// CARA RUN DENGAN CUSTOM OUTPUT:
// k6 run --out json=results/baseline-$(date +%Y%m%d).json scenarios/02-baseline-load.js

import http from "k6/http";
import { check, sleep, group } from "k6";
import { SharedArray } from "k6/data";
import { Rate, Trend, Counter } from "k6/metrics";

// Import config
import { stages } from "../config/stages.js";
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
  // Baseline load: 50 VUs selama 30 menit
  stages: stages.baseline,

  // Thresholds untuk baseline
  thresholds: thresholds.baseline,

  // Tags untuk filtering results
  tags: {
    test_type: "baseline",
    environment: __ENV.ENVIRONMENT || "local",
  },
};

/**
 * Setup function - dijalankan sekali di awal
 */
export function setup() {
  console.log("📊 Starting Baseline Load Test...");
  console.log(`   Base URL: ${endpoints.health.replace("/api/health", "")}`);
  console.log(`   Duration: 30 minutes`);
  console.log(`   Target VUs: 50`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Categories: ${categories.length}\n`);

  // Verify backend is accessible
  let healthCheck = http.get(endpoints.health);
  if (healthCheck.status !== 200) {
    throw new Error(
      "❌ Backend is not accessible! Check if server is running."
    );
  }

  console.log("✅ Backend health check passed\n");

  return {
    startTime: new Date().toISOString(),
  };
}

/**
 * Main test function - dijalankan oleh setiap VU secara berulang
 */
export default function (data) {
  const BASE_URL = endpoints.health.replace("/api/health", "");

  // Randomly pilih user flow based on percentage
  const random = Math.random();

  if (random < 0.6) {
    // 60% - Product browsing only
    productBrowsingFlow(BASE_URL);
  } else if (random < 0.9) {
    // 30% - Full purchase flow
    purchaseFlow(BASE_URL);
  } else {
    // 10% - View history only
    viewHistoryFlow(BASE_URL);
  }
}

/**
 * FLOW 1: Product Browsing (Browse products without buying)
 */
function productBrowsingFlow(baseUrl) {
  group("Product Browsing Flow", function () {
    // 1. Browse products (halaman 1)
    let page1Res = http.get(
      buildUrl(endpoints.public.products, {
        page: 1,
        limit: 12,
      }),
      {
        tags: { name: "BrowseProducts", flow: "browsing" },
      }
    );

    checkProductListSuccess(page1Res) || errorRate.add(1);
    thinkTime(3, 8); // User baca-baca 3-8 detik

    // 2. Search products
    let searchRes = http.get(
      buildUrl(endpoints.public.products, {
        page: 1,
        limit: 12,
        search: "tomat", // Contoh search query
      }),
      {
        tags: { name: "SearchProducts", flow: "browsing" },
      }
    );

    checkProductListSuccess(searchRes) || errorRate.add(1);
    thinkTime(2, 5);

    // 3. Filter by category
    const randomCategory = randomItem(categories);
    let filterRes = http.get(
      buildUrl(endpoints.public.products, {
        page: 1,
        limit: 12,
        category: randomCategory.category_id,
      }),
      {
        tags: { name: "FilterByCategory", flow: "browsing" },
      }
    );

    checkProductListSuccess(filterRes) || errorRate.add(1);
    thinkTime(3, 7);

    // 4. View product detail (2-3 products)
    const viewCount = randomInt(2, 3);
    for (let i = 0; i < viewCount; i++) {
      const product = randomItem(products);

      let detailRes = http.get(
        endpoints.public.productDetail(product.product_id),
        {
          tags: { name: "ViewProductDetail", flow: "browsing" },
        }
      );

      check(detailRes, {
        "product detail: status 200": (r) => r.status === 200,
      }) || errorRate.add(1);

      thinkTime(5, 10); // Baca detail product
    }

    // 5. View categories
    let categoriesRes = http.get(endpoints.public.categories, {
      tags: { name: "ViewCategories", flow: "browsing" },
    });

    check(categoriesRes, {
      "categories: status 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    thinkTime(2, 5);
  });
}

/**
 * FLOW 2: Full Purchase Flow (Login -> Browse -> Add to Cart -> Checkout)
 */
function purchaseFlow(baseUrl) {
  group("Purchase Flow", function () {
    // 1. Login customer
    const customer = randomItem(customers);
    const loginStart = Date.now();

    const token = loginCustomer(
      baseUrl,
      customer.phone_number,
      customer.password
    );

    if (!token) {
      errorRate.add(1);
      console.error(`❌ Login failed for ${customer.phone_number}`);
      return;
    }

    loginDuration.add(Date.now() - loginStart);
    thinkTime(2, 5);

    // 2. Browse products
    let productsRes = http.get(
      buildUrl(endpoints.public.products, {
        page: 1,
        limit: 12,
      }),
      {
        headers: getAuthHeaders(token),
        tags: { name: "BrowseProducts", flow: "purchase" },
      }
    );

    checkProductListSuccess(productsRes) || errorRate.add(1);
    thinkTime(5, 10);

    // 3. View cart (might be empty)
    let cartRes = http.get(endpoints.cart.view, {
      headers: getAuthHeaders(token),
      tags: { name: "ViewCart", flow: "purchase" },
    });

    checkCartSuccess(cartRes) || errorRate.add(1);
    thinkTime(2, 5);

    // 4. Add items to cart (2-4 items)
    const itemCount = randomInt(2, 4);

    for (let i = 0; i < itemCount; i++) {
      const product = randomItem(products);
      const quantity = randomInt(1, 3);

      let addCartRes = http.post(
        endpoints.cart.add,
        JSON.stringify({
          product_id: product.product_id,
          quantity: quantity,
        }),
        {
          headers: getAuthHeaders(token),
          tags: { name: "AddToCart", flow: "purchase" },
        }
      );

      check(addCartRes, {
        "add cart: success": (r) => r.status === 201 || r.status === 200,
      }) || errorRate.add(1);

      if (addCartRes.status === 201 || addCartRes.status === 200) {
        totalCartItems.add(1);
      }

      thinkTime(2, 5);
    }

    // 5. View cart again (after adding items)
    let cartFullRes = http.get(endpoints.cart.view, {
      headers: getAuthHeaders(token),
      tags: { name: "ViewCartFull", flow: "purchase" },
    });

    checkCartSuccess(cartFullRes) || errorRate.add(1);
    thinkTime(5, 10); // Review cart items

    // 6. Checkout (create order)
    const checkoutStart = Date.now();

    let checkoutRes = http.post(
      endpoints.orders.create,
      JSON.stringify({
        customer_name: customer.name,
        customer_phone: customer.phone_number,
        delivery_method: randomInt(0, 1) === 0 ? "delivery" : "pickup",
        delivery_address: customer.address || "Jl. Test No. 123, Jakarta",
        payment_method: "bank_transfer",
        bank_name: "BCA",
      }),
      {
        headers: getAuthHeaders(token),
        tags: { name: "Checkout", flow: "purchase" },
      }
    );

    const checkoutTime = Date.now() - checkoutStart;
    checkoutDuration.add(checkoutTime);

    const checkoutSuccess = checkCheckoutSuccess(checkoutRes);
    if (!checkoutSuccess) {
      errorRate.add(1);
    } else {
      totalOrders.add(1);
    }

    thinkTime(10, 20); // Setelah checkout, user review confirmation
  });
}

/**
 * FLOW 3: View History (Login -> View order history)
 */
function viewHistoryFlow(baseUrl) {
  group("View History Flow", function () {
    // 1. Login
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

    thinkTime(2, 5);

    // 2. View order history (page 1)
    let historyRes = http.get(
      buildUrl(endpoints.orders.history, {
        page: 1,
        limit: 10,
      }),
      {
        headers: getAuthHeaders(token),
        tags: { name: "OrderHistory", flow: "history" },
      }
    );

    check(historyRes, {
      "history: status 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    thinkTime(5, 10);

    // 3. View profile
    let profileRes = http.get(endpoints.customer.profile, {
      headers: getAuthHeaders(token),
      tags: { name: "ViewProfile", flow: "history" },
    });

    check(profileRes, {
      "profile: status 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    thinkTime(3, 7);
  });
}

/**
 * Teardown function - dijalankan sekali di akhir
 */
export function teardown(data) {
  const endTime = new Date().toISOString();

  console.log("\n✅ Baseline Load Test completed!");
  console.log(`   Started: ${data.startTime}`);
  console.log(`   Ended: ${endTime}`);
  console.log("\n📊 Check results summary above\n");
}
