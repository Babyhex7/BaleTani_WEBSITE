/**
 * E2E Test: Customer Checkout & Order Creation
 *
 * Tests:
 * - Checkout page display & validation
 * - Pickup method selection (Delivery vs Self Pickup)
 * - Payment method selection (Transfer, QRIS, Cash)
 * - Bank selection for transfer (BRI, BCA, MANDIRI)
 * - Delivery address validation
 * - Order creation with different methods
 * - WhatsApp link generation
 * - Order success page display
 * - Payment instructions display
 * - Order expiry countdown (10 minutes for transfer)
 */

describe("Customer Checkout Flow", () => {
  let testProducts;
  let testCustomer;

  before(() => {
    // Load fixtures
    cy.fixture("products").then((products) => {
      testProducts = products.validProducts;
    });
    cy.fixture("customers").then((customers) => {
      testCustomer = customers.validCustomer;
    });
  });

  beforeEach(() => {
    // Reset database & seed products
    cy.resetDatabase();
    cy.seedDatabase("products");

    // Login as customer
    cy.customerLogin(testCustomer.phone_number, testCustomer.password);

    // Add products to cart
    cy.addToCart("prod-001", 2); // Beras Premium
    cy.addToCart("prod-002", 1); // Telur (with discount)
  });

  /**
   * ========================================
   * CHECKOUT PAGE ACCESS & DISPLAY
   * ========================================
   */
  describe("Checkout Page Access", () => {
    it("should redirect to login if not authenticated", () => {
      // Logout first
      cy.customerLogout();

      // Try to access checkout
      cy.visit("/checkout");

      // Should redirect to login with returnUrl
      cy.url().should("include", "/login");
      cy.url().should("include", "returnUrl=/checkout");
    });

    it("should redirect to cart if cart is empty", () => {
      // Clear cart
      cy.clearCart();

      // Try to access checkout
      cy.visit("/checkout");

      // Should redirect to cart
      cy.url().should("include", "/cart");
    });

    it("should display checkout page correctly", () => {
      cy.visit("/checkout");

      // Verify page title
      cy.contains("Checkout Pesanan").should("be.visible");

      // Verify back to cart button
      cy.contains("Kembali ke Keranjang").should("be.visible");

      // Verify cart items section
      cy.contains("Produk yang Dibeli").should("be.visible");

      // Verify pickup method section
      cy.contains("Metode Pengambilan").should("be.visible");

      // Verify payment method section
      cy.contains("Metode Pembayaran").should("be.visible");
    });

    it("should display cart items in checkout", () => {
      cy.visit("/checkout");

      // Should show product names
      cy.contains("Beras Premium").should("be.visible");
      cy.contains("Telur").should("be.visible");

      // Should show quantities
      cy.contains("x 2").should("be.visible");
      cy.contains("x 1").should("be.visible");

      // Should show prices
      cy.contains(/Rp\s*[\d.,]+/).should("be.visible");
    });

    it("should calculate totals correctly", () => {
      // Test di desktop viewport biar summary sidebar visible
      cy.viewport(1280, 720);
      cy.visit("/checkout");

      // Verify desktop sidebar exists (hidden on mobile, visible on lg)
      cy.get(".hidden.lg\\:block").should("exist");

      // Verify elements inside desktop sidebar
      cy.get(".hidden.lg\\:block")
        .contains("Ringkasan Pembayaran")
        .should("be.visible");

      cy.get(".hidden.lg\\:block")
        .contains("Subtotal Produk")
        .should("be.visible");

      cy.get(".hidden.lg\\:block")
        .contains("Biaya Pengiriman")
        .should("be.visible");

      cy.get(".hidden.lg\\:block")
        .contains("Total Pembayaran")
        .should("be.visible");

      // Get total from desktop sidebar
      cy.get(".hidden.lg\\:block")
        .find(".text-2xl.font-bold.text-green-600")
        .invoke("text")
        .then((text) => {
          expect(text).to.match(/Rp\s*[\d.,]+/);
        });
    });
  });

  /**
   * ========================================
   * PICKUP METHOD SELECTION
   * ========================================
   */
  describe("Pickup Method Selection", () => {
    beforeEach(() => {
      cy.visit("/checkout");
    });

    it("should display pickup method options", () => {
      // Verify both options visible (gunakan text actual FE)
      cy.contains("Ambil Sendiri").should("be.visible");
      cy.contains("Pengantaran").should("be.visible");
    });

    it("should select self pickup by default", () => {
      // Self pickup should be selected by default
      cy.get('input[value="self_pickup"]').should("be.checked");
    });

    it("should switch to delivery method", () => {
      // Click delivery option (gunakan actual text)
      cy.get('input[name="pickup"][value="delivery"]').click({ force: true });
      cy.wait(300);

      // Verify delivery selected
      cy.get('input[value="delivery"]').should("be.checked");

      // Verify delivery address field appears
      cy.get('textarea[placeholder*="Jalan"]').should("be.visible");
    });

    it("should hide delivery address for self pickup", () => {
      // Switch to delivery first
      cy.get('input[name="pickup"][value="delivery"]').click({ force: true });
      cy.wait(300);
      cy.get('textarea[placeholder*="Jalan"]').should("be.visible");

      // Select self pickup
      cy.get('input[name="pickup"][value="self_pickup"]').click({
        force: true,
      });
      cy.wait(300);

      // Delivery address should not be visible
      cy.contains("Alamat Pengiriman").should("not.exist");
    });

    it("should update delivery fee based on method", () => {
      // Test di desktop viewport
      cy.viewport(1280, 720);

      // Self pickup - FREE (default state)
      cy.get('input[name="pickup"][value="self_pickup"]').should("be.checked");
      cy.wait(300);

      // Check desktop sidebar for GRATIS
      cy.get(".hidden.lg\\:block")
        .contains("Biaya Pengiriman")
        .parent()
        .should("contain", "GRATIS");

      // Delivery - Rp 10.000
      cy.get('input[name="pickup"][value="delivery"]').click({ force: true });
      cy.wait(500);

      // Check desktop sidebar for price
      cy.get(".hidden.lg\\:block")
        .contains("Biaya Pengiriman")
        .should("be.visible");
      cy.get(".hidden.lg\\:block")
        .contains(/Rp\s*10[.,]000/)
        .should("be.visible");
    });
  });

  /**
   * ========================================
   * PAYMENT METHOD SELECTION
   * ========================================
   */
  describe("Payment Method Selection", () => {
    beforeEach(() => {
      cy.visit("/checkout");
    });

    it("should display payment method options", () => {
      // Verify all payment methods visible
      cy.contains("Transfer Bank").should("be.visible");
      cy.contains("QRIS").should("be.visible");
      cy.contains("Tunai").should("be.visible");
    });

    it("should select QRIS by default", () => {
      // QRIS should be selected by default
      cy.get('input[value="qris"]').should("be.checked");
    });

    it("should switch to transfer payment", () => {
      // Click transfer option
      cy.get('input[name="payment"][value="transfer"]').click({ force: true });
      cy.wait(300);

      // Verify transfer selected
      cy.get('input[value="transfer"]').should("be.checked");

      // Bank selection should appear
      cy.contains("Pilih Bank").should("be.visible");
    });

    it("should display bank options for transfer", () => {
      // Select transfer
      cy.get('input[name="payment"][value="transfer"]').click({ force: true });
      cy.wait(500);

      // Verify bank options
      cy.contains("BRI").should("be.visible");
      cy.contains("BCA").should("be.visible");
      cy.contains("MANDIRI").should("be.visible");
    });

    it("should select bank for transfer", () => {
      // Select transfer
      cy.get('input[name="payment"][value="transfer"]').click({ force: true });
      cy.wait(500);

      // Select BRI
      cy.get('input[name="bank"][value="BRI"]').click({ force: true });

      // Verify BRI selected
      cy.get('input[name="bank"][value="BRI"]').should("be.checked");
    });

    it("should switch to cash payment", () => {
      // Click cash option
      cy.get('input[name="payment"][value="cash"]').click({ force: true });
      cy.wait(300);

      // Verify cash selected
      cy.get('input[value="cash"]').should("be.checked");

      // Bank selection should not be visible
      cy.contains("Pilih Bank").should("not.exist");
    });

    it("should switch to QRIS payment", () => {
      // Click QRIS option
      cy.get('input[name="payment"][value="qris"]').click({ force: true });
      cy.wait(300);

      // Verify QRIS selected
      cy.get('input[value="qris"]').should("be.checked");
    });
  });

  /**
   * ========================================
   * ORDER CREATION - TRANSFER BANK
   * ========================================
   */
  describe("Create Order - Transfer Bank", () => {
    beforeEach(() => {
      cy.visit("/checkout");
      cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");

      // Debug: Verify token exists in localStorage
      cy.window().then((win) => {
        const storage = win.localStorage.getItem("baletani-customer-storage");
        const parsed = JSON.parse(storage);
        cy.log(
          `🔑 Token check: ${parsed?.state?.token ? "EXISTS" : "MISSING"}`
        );
        expect(parsed?.state?.token, "Customer token must exist").to.exist;
      });
    });

    it("should create order with BRI transfer", () => {
      // Self pickup should be selected by default
      cy.get('input[name="pickup"][value="self_pickup"]').should("be.checked");

      // Select transfer
      cy.get('input[name="payment"][value="transfer"]').click({ force: true });
      cy.wait(500);

      // Select BRI
      cy.get('input[name="bank"][value="BRI"]').click({ force: true });
      cy.wait(500);

      // Click create order (desktop button in sidebar)
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });

      // Wait for API response
      cy.wait("@createOrder", { timeout: 15000 }).then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.success).to.be.true;
        expect(interception.response.body.data.payment_method).to.equal(
          "transfer"
        );
      });

      // Should redirect to order success
      cy.url({ timeout: 10000 }).should("include", "/order-success");
    });

    it("should create order with BCA transfer", () => {
      // Select delivery
      cy.get('input[name="pickup"][value="delivery"]').click({ force: true });
      cy.wait(500);

      // Fill delivery address
      cy.get('textarea[placeholder*="Jalan"]').type(
        "Jl. Merdeka No. 45, Jakarta Pusat"
      );

      // Select transfer
      cy.get('input[name="payment"][value="transfer"]').click({ force: true });
      cy.wait(500);

      // Select BCA
      cy.get('input[name="bank"][value="BCA"]').click({ force: true });
      cy.wait(500);

      // Create order
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });

      cy.wait("@createOrder", { timeout: 15000 }).then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.data.payment.bank).to.equal("BCA");
        expect(interception.response.body.data.delivery_method).to.equal(
          "delivery"
        );
      });

      cy.url({ timeout: 10000 }).should("include", "/order-success");
    });

    it("should create order with MANDIRI transfer", () => {
      cy.get('input[name="payment"][value="transfer"]').click({ force: true });
      cy.wait(500);

      cy.get('input[name="bank"][value="MANDIRI"]').click({ force: true });
      cy.wait(500);

      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });

      cy.wait("@createOrder", { timeout: 15000 });
      cy.url({ timeout: 10000 }).should("include", "/order-success");
    });

    it("should validate bank selection for transfer", () => {
      // Select transfer but don't select bank
      cy.get('input[name="payment"][value="transfer"]').click({ force: true });
      cy.wait(500);

      // Try to create order without selecting bank
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });

      // Should show error toast
      cy.contains("Pilih bank terlebih dahulu", { timeout: 5000 }).should(
        "be.visible"
      );

      // Should not redirect
      cy.url().should("include", "/checkout");
    });
  });

  /**
   * ========================================
   * ORDER CREATION - OTHER METHODS
   * ========================================
   */
  describe("Create Order - QRIS & Cash", () => {
    beforeEach(() => {
      cy.visit("/checkout");
      cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");
    });

    it("should create order with QRIS", () => {
      // QRIS already selected by default
      cy.get('input[value="qris"]').should("be.checked");

      // Create order
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });

      cy.wait("@createOrder", { timeout: 15000 }).then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.data.payment_method).to.equal("qris");
      });

      cy.url({ timeout: 10000 }).should("include", "/order-success");
    });

    it("should create order with cash", () => {
      // Select cash
      cy.get('input[name="payment"][value="cash"]').click({ force: true });
      cy.wait(500);

      // Create order
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });

      cy.wait("@createOrder", { timeout: 15000 }).then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body.data.payment_method).to.equal("cash");
        expect(interception.response.body.data.order_status).to.equal(
          "pending_pickup"
        );
      });

      cy.url({ timeout: 10000 }).should("include", "/order-success");
    });

    it("should create cash order with delivery", () => {
      // Select delivery
      cy.get('input[name="pickup"][value="delivery"]').click({ force: true });
      cy.wait(500);

      // Fill address
      cy.get('textarea[placeholder*="Jalan"]').type("Jl. Sudirman No. 100");

      // Select cash
      cy.get('input[name="payment"][value="cash"]').click({ force: true });
      cy.wait(500);

      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });

      cy.wait("@createOrder", { timeout: 15000 }).then((interception) => {
        expect(interception.response.body.data.payment_method).to.equal("cash");
        expect(interception.response.body.data.delivery_method).to.equal(
          "delivery"
        );
        expect(interception.response.body.data.delivery_address).to.include(
          "Sudirman"
        );
      });

      cy.url({ timeout: 10000 }).should("include", "/order-success");
    });
  });

  /**
   * ========================================
   * VALIDATION TESTS
   * ========================================
   */
  describe("Order Validation", () => {
    beforeEach(() => {
      cy.visit("/checkout");
    });

    it("should validate delivery address for delivery method", () => {
      // Select delivery
      cy.get('input[name="pickup"][value="delivery"]').click({ force: true });
      cy.wait(500);

      // Don't fill address
      // Try to create order
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });

      // Should show error
      cy.contains("Alamat pengiriman wajib diisi", { timeout: 5000 }).should(
        "be.visible"
      );
      cy.url().should("include", "/checkout");
    });

    it("should not validate address for self pickup", () => {
      cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");

      // Self pickup selected by default
      cy.get('input[value="self_pickup"]').should("be.checked");

      // No address needed - can create order
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });

      // Should succeed
      cy.wait("@createOrder", { timeout: 15000 });
      cy.url({ timeout: 10000 }).should("include", "/order-success");
    });

    it("should validate payment method selection", () => {
      // This is handled by default value, but test the UI
      cy.get('input[name="payment"]').should("exist");
      cy.get('input[name="payment"]:checked').should("exist");
    });
  });

  /**
   * ========================================
   * ORDER SUCCESS PAGE
   * ========================================
   */
  describe("Order Success Page", () => {
    beforeEach(() => {
      cy.visit("/checkout");
      cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");
    });

    it("should display success message", () => {
      // Create order
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      // Check success page
      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // Success icon and message
      cy.get('[data-testid="success-icon"]').should("be.visible");
      cy.contains("Pesanan Berhasil Dibuat").should("be.visible");
    });

    it("should display order number", () => {
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // Order number format: ORD-YYYYMMDD-XXX
      cy.contains(/ORD-\d{8}-\d{3}/).should("be.visible");
    });

    it("should display payment instructions for transfer", () => {
      // Select transfer with BRI
      cy.contains("label", "Transfer Bank").click();
      cy.wait(500);
      cy.contains("label", "BRI").click();
      cy.wait(500);

      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // Payment info
      cy.contains("Bank").should("be.visible");
      cy.contains("BRI").should("be.visible");
      cy.contains("Rekening Transfer").should("be.visible");

      // Virtual account number
      cy.get(".font-mono").should("exist");

      // Copy button
      cy.contains("Salin").should("be.visible");
    });

    it("should display countdown timer for pending payment", () => {
      // Create transfer order
      cy.contains("label", "Transfer Bank").click();
      cy.wait(500);
      cy.contains("label", "BRI").click();
      cy.wait(500);

      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // Countdown timer
      cy.contains("Selesaikan pembayaran dalam").should("be.visible");
      cy.contains(/\d+:\d+/).should("be.visible"); // MM:SS format
    });

    it("should display WhatsApp contact link", () => {
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // WhatsApp button
      cy.contains("Hubungi via WhatsApp").should("be.visible");
    });

    it("should have navigation buttons", () => {
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // Navigation buttons
      cy.contains("Kembali ke Beranda").should("be.visible");
      cy.contains("Lihat Pesanan Saya").should("be.visible");
    });

    it("should copy virtual account number", () => {
      // Create transfer order
      cy.contains("label", "Transfer Bank").click();
      cy.wait(500);
      cy.contains("label", "BRI").click();
      cy.wait(500);

      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // Click copy button
      cy.contains("button", "Salin").click();

      // Toast should appear
      cy.contains("berhasil disalin", { matchCase: false }).should(
        "be.visible"
      );
    });

    it("should navigate to home from success page", () => {
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // Click home button
      cy.contains("Kembali ke Beranda").click();
      cy.url().should("include", "/home");
    });

    it("should navigate to order history from success page", () => {
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // Click order history button
      cy.contains("Lihat Pesanan Saya").click();
      cy.url().should("include", "/purchase-history");
    });
  });

  /**
   * ========================================
   * CART CLEARING AFTER ORDER
   * ========================================
   */
  describe("Cart After Order", () => {
    it("should clear cart after successful order", () => {
      cy.visit("/checkout");
      cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");

      // Create order
      cy.viewport(1280, 720);
      cy.contains("button", "Buat Pesanan")
        .filter(":visible")
        .as("buatPesananBtn");
      cy.get("@buatPesananBtn").click({ force: true });
      cy.wait("@createOrder", { timeout: 15000 });

      // Wait for success page
      cy.url({ timeout: 10000 }).should("include", "/order-success");

      // Navigate to cart
      cy.visit("/cart");

      // Cart should be empty
      cy.contains("Keranjang Anda kosong").should("be.visible");
    });
  });

  /**
   * ========================================
   * RESPONSIVE TESTS
   * ========================================
   */
  describe("Responsive Checkout", () => {
    it("should display mobile layout correctly", () => {
      cy.viewport(375, 667);
      cy.visit("/checkout");

      // Mobile order button at bottom
      cy.get(".fixed.bottom-0").should("be.visible");
      cy.get(".fixed.bottom-0")
        .contains("button", "Buat Pesanan")
        .should("be.visible");
    });

    it("should create order from mobile", () => {
      cy.viewport(375, 667);
      cy.visit("/checkout");
      cy.intercept("POST", "**/api/customer/orders/create").as("createOrder");

      // Scroll to bottom button
      cy.scrollTo("bottom");

      // Click mobile button
      cy.get(".fixed.bottom-0")
        .contains("button", "Buat Pesanan")
        .click({ force: true });

      cy.wait("@createOrder", { timeout: 15000 });
      cy.url({ timeout: 10000 }).should("include", "/order-success");
    });

    it("should display tablet layout correctly", () => {
      cy.viewport(768, 1024);
      cy.visit("/checkout");

      // Should show checkout content
      cy.contains("Checkout Pesanan").should("be.visible");
      cy.contains("Metode Pengambilan").should("be.visible");
    });
  });
});
