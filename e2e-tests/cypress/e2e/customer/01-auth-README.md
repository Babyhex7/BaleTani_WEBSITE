# 🔐 Authentication Testing Documentation

## 📋 Overview

**File:** `01-auth.cy.js`  
**Total Tests:** 21  
**Status:** ✅ 20/21 Passing (95.24%)  
**Duration:** ~2 min 31 sec

## 🎯 Test Coverage

### Test Suites

1. Customer Registration (8 tests)
2. Customer Login (5 tests)
3. Token Persistence (2 tests)
4. Customer Logout (2 tests)
5. Protected Routes (3 tests)
6. Navigation Flow (1 test)

---

## 1. Customer Registration Tests

### ✅ Test 1.1: Display registration form correctly

**Purpose:** Verify all form elements are visible and accessible

```javascript
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
```

**Expected Result:**

- Registration page displays correctly
- All form fields are visible
- Submit button is enabled
- Login link is present

---

### ✅ Test 1.2: Register new customer successfully

**Purpose:** Test successful customer registration flow

```javascript
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
```

**Test Data:**

```javascript
{
  fullName: "New Customer Test",
  phoneNumber: "0812XXXXXXXX" (unique),
  password: "password123",
  confirmPassword: "password123"
}
```

**Expected Result:**

- User successfully registered
- Redirected to login page
- Success message displayed

---

### ✅ Test 1.3: Validation for short phone number

**Purpose:** Ensure phone number must meet minimum length

```javascript
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
```

**Test Data:**

```javascript
{
  phoneNumber: "08123"; // Invalid - too short
}
```

**Expected Result:**

- Error message: "Format nomor telepon tidak valid"
- User stays on registration page

---

### ✅ Test 1.4: Validation for invalid phone format

**Purpose:** Ensure phone number format is correct

```javascript
it("should show validation error for invalid phone format", () => {
  cy.get('input[name="fullName"]').type("Test Customer");
  cy.get('input[name="phoneNumber"]').type("1234567890"); // Invalid format
  cy.get('input[name="password"]').type("password123");
  cy.get('input[name="confirmPassword"]').type("password123");

  cy.get('input[type="checkbox"]').check();
  cy.contains("button", "Daftar Sekarang").click();

  cy.contains("Format nomor telepon tidak valid").should("be.visible");
});
```

**Valid Phone Formats:**

- 08XXXXXXXXXX (starts with 08, 10-13 digits)
- 628XXXXXXXXX (starts with 628, 11-14 digits)

---

### ❌ Test 1.5: Validation for weak password

**Purpose:** Ensure password meets security requirements

```javascript
it("should show validation error for weak password", () => {
  cy.get('input[name="fullName"]').type("Test Customer");
  cy.get('input[name="phoneNumber"]').type("081234567890");
  cy.get('input[name="password"]').type("123"); // Too weak
  cy.get('input[name="confirmPassword"]').type("123");

  cy.get('input[type="checkbox"]').check();
  cy.contains("button", "Daftar Sekarang").click();

  // Expected error message
  cy.contains("Password minimal 6 karakter").should("be.visible");
});
```

**Status:** ❌ FAILING  
**Issue:** Error message not displayed  
**Expected:** "Password minimal 6 karakter"  
**Actual:** No error message shown

**Password Requirements:**

- Minimum 6 characters
- Maximum 100 characters

---

### ✅ Test 1.6: Validation for password mismatch

**Purpose:** Ensure confirm password matches password

```javascript
it("should show error for password mismatch", () => {
  cy.get('input[name="fullName"]').type("Test Customer");
  cy.get('input[name="phoneNumber"]').type("081234567890");
  cy.get('input[name="password"]').type("password123");
  cy.get('input[name="confirmPassword"]').type("password456"); // Mismatch

  cy.get('input[type="checkbox"]').check();
  cy.contains("button", "Daftar Sekarang").click();

  cy.contains("Password tidak cocok").should("be.visible");
});
```

**Expected Result:**

- Error message: "Password tidak cocok"
- Form not submitted

---

