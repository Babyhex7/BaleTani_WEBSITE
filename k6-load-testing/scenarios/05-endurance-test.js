// ================================================================
// SCENARIO 5: ENDURANCE TEST (Stability - 4 Jam)
// ================================================================
// Test stabilitas sistem dalam waktu lama
// Duration: 4 jam, 50 Virtual Users (constant)
//
// Purpose:
// - Detect memory leaks (heap memory terus naik)
// - Detect connection leaks (DB connections tidak di-release)
// - Validate performance consistency over time
// - Monitor resource usage long-term
//
// What to Monitor:
// - Node.js heap memory (should stabilize, not grow continuously)
// - Database connection pool (should stabilize at 35-45)
// - Response time (should NOT degrade over time)
// - Cache effectiveness (should remain >70%)
// - Error rate (should stay low <0.5%)
//
// CARA RUN:
// k6 run scenarios/05-endurance-test.js
//
// TIPS:
// - Run overnight atau saat tidak ada load testing lain
// - Monitor backend logs setiap 30 menit
// - Check database slow query log after test

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend, Counter } from 'k6/metrics';

import { stages } from '../config/stages.js';
import { thresholds } from '../config/thresholds.js';
import { endpoints, buildUrl } from '../config/endpoints.js';

import { loginCustomer, getAuthHeaders } from '../lib/auth.js';
import { randomItem, randomInt, thinkTime } from '../lib/helpers.js';
import { 
  checkProductListSuccess,
  checkCartSuccess,
  checkCheckoutSuccess 
} from '../lib/checks.js';

// Custom metrics
const errorRate = new Rate('errors');
const responseTimes = new Trend('response_time_all');
const checkoutTimes = new Trend('checkout_time');
const loginTimes = new Trend('login_time');
const memoryLeakIndicator = new Counter('potential_memory_leak');

// Load test data
const customers = new SharedArray('customers', function () {
  return JSON.parse(open('../data/customers.json'));
});

const products = new SharedArray('products', function () {
  return JSON.parse(open('../data/products.json'));
});

// Test configuration
export let options = {
  // Endurance: 50 VUs selama 4 jam (240 menit)
  stages: stages.endurance,
  
  // Thresholds untuk endurance (sedikit lebih toleran)
  thresholds: thresholds.endurance,
  
  tags: {
    test_type: 'endurance',
    duration: '4_hours',
  },
};

// Checkpoint intervals (untuk monitoring)
let checkpointCounter = 0;
const CHECKPOINT_INTERVAL = 1800; // 30 menit dalam seconds

/**
 * Setup function
 */
export function setup() {
  console.log('⏱️  Starting Endurance Test - 4 Hour Stability Test...');
  console.log(`   Duration: 4 hours (240 minutes)`);
  console.log(`   VUs: 50 (constant)`);
  console.log(`   Purpose: Detect memory/connection leaks\n`);
  
  console.log('📋 MONITORING CHECKLIST:');
  console.log('   Every 30 minutes, check:');
  console.log('   - Node.js heap memory (ps/htop)');
  console.log('   - Database connections (SHOW PROCESSLIST)');
  console.log('   - Response time trends (should be flat)');
  console.log('   - Error rate (should stay <0.5%)\n');
  
  console.log('⚠️  RED FLAGS:');
  console.log('   - Heap memory continuously growing');
  console.log('   - DB connections accumulating to 80+');
  console.log('   - Response time gradually increasing');
  console.log('   - Error rate climbing over time\n');
  
  return {
    startTime: new Date().toISOString(),
    checkpoints: [],
  };
}

/**
 * Main test function
 */
export default function (data) {
  const BASE_URL = endpoints.health.replace('/api/health', '');
  
  // Track iteration time untuk detect degradation
  const iterationStart = Date.now();
  
  // Normal user behavior dengan realistic think time
  const behavior = Math.random();
  
  if (behavior < 0.5) {
    // 50% - Browse and view products
    browseFlow(BASE_URL);
  } else if (behavior < 0.8) {
    // 30% - Full purchase flow
    purchaseFlow(BASE_URL);
  } else {
    // 20% - View history and profile
    historyFlow(BASE_URL);
  }
  
  const iterationDuration = Date.now() - iterationStart;
  responseTimes.add(iterationDuration);
  
  // Check for potential memory leak (iterations getting slower over time)
  if (iterationDuration > 30000) { // >30 seconds per iteration
    memoryLeakIndicator.add(1);
  }
  
  // Periodic checkpoint logging
  checkpointCounter++;
  if (checkpointCounter % 100 === 0) {
    console.log(`⏰ Checkpoint: ${checkpointCounter} iterations completed`);
  }
}

/**
 * Browse Flow - Product browsing saja
 */
