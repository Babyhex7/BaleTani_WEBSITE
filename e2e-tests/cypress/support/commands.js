/**
 * ===========================
 * CUSTOM CYPRESS COMMANDS
 * BaleTani E2E Tests - Customer Area
 * ===========================
 */

/**
 * ===========================
 * AUTHENTICATION COMMANDS
 * ===========================
 */

/**
 * Login via API and set localStorage (Zustand persist format)
 * @param {string} phone - Phone number (08xxx format accepted)
 * @param {string} password - Customer password
 * @example cy.customerLogin('081234567890', 'password123')
 */
Cypress.Commands.add(
  "customerLogin",
  (phone = "081234567890", password = "password123") => {
    cy.request({
      method: "POST",
      url: `${Cypress.env("API_URL")}/customer/auth/login`,
      body: {
        phone_number: phone,
        password: password,
      },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200) {
        const { customer, token } = response.body.data;

        // Zustand persist format for customer auth
        const zustandStorage = {
          state: {
            user: customer,
            token: token,
            isAuthenticated: true,
            tokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          },
          version: 0,
        };

        cy.window().then((win) => {
          win.localStorage.setItem(
            "baletani-customer-storage",
            JSON.stringify(zustandStorage)
          );
        });

        cy.log("✅ Customer logged in successfully");
      } else {
        cy.log("❌ Login failed:", response.body.message);
        throw new Error(`Login failed: ${response.body.message}`);
      }
    });
  }
);

/**
 * Register new customer via API
 * @param {Object} customerData - Customer registration data
 * @returns Cypress chainable with response
 * @example
 * cy.customerRegister({
 *   phone_number: '081234567890',
 *   full_name: 'Test Customer',
 *   password: 'password123'
 * })
 */
Cypress.Commands.add("customerRegister", (customerData) => {
  const defaultData = {
    phone_number: `0812${Date.now().toString().slice(-8)}`, // Unique phone
    full_name: "Test Customer",
    password: "password123",
  };

  const data = { ...defaultData, ...customerData };

  return cy
    .request({
      method: "POST",
      url: `${Cypress.env("API_URL")}/customer/auth/register`,
      body: data,
      failOnStatusCode: false,
    })
    .then((response) => {
      if (response.status === 201 || response.status === 200) {
        cy.log("✅ Customer registered successfully");
      } else {
        cy.log("❌ Registration failed:", response.body.message);
      }
      return response;
    });
});

/**
 * Logout customer (clear localStorage)
 * @example cy.customerLogout()
 */
Cypress.Commands.add("customerLogout", () => {
  cy.window().then((win) => {
    win.localStorage.removeItem("baletani-customer-storage");
    win.localStorage.removeItem("baletani-cart-storage");
    cy.log("✅ Customer logged out");
  });
});

/**
 * ===========================
 * CART COMMANDS
 * ===========================
 */

/**
 * Add product to cart via localStorage (Zustand)
 * @param {string} productId - UUID of product
 * @param {number} quantity - Quantity to add
 * @example cy.addToCart('prod-001', 2)
 */
Cypress.Commands.add("addToCart", (productId, quantity = 1) => {
  return cy.window().then((win) => {
    // Get current cart from localStorage
    const cartStorage = JSON.parse(
      win.localStorage.getItem("baletani-cart") || '{"state":{"items":[]}}'
    );

    const currentItems = cartStorage.state?.items || [];

    // Mock product data (should match seeded products)
    const productData = {
      "prod-001": {
        id: "prod-001",
        name: "Beras Premium 5kg",
        price: 75000,
        finalPrice: 75000,
        stock: 100,
        unit: "5 kg",
      },
      "prod-002": {
        id: "prod-002",
        name: "Telur Ayam Kampung 10 Butir",
        price: 30000,
        finalPrice: 27000,
        stock: 50,
        unit: "10 butir",
        discount: { value: 10, type: "percentage" },
      },
      "prod-003": {
        id: "prod-003",
        name: "Sayuran Organik Mix 1kg",
        price: 25000,
        finalPrice: 25000,
        stock: 30,
        unit: "1 kg",
      },
      "prod-004": {
        id: "prod-004",
        name: "Jeruk Manis 1kg",
        price: 20000,
        finalPrice: 20000,
        stock: 40,
        unit: "1 kg",
      },
      "prod-005": {
        id: "prod-005",
        name: "Cabai Merah 500g",
        price: 15000,
        finalPrice: 15000,
        stock: 0,
        unit: "500 gram",
      },
    };

    const product = productData[productId];
    if (!product) {
      cy.log(`❌ Product ${productId} not found in mock data`);
      return;
    }

    // Check if item already in cart
    const existingItemIndex = currentItems.findIndex(
      (item) => item.id === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      currentItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      currentItems.push({
        ...product,
        quantity: quantity,
        image: null,
      });
    }

    // Update localStorage
    cartStorage.state.items = currentItems;
    win.localStorage.setItem("baletani-cart", JSON.stringify(cartStorage));

    cy.log(`✅ Added ${quantity}x ${product.name} to cart (localStorage)`);
  });
});