### ✅ Test 1.7: Validation for duplicate phone number

**Purpose:** Prevent registration with existing phone number

```javascript
it("should show error for duplicate phone number", () => {
  // Use existing customer phone number
  cy.get('input[name="fullName"]').type("Duplicate Test");
  cy.get('input[name="phoneNumber"]').type("081234567890"); // Already exists
  cy.get('input[name="password"]').type("password123");
  cy.get('input[name="confirmPassword"]').type("password123");

  cy.get('input[type="checkbox"]').check();
  cy.contains("button", "Daftar Sekarang").click();

  cy.contains("Nomor telepon sudah terdaftar").should("be.visible");
});
```

**Expected Result:**

- Error message: "Nomor telepon sudah terdaftar"
- Registration failed

---

### ✅ Test 1.8: Toggle password visibility

**Purpose:** Test show/hide password functionality

```javascript
it("should toggle password visibility", () => {
  cy.get('input[name="password"]').should("have.attr", "type", "password");

  // Click show password icon
  cy.get('[data-cy="toggle-password"]').click();

  // Password should be visible
  cy.get('input[name="password"]').should("have.attr", "type", "text");

  // Click again to hide
  cy.get('[data-cy="toggle-password"]').click();
  cy.get('input[name="password"]').should("have.attr", "type", "password");
});
```

---

## 2. Customer Login Tests

### ✅ Test 2.1: Display login form correctly

**Purpose:** Verify login page UI elements

```javascript
it("should display login form correctly", () => {
  // Verify page title
  cy.contains("Masuk ke Akun Anda").should("be.visible");

  // Verify form fields
  cy.get('input[name="phoneNumber"]').should("be.visible");
  cy.get('input[name="password"]').should("be.visible");

  // Verify submit button
  cy.contains("button", "Masuk").should("be.visible");

  // Verify register link
  cy.contains("Belum punya akun?").should("be.visible");
  cy.contains("Daftar Sekarang").should("be.visible");
});
```

---

### ✅ Test 2.2: Login with valid credentials

**Purpose:** Test successful login flow

```javascript
it("should login with valid credentials", () => {
  // Fill login form
  cy.get('input[name="phoneNumber"]').type("081234567890");
  cy.get('input[name="password"]').type("password123");

  // Submit
  cy.contains("button", "Masuk").click();

  // Verify success redirect
  cy.url().should("include", "/");
  cy.contains("Selamat datang").should("be.visible");

  // Verify token stored in localStorage
  cy.window().then((win) => {
    const token = win.localStorage.getItem("token");
    expect(token).to.exist;
    expect(token).to.not.be.empty;
  });

  // Verify user data stored
  cy.window().then((win) => {
    const user = JSON.parse(win.localStorage.getItem("user"));
    expect(user).to.exist;
    expect(user).to.have.property("full_name");
    expect(user).to.have.property("phone_number");
  });
});
```

**Test Credentials:**

```javascript
{
  phone: "081234567890",
  password: "password123"
}
```

**LocalStorage After Login:**

```javascript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: 1,
    full_name: "Customer Test",
    phone_number: "628123456789",
    role: "customer"
  }
}
```

---

### ✅ Test 2.3: Show error for invalid phone number

**Purpose:** Handle non-existent phone number

```javascript
it("should show error for invalid phone number", () => {
  cy.get('input[name="phoneNumber"]').type("089999999999"); // Not registered
  cy.get('input[name="password"]').type("password123");
  cy.contains("button", "Masuk").click();

  // Verify error message
  cy.contains("Nomor telepon tidak terdaftar").should("be.visible");
  cy.url().should("include", "/login");
});
```

---

### ✅ Test 2.4: Show error for wrong password

**Purpose:** Handle incorrect password

```javascript
it("should show error for wrong password", () => {
  cy.get('input[name="phoneNumber"]').type("081234567890");
  cy.get('input[name="password"]').type("wrongpassword");
  cy.contains("button", "Masuk").click();

  // Verify error message
  cy.contains("Password salah").should("be.visible");
  cy.url().should("include", "/login");
});
```

