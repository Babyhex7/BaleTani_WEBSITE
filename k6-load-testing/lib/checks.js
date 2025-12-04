// ================================================
// LIBRARY: CHECKS (Validasi Response)
// ================================================
// File ini berisi reusable check functions untuk validasi response
// Mengurangi code duplication dan standardize checks

import { check } from 'k6';

/**
 * Check Response Status Code
 * 
 * @param {object} response - HTTP response object
 * @param {number} expectedStatus - Expected status code (default: 200)
 * @returns {boolean} - true jika pass
 * 
 * Contoh:
 * const res = http.get(url);
 * checkStatus(res, 200);
 */
export function checkStatus(response, expectedStatus = 200) {
  return check(response, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
}

/**
 * Check Success Response (status 200 dan success: true)
 * 
 * @param {object} response - HTTP response
 * @param {string} name - Nama check (untuk reporting)
 * @returns {boolean} - true jika pass
 * 
 * Contoh:
 * checkSuccess(response, 'Login');
 */
export function checkSuccess(response, name = 'Request') {
  return check(response, {
    [`${name}: status 200`]: (r) => r.status === 200,
    [`${name}: success true`]: (r) => {
      try {
        return r.json('success') === true;
      } catch (e) {
        return false;
      }
    },
  });
}

/**
 * Check Customer Login Response
 * Validasi khusus untuk login response
 * 
 * @param {object} response - Login response
 * @returns {boolean} - true jika valid
 */
export function checkLoginSuccess(response) {
  return check(response, {
    'login: status 200': (r) => r.status === 200,
    'login: has token': (r) => r.json('token') !== undefined && r.json('token') !== null,
    'login: has customer data': (r) => r.json('customer') !== undefined,
    'login: customer has phone': (r) => r.json('customer.phone_number') !== undefined,
    'login: no password in response': (r) => r.json('customer.password') === undefined,
  });
}

/**
 * Check Customer Register Response
 * 
 * @param {object} response - Register response
 * @returns {boolean} - true jika valid
 */
export function checkRegisterSuccess(response) {
  return check(response, {
    'register: status 201': (r) => r.status === 201,
    'register: has token': (r) => r.json('token') !== undefined,
    'register: has customer': (r) => r.json('customer') !== undefined,
    'register: no password exposed': (r) => r.json('customer.password') === undefined,
  });
}

/**
 * Check Product List Response
 * 
 * @param {object} response - Products list response
 * @returns {boolean} - true jika valid
 */
export function checkProductListSuccess(response) {
  return check(response, {
    'products: status 200': (r) => r.status === 200,
    'products: has data': (r) => r.json('data') !== undefined,
    'products: has products array': (r) => Array.isArray(r.json('data.products')),
    'products: has pagination': (r) => r.json('data.pagination') !== undefined,
  });
}

/**
 * Check Product Detail Response
 * 
 * @param {object} response - Product detail response
 * @returns {boolean} - true jika valid
 */
export function checkProductDetailSuccess(response) {
  return check(response, {
    'product detail: status 200': (r) => r.status === 200,
    'product detail: has product': (r) => r.json('product') !== undefined,
    'product detail: has product_id': (r) => r.json('product.product_id') !== undefined,
    'product detail: has price': (r) => r.json('product.price') !== undefined,
  });
}

/**
 * Check Cart Response
 * 
 * @param {object} response - Cart response
 * @returns {boolean} - true jika valid
 */
export function checkCartSuccess(response) {
  return check(response, {
    'cart: status 200': (r) => r.status === 200,
    'cart: has cart array': (r) => Array.isArray(r.json('cart')),
  });
}

/**
 * Check Add to Cart Response
 * 
 * @param {object} response - Add to cart response
 * @returns {boolean} - true jika valid
 */
export function checkAddToCartSuccess(response) {
  return check(response, {
    'add cart: status 201 or 200': (r) => r.status === 201 || r.status === 200,
    'add cart: success true': (r) => r.json('success') === true,
  });
}

/**
 * Check Checkout/Order Create Response
 * 
 * @param {object} response - Checkout response
 * @returns {boolean} - true jika valid
 */
export function checkCheckoutSuccess(response) {
  return check(response, {
    'checkout: status 201': (r) => r.status === 201,
    'checkout: has order': (r) => r.json('order') !== undefined,
    'checkout: has order_id': (r) => r.json('order.order_id') !== undefined,
    'checkout: has total_amount': (r) => r.json('order.total_amount') !== undefined,
    'checkout: has status': (r) => r.json('order.order_status') !== undefined,
  });
}

/**
 * Check Order History Response
 * 
 * @param {object} response - Order history response
 * @returns {boolean} - true jika valid
 */
export function checkOrderHistorySuccess(response) {
  return check(response, {
    'order history: status 200': (r) => r.status === 200,
    'order history: has orders': (r) => Array.isArray(r.json('orders')),
    'order history: has pagination': (r) => r.json('pagination') !== undefined,
  });
}

/**
 * Check Response Time (performance check)
 * 
 * @param {object} response - HTTP response
 * @param {number} maxMs - Maximum response time dalam ms (default: 1000)
 * @param {string} name - Nama check
 * @returns {boolean} - true jika pass
 */
export function checkResponseTime(response, maxMs = 1000, name = 'Request') {
  return check(response, {
    [`${name}: response time < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  });
}

/**
 * Check Error Response (4xx or 5xx)
 * 
 * @param {object} response - HTTP response
 * @param {number} expectedStatus - Expected error status
 * @param {string} expectedMessage - Expected error message (optional)
 * @returns {boolean} - true jika error sesuai expected
 */
export function checkErrorResponse(response, expectedStatus, expectedMessage = null) {
  const checks = {
    [`error: status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'error: has error field': (r) => r.json('error') !== undefined || r.json('message') !== undefined,
  };
  
  if (expectedMessage) {
    checks['error: correct message'] = (r) => {
      const errorMsg = r.json('error') || r.json('message') || '';
      return errorMsg.includes(expectedMessage);
    };
  }
  
  return check(response, checks);
}

/**
 * Check Unauthorized (401)
 * 
 * @param {object} response - HTTP response
 * @returns {boolean} - true jika 401 unauthorized
 */
export function checkUnauthorized(response) {
  return checkErrorResponse(response, 401);
}

/**
 * Check Forbidden (403)
 * 
 * @param {object} response - HTTP response
 * @returns {boolean} - true jika 403 forbidden
 */
export function checkForbidden(response) {
  return checkErrorResponse(response, 403);
}

/**
 * Check Not Found (404)
 * 
 * @param {object} response - HTTP response
 * @returns {boolean} - true jika 404 not found
 */
export function checkNotFound(response) {
  return checkErrorResponse(response, 404);
}

/**
 * Check Rate Limited (429)
 * 
 * @param {object} response - HTTP response
 * @returns {boolean} - true jika 429 rate limited
 */
export function checkRateLimited(response) {
  return checkErrorResponse(response, 429, 'Too many');
}

/**
 * Check Cache Hit (dari response header)
 * 
 * @param {object} response - HTTP response
 * @returns {boolean} - true jika cache hit
 */
export function checkCacheHit(response) {
  return check(response, {
    'cache: hit': (r) => {
      const cacheStatus = r.headers['X-Cache-Status'] || r.headers['x-cache-status'];
      return cacheStatus === 'HIT';
    },
  });
}

/**
 * Check JSON Response Valid
 * 
 * @param {object} response - HTTP response
 * @param {string} name - Nama check
 * @returns {boolean} - true jika JSON valid
 */
export function checkValidJSON(response, name = 'Response') {
  return check(response, {
    [`${name}: valid JSON`]: (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    [`${name}: content-type JSON`]: (r) => {
      const contentType = r.headers['Content-Type'] || r.headers['content-type'] || '';
      return contentType.includes('application/json');
    },
  });
}
