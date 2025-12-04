// ================================================================
// SCENARIO 1: SMOKE TEST (Sanity Check)
// ================================================================
// Test cepat untuk validasi bahwa semua endpoint berfungsi
// Duration: 1 menit, 1 Virtual User (VU)
//
// Purpose:
// - Quick validation sebelum run test besar
// - Memastikan backend running dengan benar
// - Check semua endpoint response dengan status code yang benar
//
// CARA RUN:
// k6 run scenarios/01-smoke-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate } from 'k6/metrics';

// Import config
import { stages } from '../config/stages.js';
import { thresholds } from '../config/thresholds.js';
import { endpoints } from '../config/endpoints.js';

// Import helpers
import { loginCustomer, getAuthHeaders } from '../lib/auth.js';
import { randomItem, thinkTime } from '../lib/helpers.js';
import { 
  checkStatus, 
  checkLoginSuccess,
  checkProductListSuccess 
} from '../lib/checks.js';

// Custom metrics
const errorRate = new Rate('errors');

// Load test data
const customers = new SharedArray('customers', function () {
  return JSON.parse(open('../data/customers.json'));
});

const products = new SharedArray('products', function () {
  return JSON.parse(open('../data/products.json'));
});

// Test configuration
export let options = {
  // 1 VU selama 1 menit
  stages: stages.smoke,
  
  // Thresholds untuk smoke test
  thresholds: thresholds.smoke,
};

/**
 * Setup function - dijalankan sekali sebelum test dimulai
 */
export function setup() {
  console.log('🧪 Starting Smoke Test...');
  console.log(`   Base URL: ${endpoints.health}`);
  console.log(`   Duration: 1 minute`);
  console.log(`   VUs: 1\n`);
}

/**
 * Main test function - dijalankan oleh setiap VU
 */
export default function () {
  // ============================================
  // TEST 1: Health Check
  // ============================================
  let healthRes = http.get(endpoints.health, {
    tags: { name: 'HealthCheck' },
  });
  
  check(healthRes, {
    'health: status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
  
  // ============================================
  // TEST 2: Customer Login
  // ============================================
  const testCustomer = randomItem(customers);
  const token = loginCustomer(
    endpoints.health.replace('/api/health', ''),
    testCustomer.phone_number,
    testCustomer.password
  );
  
  if (!token) {
    errorRate.add(1);
    console.error('❌ Smoke test failed at login!');
    return; // Stop jika login gagal
  }
  
  sleep(1);
  
  // ============================================
  // TEST 3: Browse Products (Public)
  // ============================================
  let productsRes = http.get(`${endpoints.public.products}?page=1&limit=12`, {
    tags: { name: 'BrowseProducts' },
  });
  
  checkProductListSuccess(productsRes) || errorRate.add(1);
  
  sleep(1);
  
  // ============================================
  // TEST 4: View Product Detail
  // ============================================
  const randomProduct = randomItem(products);
  let productDetailRes = http.get(
    endpoints.public.productDetail(randomProduct.product_id),
    { tags: { name: 'ProductDetail' } }
  );
  
  checkStatus(productDetailRes, 200) || errorRate.add(1);
  
  sleep(1);
  
  // ============================================
  // TEST 5: View Cart (Authenticated)
  // ============================================
  let cartRes = http.get(endpoints.cart.view, {
    headers: getAuthHeaders(token),
    tags: { name: 'ViewCart' },
  });
  
  checkStatus(cartRes, 200) || errorRate.add(1);
  
  sleep(1);
  
  // ============================================
  // TEST 6: Add to Cart (Authenticated)
  // ============================================
  let addCartRes = http.post(
    endpoints.cart.add,
    JSON.stringify({
      product_id: randomProduct.product_id,
      quantity: 1
    }),
    {
      headers: getAuthHeaders(token),
      tags: { name: 'AddToCart' },
    }
  );
  
  check(addCartRes, {
    'add cart: status 201 or 200': (r) => r.status === 201 || r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1);
  
  // ============================================
  // TEST 7: View Categories (Public)
  // ============================================
  let categoriesRes = http.get(endpoints.public.categories, {
    tags: { name: 'BrowseCategories' },
  });
  
  checkStatus(categoriesRes, 200) || errorRate.add(1);
  
  sleep(1);
}

/**
 * Teardown function - dijalankan sekali setelah test selesai
 */
export function teardown(data) {
  console.log('\n✅ Smoke Test completed!');
  console.log('   Check results above for any failures\n');
}

/**
 * Handle summary - custom summary output
 */
export function handleSummary(data) {
  console.log('📊 SMOKE TEST SUMMARY');
  console.log('=====================');
  console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%`);
  console.log(`Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`p95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  
  return {
    'stdout': '', // Empty untuk avoid duplicate output
    'results/smoke-test-summary.json': JSON.stringify(data, null, 2),
  };
}