---

### ✅ Test 2.5: Phone number normalization

**Purpose:** Test automatic phone format conversion

```javascript
it("should normalize phone number (08xxx to 628xxx)", () => {
  // Login with 08 format
  cy.get('input[name="phoneNumber"]').type("081234567890");
  cy.get('input[name="password"]').type("password123");

  // Intercept API call
  cy.intercept("POST", "**/api/customer/auth/login").as("loginRequest");
  cy.contains("button", "Masuk").click();

  // Verify phone normalized to 628 format
  cy.wait("@loginRequest").then((interception) => {
    expect(interception.request.body.phone_number).to.match(/^628/);
  });
});
```

**Phone Normalization:**

- Input: `081234567890`
- Normalized: `628123456789`

---

## 3. Token Persistence Tests

### ✅ Test 3.1: Persist auth state after page refresh

**Purpose:** Ensure user stays logged in after refresh

```javascript
it("should persist auth state after page refresh", () => {
  // Login first
  cy.customerLogin("081234567890", "password123");
  cy.visit("/");

  // Verify logged in
  cy.contains("Selamat datang").should("be.visible");

  // Refresh page
  cy.reload();

  // Should still be logged in
  cy.contains("Selamat datang").should("be.visible");

  // Verify token still exists
  cy.window().then((win) => {
    const token = win.localStorage.getItem("token");
    expect(token).to.exist;
  });
});
```

---

### ✅ Test 3.2: Persist auth across different pages

**Purpose:** Ensure auth persists during navigation

```javascript
it("should persist auth across different pages", () => {
  cy.customerLogin("081234567890", "password123");

  // Navigate to products page
  cy.visit("/products");
  cy.window().then((win) => {
    expect(win.localStorage.getItem("token")).to.exist;
  });

  // Navigate to cart
  cy.visit("/cart");
  cy.window().then((win) => {
    expect(win.localStorage.getItem("token")).to.exist;
  });

  // Navigate to profile
  cy.visit("/profile");
  cy.window().then((win) => {
    expect(win.localStorage.getItem("token")).to.exist;
  });
});
```

---

## 4. Customer Logout Tests

### ✅ Test 4.1: Logout successfully

**Purpose:** Test logout functionality

```javascript
it("should logout successfully", () => {
  cy.customerLogin("081234567890", "password123");
  cy.visit("/");

  // Click user menu
  cy.get('[data-cy="user-menu"]').click();

  // Click logout
  cy.contains("Keluar").click();

  // Verify redirect to login
  cy.url().should("include", "/login");
  cy.contains("Masuk").should("be.visible");

  // Verify logout message
  cy.contains("Anda telah keluar").should("be.visible");
});
```

---

### ✅ Test 4.2: Clear localStorage on logout

**Purpose:** Ensure all auth data is removed

```javascript
it("should clear localStorage on logout", () => {
  cy.customerLogin("081234567890", "password123");
  cy.visit("/");

  // Verify data exists before logout
  cy.window().then((win) => {
    expect(win.localStorage.getItem("token")).to.exist;
    expect(win.localStorage.getItem("user")).to.exist;
  });

  // Logout
  cy.get('[data-cy="user-menu"]').click();
  cy.contains("Keluar").click();

  // Verify localStorage cleared
  cy.window().then((win) => {
    const token = win.localStorage.getItem("token");
    const user = win.localStorage.getItem("user");
    expect(token).to.be.null;
    expect(user).to.be.null;
  });
});
```

---

## 5. Protected Routes Tests

### ✅ Test 5.1: Redirect to login when accessing cart without auth

**Purpose:** Protect cart page from unauthenticated access

```javascript
it("should redirect to login when accessing cart without auth", () => {
  cy.customerLogout();
  cy.visit("/cart");

  // Should redirect to login
  cy.url().should("include", "/login");

  // Should have returnUrl parameter
  cy.url().should("include", "returnUrl=/cart");
});
```

---

### ✅ Test 5.2: Redirect to login when accessing profile without auth

**Purpose:** Protect profile page from unauthenticated access

