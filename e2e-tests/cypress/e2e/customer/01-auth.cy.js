/**
 * E2E Test: Customer Authentication (Registration & Login)
 *
 * Tests:
 * - Customer registration with valid data
 * - Registration validation errors
 * - Customer login with valid credentials
 * - Login with invalid credentials
 * - Token persistence and expiry
 * - Logout functionality
 */

describe("Customer Authentication Flow", () => {
  let testCustomer;
  let invalidCustomers;

  before(() => {
    // Load test fixtures
    cy.fixture("customers").then((customers) => {
      testCustomer = customers.validCustomer;
      invalidCustomers = customers.invalidCustomers;
    });
  });

  beforeEach(() => {
    // Reset database before each test
    cy.resetDatabase();
    cy.seedDatabase("customers");

    // Clear auth state
    cy.customerLogout();

    // Visit base URL
    cy.visit("/");
  });

  /**
   * ========================================
   * REGISTRATION TESTS
   * ========================================
   */
  describe("Customer Registration", () => {
    beforeEach(() => {
      cy.visit("/register");
    });

    it("should display registration form correctly", () => {
      // Verify page title/description
      cy.contains("Bergabunglah dengan kami").should("be.visible");

      // Verify form fields exist
      cy.get('input[name="fullName"]').should("be.visible");
      cy.get('input[name="phoneNumber"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");
      cy.get('input[name="confirmPassword"]').should("be.visible");

      // Verify submit button
      cy.contains("button", "Daftar Sekarang").should("be.visible");

      // Verify login link
      cy.contains("Sudah punya akun?").should("be.visible");
    });

    it("should register new customer successfully", () => {
      const uniquePhone = `0812${Date.now().toString().slice(-8)}`;

      // Fill registration form
      cy.get('input[name="fullName"]').type("New Customer Test");
      cy.get('input[name="phoneNumber"]').type(uniquePhone);
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");

      // Accept terms checkbox
      cy.get('input[type="checkbox"]').check();

      // Submit form
      cy.contains("button", "Daftar Sekarang").click();

      // Verify success redirect to login
      cy.url().should("include", "/login");

      // Verify success toast
      cy.contains("Registrasi berhasil").should("be.visible");
    });

    it("should show validation error for short phone number", () => {
      cy.get('input[name="fullName"]').type("Test Customer");
      cy.get('input[name="phoneNumber"]').type("08123"); // Too short
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");

      cy.get('input[type="checkbox"]').check();
      cy.contains("button", "Daftar Sekarang").click();

      // Verify error message
      cy.contains("Format nomor telepon tidak valid").should("be.visible");

      // Should not redirect
      cy.url().should("include", "/register");
    });

    it("should show validation error for short name", () => {
      cy.get('input[name="fullName"]').type("A"); // Too short
      cy.get('input[name="phoneNumber"]').type("081234567890");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('input[type="checkbox"]').check();

      cy.contains("button", "Daftar Sekarang").click();

      // Wait for validation error to appear
      cy.wait(500);

      // Frontend shows inline error below input
      cy.contains("Nama lengkap minimal 2 karakter").should("be.visible");
    });

    it("should show validation error for weak password", () => {
      cy.get('input[name="fullName"]').type("Test Customer");
      cy.get('input[name="phoneNumber"]').type("081234567890");
      cy.get('input[name="password"]').type("123"); // Too short
      cy.get('input[name="confirmPassword"]').type("123");
      cy.get('input[type="checkbox"]').check();

      cy.contains("button", "Daftar Sekarang").click();

      // Wait for validation error
      cy.wait(500);

      // Frontend shows inline error below input
      cy.contains("Password minimal 6 karakter").should("be.visible");
    });

    it("should show error for password mismatch", () => {
      cy.get('input[name="fullName"]').type("Test Customer");
      cy.get('input[name="phoneNumber"]').type("081234567890");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password456"); // Different
      cy.get('input[type="checkbox"]').check();

      cy.contains("button", "Daftar Sekarang").click();

      // Verify error message
      cy.contains("Konfirmasi password tidak sesuai").should("be.visible");
    });

    it("should show error for duplicate phone number", () => {
      // Try to register with existing phone
      cy.get('input[name="fullName"]').type("Duplicate Customer");
      cy.get('input[name="phoneNumber"]').type(testCustomer.phone_number);
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('input[type="checkbox"]').check();

      cy.contains("button", "Daftar Sekarang").click();

      // Verify error message
      cy.contains("Nomor telepon sudah terdaftar").should("be.visible");
    });

    it("should toggle password visibility", () => {
      cy.get('input[name="password"]').should("have.attr", "type", "password");

      // Click show password button
      cy.get('input[name="password"]').parent().find("button").click();

      // Should change to text
      cy.get('input[name="password"]').should("have.attr", "type", "text");

      // Click again to hide
      cy.get('input[name="password"]').parent().find("button").click();
      cy.get('input[name="password"]').should("have.attr", "type", "password");
    });
  });

  /**
   * ========================================
   * LOGIN TESTS
   * ========================================
   */
  describe("Customer Login", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("should display login form correctly", () => {
      // Verify welcome text
      cy.contains("Selamat datang kembali").should("be.visible");

      // Verify form fields
      cy.get('input[name="phoneNumber"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");

      // Verify submit button
      cy.contains("button", "Masuk").should("be.visible");

      // Verify register link
      cy.contains("Belum punya akun?").should("be.visible");
    });

    it("should login with valid credentials", () => {
      // Intercept login API
      cy.intercept("POST", "**/api/customer/auth/login").as("loginRequest");

      // Fill login form
      cy.get('input[name="phoneNumber"]').type(testCustomer.phone_number);
      cy.get('input[name="password"]').type(testCustomer.password);

      // Submit form
      cy.contains("button", "Masuk").click();

      // Wait for API response
      cy.wait("@loginRequest", { timeout: 10000 })
        .its("response.statusCode")
        .should("eq", 200);

      // Verify redirect to /home (as per Login.jsx: navigate('/home'))
      cy.url({ timeout: 15000 }).should("include", "/home");

      // Verify authenticated state
      cy.shouldBeAuthenticated();

      // Verify user data in localStorage
      cy.getCustomerData().should("exist").and("have.property", "phone_number");
    });

    it("should show error for invalid phone number", () => {
      // Intercept login API
      cy.intercept("POST", "**/api/customer/auth/login").as("loginRequest");

      cy.get('input[name="phoneNumber"]').type("0899999999");
      cy.get('input[name="password"]').type("wrongpassword");

      cy.contains("button", "Masuk").click();

      // Wait for API response - should be 401
      cy.wait("@loginRequest", { timeout: 10000 })
        .its("response.statusCode")
        .should("eq", 401);

      // Should not redirect
      cy.url().should("include", "/login");

      // Should not be authenticated
      cy.shouldNotBeAuthenticated();
    });

    it("should show error for wrong password", () => {
      // Intercept login API
      cy.intercept("POST", "**/api/customer/auth/login").as("loginRequest");

      cy.get('input[name="phoneNumber"]').type(testCustomer.phone_number);
      cy.get('input[name="password"]').type("wrongpassword123");

      cy.contains("button", "Masuk").click();

      // Wait for API response - should be 401
      cy.wait("@loginRequest", { timeout: 10000 })
        .its("response.statusCode")
        .should("eq", 401);

      // Should stay on login page
      cy.url().should("include", "/login");
    });

    it("should show validation error for empty fields", () => {
      // Verify inputs exist and are visible
      cy.get('input[name="phoneNumber"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");

      // Try to submit empty form - should not make API call
      cy.contains("button", "Masuk").click();

      // Should stay on login page (validation prevents submit)
      cy.url().should("include", "/login");

      // Should not be authenticated
      cy.shouldNotBeAuthenticated();
    });

    it("should normalize phone number (08xxx to 628xxx)", () => {
      // Intercept login API
      cy.intercept("POST", "**/api/customer/auth/login").as("loginRequest");

      // Login with 08xxx format
      cy.get('input[name="phoneNumber"]').type("081234567890");
      cy.get('input[name="password"]').type(testCustomer.password);

      cy.contains("button", "Masuk").click();

      // Wait for API response
      cy.wait("@loginRequest", { timeout: 10000 })
        .its("response.statusCode")
        .should("eq", 200);

      // Should login successfully (backend normalizes it)
      cy.url({ timeout: 15000 }).should("include", "/home");
      cy.shouldBeAuthenticated();

      // Verify normalized phone in localStorage
      cy.getCustomerData().then((customer) => {
        expect(customer.phone_number).to.match(/^628/);
      });
    });
  });

  /**
   * ========================================
   * TOKEN PERSISTENCE TESTS
   * ========================================
   */
  describe("Token Persistence", () => {
    it("should persist auth state after page refresh", () => {
      // Login
      cy.customerLogin(testCustomer.phone_number, testCustomer.password);
      cy.visit("/home");

      // Verify authenticated
      cy.shouldBeAuthenticated();

      // Reload page
      cy.reload();

      // Should still be authenticated
      cy.shouldBeAuthenticated();
      cy.url().should("include", "/home");
    });

    it("should persist auth across different pages", () => {
      // Login
      cy.customerLogin(testCustomer.phone_number, testCustomer.password);

      // Navigate to different pages
      cy.visit("/products");
      cy.shouldBeAuthenticated();

      cy.visit("/cart");
      cy.shouldBeAuthenticated();

      cy.visit("/profile");
      cy.shouldBeAuthenticated();
    });
  });

  /**
   * ========================================
   * LOGOUT TESTS
   * ========================================
   */
  describe("Customer Logout", () => {
    beforeEach(() => {
      // Login before each test
      cy.customerLogin(testCustomer.phone_number, testCustomer.password);
      cy.visit("/home");
    });

    it("should logout successfully", () => {
      // Verify logged in
      cy.shouldBeAuthenticated();

      // Logout via custom command (clears localStorage)
      cy.customerLogout();

      // Visit root to trigger redirect
      cy.visit("/");

      // Verify logged out
      cy.shouldNotBeAuthenticated();

      // Should redirect to landing when not authenticated
      cy.url().should("include", "/landing");
    });

    it("should clear localStorage on logout", () => {
      cy.shouldBeAuthenticated();

      // Logout via command
      cy.customerLogout();

      // Verify localStorage cleared
      cy.window().then((win) => {
        const storage = win.localStorage.getItem("baletani-customer-storage");
        expect(storage).to.be.null;
      });
    });
  });

  /**
   * ========================================
   * PROTECTED ROUTE TESTS
   * ========================================
   */
  describe("Protected Routes", () => {
    it("should redirect to login when accessing cart without auth", () => {
      cy.visit("/cart");

      // Should redirect to login
      cy.url().should("include", "/login");
    });

    it("should redirect to login when accessing profile without auth", () => {
      cy.visit("/profile");
      cy.url().should("include", "/login");
    });

    it("should allow access to public pages without auth", () => {
      // Products page should be accessible
      cy.visit("/products");
      cy.url().should("include", "/products");

      // Categories page should be accessible
      cy.visit("/categories");
      cy.url().should("include", "/categories");

      // Contact page should be accessible
      cy.visit("/contact");
      cy.url().should("include", "/contact");
    });
  });
});