/**
 * Update cart item quantity via API
 * @param {string} cartItemId - UUID of cart item
 * @param {number} quantity - New quantity
 * @example cy.updateCartItem('cart-item-uuid', 5)
 */
Cypress.Commands.add("updateCartItem", (cartItemId, quantity) => {
  return cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    const token = storage.state?.token;

    return cy
      .request({
        method: "PUT",
        url: `${Cypress.env("API_URL")}/customer/cart/${cartItemId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { quantity },
        failOnStatusCode: false,
      })
      .then((response) => {
        if (response.status === 200) {
          cy.log(`✅ Updated cart item quantity to ${quantity}`);
        }
      });
  });
});

/**
 * Remove item from cart via API
 * @param {string} cartItemId - UUID of cart item
 * @example cy.removeFromCart('cart-item-uuid')
 */
Cypress.Commands.add("removeFromCart", (cartItemId) => {
  cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    const token = storage.state?.token;

    return cy
      .request({
        method: "DELETE",
        url: `${Cypress.env("API_URL")}/customer/cart/${cartItemId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        failOnStatusCode: false,
      })
      .then((response) => {
        if (response.status === 200) {
          cy.log("✅ Removed item from cart");
        }
        return response;
      });
  });
});

/**
 * Clear entire cart via localStorage
 * @example cy.clearCart()
 */
Cypress.Commands.add("clearCart", () => {
  return cy.window().then((win) => {
    const cartStorage = { state: { items: [] }, version: 0 };
    win.localStorage.setItem("baletani-cart", JSON.stringify(cartStorage));
    cy.log("✅ Cart cleared (localStorage)");
  });
});

/**
 * Get cart via API
 * @returns Cypress chainable with cart data
 * @example cy.getCart().then((cart) => { ... })
 */
Cypress.Commands.add("getCart", () => {
  cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    const token = storage.state?.token;

    return cy
      .request({
        method: "GET",
        url: `${Cypress.env("API_URL")}/customer/cart`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        failOnStatusCode: false,
      })
      .then((response) => {
        return response.body.data;
      });
  });
});

/**
 * ===========================
 * ORDER COMMANDS
 * ===========================
 */

/**
 * Create order via API
 * @param {Object} orderData - Order data
 * @returns Cypress chainable with order response
 * @example
 * cy.createOrder({
 *   payment_method: 'transfer',
 *   delivery_method: 'delivery',
 *   delivery_address: 'Jl. Test No. 123'
 * })
 */
Cypress.Commands.add("createOrder", (orderData) => {
  cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    const token = storage.state?.token;

    return cy
      .request({
        method: "POST",
        url: `${Cypress.env("API_URL")}/customer/orders/create`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: orderData,
        failOnStatusCode: false,
      })
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          cy.log("✅ Order created successfully");
        }
        return response;
      });
  });
});

/**
 * Get order history via API
 * @returns Cypress chainable with orders
 * @example cy.getOrderHistory().then((orders) => { ... })
 */
Cypress.Commands.add("getOrderHistory", () => {
  cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    const token = storage.state?.token;

    return cy
      .request({
        method: "GET",
        url: `${Cypress.env("API_URL")}/customer/orders/history`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        failOnStatusCode: false,
      })
      .then((response) => {
        return response.body.data;
      });
  });
});

