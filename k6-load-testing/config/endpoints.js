// ===============================================
// CONFIG: ENDPOINTS (Definisi URL API)
// ===============================================
// File ini berisi semua endpoint URL yang akan ditest
// Memudahkan maintenance jika URL berubah

// Base URL dari environment variable atau default localhost
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Endpoint definitions (dikelompokkan berdasarkan fungsi)
export const endpoints = {
  // ==========================================
  // HEALTH CHECK
  // ==========================================
  health: `${BASE_URL}/api/health`,
  healthRoot: `${BASE_URL}/api/`,
  
  // ==========================================
  // CUSTOMER AUTHENTICATION
  // ==========================================
  customer: {
    // POST - Register customer baru
    register: `${BASE_URL}/api/customer/auth/register`,
    
    // POST - Login customer (return JWT token)
    login: `${BASE_URL}/api/customer/auth/login`,
    
    // GET - Get customer profile (authenticated)
    profile: `${BASE_URL}/api/customer/profile`,
    
    // PUT - Update customer profile (authenticated)
    updateProfile: `${BASE_URL}/api/customer/profile`,
  },
  
  // ==========================================
  // PUBLIC ENDPOINTS (No Auth Required)
  // ==========================================
  public: {
    // GET - List products (pagination, search, filter)
    // Query params: page, limit, search, category, minPrice, maxPrice, sortBy
    products: `${BASE_URL}/api/public/products`,
    
    // GET - Product detail by ID
    // Param: productId (UUID)
    productDetail: (productId) => `${BASE_URL}/api/public/products/${productId}`,
    
    // GET - Featured products (cached)
    productsFeatured: `${BASE_URL}/api/public/products/featured`,
    
    // GET - List categories (cached)
    categories: `${BASE_URL}/api/public/categories`,
    
    // GET - Category detail by ID
    // Param: categoryId (UUID)
    categoryDetail: (categoryId) => `${BASE_URL}/api/public/categories/${categoryId}`,
    
    // GET - List discounts/promotions (cached)
    discounts: `${BASE_URL}/api/public/discounts`,
    
    // GET - Discount detail by ID
    // Param: discountId (UUID)
    discountDetail: (discountId) => `${BASE_URL}/api/public/discounts/${discountId}`,
    
    // GET - List FAQs
    faqs: `${BASE_URL}/api/public/faqs`,
  },
  
  // ==========================================
  // CUSTOMER CART (Authenticated)
  // ==========================================
  cart: {
    // GET - View cart items
    view: `${BASE_URL}/api/customer/cart`,
    
    // POST - Add item to cart
    // Body: { product_id, quantity }
    add: `${BASE_URL}/api/customer/cart`,
    
    // PUT - Update cart item quantity
    // Param: cartItemId, Body: { quantity }
    update: (cartItemId) => `${BASE_URL}/api/customer/cart/${cartItemId}`,
    
    // DELETE - Remove item from cart
    // Param: cartItemId
    remove: (cartItemId) => `${BASE_URL}/api/customer/cart/${cartItemId}`,
    
    // DELETE - Clear all cart items
    clear: `${BASE_URL}/api/customer/cart`,
  },
  
  // ==========================================
  // CUSTOMER ORDERS (Authenticated)
  // ==========================================
  orders: {
    // POST - Create new order (checkout)
    // Body: { customer_name, customer_phone, delivery_method, 
    //         delivery_address, payment_method, bank_name }
    create: `${BASE_URL}/api/customer/orders/create`,
    
    // GET - Order history (pagination)
    // Query params: page, limit, status
    history: `${BASE_URL}/api/customer/orders/history`,
    
    // GET - Order detail by ID
    // Param: orderId (UUID)
    detail: (orderId) => `${BASE_URL}/api/customer/orders/history/${orderId}`,
    
    // PUT - Cancel order
    // Param: orderId
    cancel: (orderId) => `${BASE_URL}/api/customer/orders/${orderId}/cancel`,
    
    // POST - Reorder (create new order from previous order)
    // Param: orderId
    reorder: (orderId) => `${BASE_URL}/api/customer/orders/${orderId}/reorder`,
  },
  
  // ==========================================
  // CONTACT (Customer can send messages)
  // ==========================================
  contact: {
    // POST - Send contact message
    // Body: { name, email, phone, subject, message }
    send: `${BASE_URL}/api/customer/contact`,
  },
};

// Helper function untuk build URL dengan query params
// Contoh: buildUrl(endpoints.public.products, { page: 1, limit: 12 })
export function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
}

// Helper untuk generate random product ID dari array
export function randomProductId(products) {
  if (!products || products.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * products.length);
  return products[randomIndex].product_id;
}

// Helper untuk generate random category ID dari array
export function randomCategoryId(categories) {
  if (!categories || categories.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex].category_id;
}

// CARA PAKAI:
// import { endpoints, buildUrl } from '../config/endpoints.js';
// 
// const url = buildUrl(endpoints.public.products, { 
//   page: 1, 
//   limit: 12,
//   search: 'tomat' 
// });
// 
// const productUrl = endpoints.public.productDetail('uuid-product-id');