function browseFlow(baseUrl) {
  group('Browse Flow', function () {
    
    // Browse products
    let productsRes = http.get(buildUrl(endpoints.public.products, {
      page: randomInt(1, 3),
      limit: 12
    }), {
      tags: { name: 'BrowseProducts', flow: 'endurance_browse' },
    });
    
    checkProductListSuccess(productsRes) || errorRate.add(1);
    thinkTime(5, 10);
    
    // View some product details
    for (let i = 0; i < 2; i++) {
      const product = randomItem(products);
      
      let detailRes = http.get(endpoints.public.productDetail(product.product_id), {
        tags: { name: 'ProductDetail', flow: 'endurance_browse' },
      });
      
      check(detailRes, {
        'detail: status 200': (r) => r.status === 200,
      }) || errorRate.add(1);
      
      thinkTime(5, 10);
    }
    
    // View categories
    let categoriesRes = http.get(endpoints.public.categories, {
      tags: { name: 'ViewCategories', flow: 'endurance_browse' },
    });
    
    check(categoriesRes, {
      'categories: status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    thinkTime(3, 7);
  });
}

/**
 * Purchase Flow - Full checkout
 */
function purchaseFlow(baseUrl) {
  group('Purchase Flow', function () {
    
    // Login
    const customer = randomItem(customers);
    const loginStart = Date.now();
    
    const token = loginCustomer(baseUrl, customer.phone_number, customer.password);
    
    if (!token) {
      errorRate.add(1);
      return;
    }
    
    loginTimes.add(Date.now() - loginStart);
    thinkTime(3, 7);
    
    // View cart
    let cartRes = http.get(endpoints.cart.view, {
      headers: getAuthHeaders(token),
      tags: { name: 'ViewCart', flow: 'endurance_purchase' },
    });
    
    checkCartSuccess(cartRes) || errorRate.add(1);
    thinkTime(3, 5);
    
    // Add items to cart (2-3 items)
    const itemCount = randomInt(2, 3);
    
    for (let i = 0; i < itemCount; i++) {
      const product = randomItem(products);
      
      let addRes = http.post(
        endpoints.cart.add,
        JSON.stringify({
          product_id: product.product_id,
          quantity: randomInt(1, 2)
        }),
        {
          headers: getAuthHeaders(token),
          tags: { name: 'AddToCart', flow: 'endurance_purchase' },
        }
      );
      
      check(addRes, {
        'add cart: success': (r) => r.status === 201 || r.status === 200,
      }) || errorRate.add(1);
      
      thinkTime(2, 5);
    }
    
    // Checkout
    const checkoutStart = Date.now();
    
    let checkoutRes = http.post(
      endpoints.orders.create,
      JSON.stringify({
        customer_name: customer.name,
        customer_phone: customer.phone_number,
        delivery_method: randomInt(0, 1) === 0 ? 'delivery' : 'pickup',
        delivery_address: customer.address || 'Jl. Test',
        payment_method: 'bank_transfer',
        bank_name: 'BCA',
      }),
      {
        headers: getAuthHeaders(token),
        tags: { name: 'Checkout', flow: 'endurance_purchase' },
      }
    );
    
    checkoutTimes.add(Date.now() - checkoutStart);
    checkCheckoutSuccess(checkoutRes) || errorRate.add(1);
    
    thinkTime(10, 20);
  });
}

/**
 * History Flow - View history and profile
 */
function historyFlow(baseUrl) {
  group('History Flow', function () {
    
    const customer = randomItem(customers);
    const token = loginCustomer(baseUrl, customer.phone_number, customer.password);
    
    if (!token) {
      errorRate.add(1);
      return;
    }
    
    thinkTime(3, 5);
    
    // View order history
    let historyRes = http.get(buildUrl(endpoints.orders.history, {
      page: 1,
      limit: 10
    }), {
      headers: getAuthHeaders(token),
      tags: { name: 'OrderHistory', flow: 'endurance_history' },
    });
    
    check(historyRes, {
      'history: status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    thinkTime(5, 10);
    
    // View profile
    let profileRes = http.get(endpoints.customer.profile, {
      headers: getAuthHeaders(token),
      tags: { name: 'ViewProfile', flow: 'endurance_history' },
    });
    
    check(profileRes, {
      'profile: status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    thinkTime(5, 10);
  });
}

/**
 * Teardown function
 */
export function teardown(data) {
  const endTime = new Date().toISOString();
  
  console.log('\n⏱️  Endurance Test completed!');
  console.log(`   Started: ${data.startTime}`);
  console.log(`   Ended: ${endTime}`);
  console.log(`   Duration: 4 hours\n`);
  
  console.log('📊 STABILITY ANALYSIS:');
  console.log('   Compare metrics Hour 1 vs Hour 4:');
  console.log('   - Response time should be similar');
  console.log('   - Error rate should be consistent');
  console.log('   - No memory leak indicators\n');
  
  console.log('🔍 POST-TEST CHECKS:');
  console.log('   1. Review backend logs for errors');
  console.log('   2. Check final heap memory usage');
  console.log('   3. Verify DB connections released');
  console.log('   4. Check slow query log');
  console.log('   5. Plot response time trend (should be flat)\n');
}