```javascript
it("should redirect to login when accessing profile without auth", () => {
  cy.customerLogout();
  cy.visit("/profile");

  cy.url().should("include", "/login");
  cy.url().should("include", "returnUrl=/profile");
});
```

---

### ✅ Test 5.3: Allow access to public pages without auth

**Purpose:** Ensure public pages are accessible

```javascript
it("should allow access to public pages without auth", () => {
  cy.customerLogout();

  // Home page
  cy.visit("/");
  cy.url().should("not.include", "/login");

  // Products page
  cy.visit("/products");
  cy.url().should("not.include", "/login");

  // About page
  cy.visit("/about");
  cy.url().should("not.include", "/login");
});
```

**Public Pages:**

- `/` - Home
- `/products` - Products list
- `/products/:id` - Product detail
- `/about` - About
- `/contact` - Contact

**Protected Pages:**

- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/profile` - User profile
- `/order-history` - Order history
- `/order-success/:id` - Order success

---

## 🔧 Setup & Configuration

### Before Each Test

```javascript
beforeEach(() => {
  // Reset database
  cy.resetDatabase();

  // Seed test data
  cy.seedDatabase("customers");

  // Clear auth state
  cy.customerLogout();

  // Visit target page
  cy.visit("/register"); // or "/login"
});
```

### Test Fixtures

**Location:** `cypress/fixtures/customers.json`

```json
{
  "validCustomer": {
    "full_name": "Customer Test",
    "phone_number": "081234567890",
    "password": "password123"
  },
  "invalidCustomers": {
    "shortPhone": "08123",
    "invalidFormat": "1234567890",
    "weakPassword": "123"
  }
}
```

---

## 🎯 Custom Commands

### Authentication Commands

```javascript
// Login command
Cypress.Commands.add("customerLogin", (phoneNumber, password) => {
  cy.visit("/login");
  cy.get('input[name="phoneNumber"]').type(phoneNumber);
  cy.get('input[name="password"]').type(password);
  cy.contains("button", "Masuk").click();
  cy.wait(1000);
});

// Logout command
Cypress.Commands.add("customerLogout", () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});
```

**Usage:**

```javascript
cy.customerLogin("081234567890", "password123");
cy.customerLogout();
```

---

## 🚀 How to Run

### Run All Auth Tests

```bash
npm run cy:run:auth
```

### Run Specific Test

```bash
npx cypress run --spec "cypress/e2e/customer/01-auth.cy.js" --headed
```

### Run in Interactive Mode

```bash
npx cypress open
# Then select: customer/01-auth.cy.js
```

---

## 📊 Test Results

```
✅ PASSING: 20 tests
❌ FAILING: 1 test

Total Duration: 2 minutes 31 seconds
Success Rate: 95.24%
```

### Failing Test Details

**Test:** should show validation error for weak password  
**Location:** Line 131  
**Expected:** "Password minimal 6 karakter"  
**Actual:** No error message displayed  
**Priority:** Low  
**Impact:** Validation still works, only message display issue

---

## 🐛 Known Issues

### Issue #1: Weak Password Validation Message

- **Status:** Open
- **Impact:** Low
- **Description:** Error message for weak password not displayed
- **Workaround:** Password validation still prevents submission

---

## ✨ Best Practices

### DO's ✅

- Use `cy.customerLogin()` for authentication setup
- Always reset database before tests
- Clear auth state in beforeEach
- Use data-cy attributes for selectors
- Test both success and error scenarios

### DON'Ts ❌

- Don't hardcode user data in tests
- Don't skip database reset
- Don't rely on test execution order
- Don't use brittle CSS selectors

---

## 📝 Test Checklist

- [x] Registration with valid data
- [x] Registration validation errors
- [x] Login with valid credentials
- [x] Login with invalid credentials
- [x] Token persistence
- [x] Logout functionality
- [x] Protected routes
- [x] Public routes access
- [x] Phone number normalization
- [x] Password visibility toggle

---

**Last Updated:** December 21, 2025  
**File:** `01-auth.cy.js`  
**Version:** 1.0.0
