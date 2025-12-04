# 🧪 BaleTani E2E Tests - Customer Area

End-to-End testing untuk Customer Area menggunakan Cypress.

## 📦 Installation

```bash
cd e2e-tests
npm install
```

## 🚀 Running Tests

### Interactive Mode (Recommended untuk development)

```bash
npm run cy:open
```

### Headless Mode (CI/CD)

```bash
# Run all customer tests
npm run cy:run:customer

# Run specific test suite
npm run cy:run:auth
npm run cy:run:cart
npm run cy:run:checkout
```

### Run with Different Browsers

```bash
npm run cy:run:chrome
npm run cy:run:firefox
npm run cy:run:edge
```

### Run with Servers

```bash
# Start backend + frontend + run tests
npm run test:customer
```

## 📁 Folder Structure

```
e2e-tests/
├── cypress/
│   ├── e2e/
│   │   └── customer/           # Customer test specs
│   │       ├── 01-auth.cy.js
│   │       ├── 02-browsing.cy.js
│   │       ├── 03-cart.cy.js
│   │       ├── 04-checkout.cy.js
│   │       ├── 05-order-history.cy.js
│   │       ├── 06-profile.cy.js
│   │       ├── 07-contact.cy.js
│   │       └── 08-categories.cy.js
│   ├── fixtures/               # Test data
│   ├── support/                # Custom commands
│   └── downloads/              # Downloaded files
├── cypress.config.js
├── package.json
└── README.md
```

## 🧪 Test Coverage

| Test Suite             | Test Cases | Status |
| ---------------------- | ---------- | ------ |
| 01-auth.cy.js          | 8          | ✅     |
| 02-browsing.cy.js      | 10         | 🚧     |
| 03-cart.cy.js          | 12         | 🚧     |
| 04-checkout.cy.js      | 8          | 🚧     |
| 05-order-history.cy.js | 10         | 🚧     |
| 06-profile.cy.js       | 7          | 🚧     |
| 07-contact.cy.js       | 5          | 🚧     |
| 08-categories.cy.js    | 6          | 🚧     |
| **TOTAL**              | **66**     |        |

## 📝 Custom Commands

### Authentication

- `cy.customerLogin(phone, password)` - Login via API
- `cy.customerRegister(customerData)` - Register new customer
- `cy.customerLogout()` - Logout and clear storage

### Cart

- `cy.addToCart(productId, quantity)` - Add product to cart
- `cy.clearCart()` - Clear entire cart

### Database

- `cy.resetDatabase()` - Reset test database
- `cy.seedDatabase(fixture)` - Seed test data

### Navigation

- `cy.visitAsCustomer(path, credentials)` - Visit page as authenticated customer

### Assertions

- `cy.shouldBeAuthenticated()` - Assert customer is logged in
- `cy.shouldNotBeAuthenticated()` - Assert customer is logged out

## 🔧 Configuration

Edit `cypress.config.js` for:

- Base URL
- API URL
- Timeouts
- Retries
- Video/Screenshot settings

Edit `.env.test` for:

- Database credentials
- Test accounts
- API endpoints

## 📊 Test Reports

After running tests:

- **Videos:** `cypress/videos/`
- **Screenshots:** `cypress/screenshots/`
- **Downloads:** `cypress/downloads/`

## 🐛 Debugging

### Debug in Interactive Mode

```bash
npm run cy:open
```

### Debug with Console Logs

Add `cy.log('Debug message')` in tests

### Take Screenshot

```bash
cy.screenshot('debug-screenshot')
```

## ⚠️ Prerequisites

1. **Backend** running on `http://localhost:5000`
2. **Frontend** running on `http://localhost:5173`
3. **Database** `baletani_db_test` created
4. **Test data** seeded

## 🔗 Related Documentation

- [Main Brief](../CUSTOMER_E2E_TESTING_BRIEF.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Cypress Docs](https://docs.cypress.io/)

## 👥 Contributors

BaleTani Team - November 2025