/**
 * Cancel order via API
 * @param {string} orderId - UUID of order
 * @param {string} reason - Cancellation reason
 * @example cy.cancelOrder('order-uuid', 'Salah pesan')
 */
Cypress.Commands.add("cancelOrder", (orderId, reason = "Test cancellation") => {
  cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    const token = storage.state?.token;

    return cy
      .request({
        method: "PUT",
        url: `${Cypress.env("API_URL")}/customer/orders/${orderId}/cancel`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: { reason },
        failOnStatusCode: false,
      })
      .then((response) => {
        if (response.status === 200) {
          cy.log("✅ Order cancelled");
        }
        return response;
      });
  });
});

/**
 * ===========================
 * DATABASE COMMANDS
 * ===========================
 */

/**
 * Reset test database (via Cypress task)
 * @example cy.resetDatabase()
 */
Cypress.Commands.add("resetDatabase", () => {
  return cy.task("db:reset", null, { timeout: 30000 }).then(() => {
    cy.log("✅ Database reset");
  });
});

/**
 * Seed test data (via Cypress task)
 * @param {string} fixture - Fixture name (e.g., 'products', 'customers')
 * @example cy.seedDatabase('products')
 */
Cypress.Commands.add("seedDatabase", (fixture) => {
  return cy.task("db:seed", fixture, { timeout: 30000 }).then(() => {
    cy.log(`✅ Database seeded with ${fixture}`);
  });
});

/**
 * ===========================
 * NAVIGATION COMMANDS
 * ===========================
 */

/**
 * Visit page as authenticated customer
 * @param {string} path - Page path
 * @param {Object} credentials - Optional login credentials
 * @example cy.visitAsCustomer('/cart')
 */
Cypress.Commands.add("visitAsCustomer", (path, credentials) => {
  const { phone = "081234567890", password = "password123" } =
    credentials || {};

  cy.customerLogin(phone, password);
  cy.visit(path);
});

/**
 * ===========================
 * ASSERTION COMMANDS
 * ===========================
 */

/**
 * Assert that customer is authenticated
 * @example cy.shouldBeAuthenticated()
 */
Cypress.Commands.add("shouldBeAuthenticated", () => {
  cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    expect(storage.state?.isAuthenticated, "Customer should be authenticated")
      .to.be.true;
    expect(storage.state?.token, "Token should exist").to.exist;
    expect(storage.state?.user, "User data should exist").to.exist;
    cy.log("✅ Customer is authenticated");
  });
});

/**
 * Assert that customer is NOT authenticated
 * @example cy.shouldNotBeAuthenticated()
 */
Cypress.Commands.add("shouldNotBeAuthenticated", () => {
  cy.window().then((win) => {
    const storage = win.localStorage.getItem("baletani-customer-storage");
    if (storage) {
      const parsed = JSON.parse(storage);
      expect(
        parsed.state?.isAuthenticated,
        "Customer should NOT be authenticated"
      ).to.not.be.true;
    }
    cy.log("✅ Customer is NOT authenticated");
  });
});

/**
 * ===========================
 * UTILITY COMMANDS
 * ===========================
 */

/**
 * Wait for API response
 * @param {string} alias - Intercept alias
 * @param {number} timeout - Timeout in ms
 * @example cy.waitForAPI('@getProducts')
 */
Cypress.Commands.add("waitForAPI", (alias, timeout = 10000) => {
  cy.wait(alias, { timeout });
});

/**
 * Get auth token from localStorage
 * @returns {string} JWT token
 * @example cy.getAuthToken().then((token) => { ... })
 */
Cypress.Commands.add("getAuthToken", () => {
  return cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    return storage.state?.token || null;
  });
});

/**
 * Get customer data from localStorage
 * @returns {Object} Customer data
 * @example cy.getCustomerData().then((customer) => { ... })
 */
Cypress.Commands.add("getCustomerData", () => {
  return cy.window().then((win) => {
    const storage = JSON.parse(
      win.localStorage.getItem("baletani-customer-storage") || "{}"
    );
    return storage.state?.user || null;
  });
});
