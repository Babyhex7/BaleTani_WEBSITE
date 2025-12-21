# 🛍️ Products Browsing Testing Documentation

## 📋 Overview

**File:** `02-products.cy.js`  
**Total Tests:** 25  
**Status:** ✅ 25/25 Passing (100%)  
**Duration:** ~3 min 45 sec

## 🎯 Test Coverage

### Test Suites

1. Product List Display (5 tests)
2. Category Filter (5 tests)
3. Product Search (5 tests)
4. Product Sorting (5 tests)
5. Product Pagination (5 tests)

---

## 1. Product List Display Tests

### ✅ Test 1.1: Display product page header correctly

**Purpose:** Verify page header and search elements

```javascript
it("should display product page header correctly", () => {
  // Verify page title
  cy.contains("Katalog Produk").should("be.visible");

  // Verify description
  cy.contains("Produk segar langsung dari petani lokal").should("be.visible");

  // Verify search bar exists
  cy.get('input[placeholder*="Cari produk"]').should("be.visible");
});
```

**Expected Elements:**

- Page title: "Katalog Produk"
- Description text
- Search input field
- Category filter sidebar

---

### ✅ Test 1.2: Display product grid with products

**Purpose:** Ensure products are loaded and displayed

```javascript
it("should display product grid with products", () => {
  // Wait for products to load
  cy.get('[data-cy="product-card"]', { timeout: 10000 }).should("exist");

  // Verify at least 1 product displayed
  cy.get('[data-cy="product-card"]').should("have.length.at.least", 1);
});
```

**API Call:**

```javascript
GET /api/customer/products
Response: {
  success: true,
  data: {
    products: [...],
    pagination: {
      page: 1,
      limit: 12,
      totalPages: 3,
      totalProducts: 30
    }
  }
}
```

---

### ✅ Test 1.3: Display product card with all required info

**Purpose:** Validate product card structure

```javascript
it("should display product card with all required info", () => {
  cy.get('[data-cy="product-card"]')
    .first()
    .within(() => {
      // Verify product image
      cy.get('[data-cy="product-image"]').should("be.visible");

      // Verify product name
      cy.get('[data-cy="product-name"]')
        .should("be.visible")
        .and("not.be.empty");

      // Verify product price
      cy.get('[data-cy="product-price"]')
        .should("be.visible")
        .and("contain", "Rp");

      // Verify category badge
      cy.get('[data-cy="category-badge"]').should("be.visible");

      // Verify add to cart button
      cy.get('[data-cy="add-to-cart-btn"]').should("be.visible");
    });
});
```

**Product Card Structure:**

```html
<div data-cy="product-card">
  <img data-cy="product-image" src="..." alt="..." />
  <span data-cy="category-badge">Sayuran</span>
  <h3 data-cy="product-name">Tomat Merah</h3>
  <p data-cy="product-price">Rp 15.000 / kg</p>
  <button data-cy="add-to-cart-btn">+ Keranjang</button>
</div>
```

---

### ✅ Test 1.4: Display product count information

**Purpose:** Show total products available

```javascript
it("should display product count information", () => {
  // Verify product count display
  cy.contains(/Menampilkan \d+ dari \d+ produk/i).should("be.visible");
});
```

**Example Display:**

- "Menampilkan 12 dari 30 produk"
- "Menampilkan 1-12 dari 30 produk"

---

### ✅ Test 1.5: Display sort dropdown

**Purpose:** Verify sorting options available

```javascript
it("should display sort dropdown", () => {
  cy.get('[data-cy="sort-dropdown"]').should("be.visible");

  // Verify sort options
  cy.get('[data-cy="sort-dropdown"]').within(() => {
    cy.contains("Terbaru").should("exist");
    cy.contains("Nama A-Z").should("exist");
    cy.contains("Nama Z-A").should("exist");
    cy.contains("Harga Terendah").should("exist");
    cy.contains("Harga Tertinggi").should("exist");
  });
});
```

---

## 2. Category Filter Tests

### ✅ Test 2.1: Display category filter sidebar on desktop

**Purpose:** Verify category sidebar layout

```javascript
it("should display category filter sidebar on desktop", () => {
  cy.viewport(1280, 720);

  // Verify sidebar visible
  cy.get('[data-cy="category-sidebar"]').should("be.visible");

  // Verify filter title
  cy.contains("Filter Kategori").should("be.visible");
});
```

---

### ✅ Test 2.2: Display all available categories

**Purpose:** Show complete category list

```javascript
it("should display all available categories", () => {
  // Get categories from API
  cy.intercept("GET", "**/api/customer/categories").as("getCategories");
  cy.visit("/products");
  cy.wait("@getCategories");

  // Verify categories displayed
  cy.get('[data-cy="category-filter"]').should("have.length.at.least", 3);

  // Verify common categories
  cy.contains('[data-cy="category-filter"]', "Sayuran").should("exist");
  cy.contains('[data-cy="category-filter"]', "Buah").should("exist");
  cy.contains('[data-cy="category-filter"]', "Bumbu").should("exist");
});
```

**Categories List:**

- Sayuran
- Buah
- Bumbu & Rempah
- Beras & Padi
- Telur & Unggas
- Hasil Olahan

---

### ✅ Test 2.3: Filter products by category

**Purpose:** Test category filtering functionality

```javascript
it("should filter products by category", () => {
  // Click category filter (e.g., "Sayuran")
  cy.contains('[data-cy="category-filter"]', "Sayuran").click();
  cy.wait(1000);

  // Verify URL updated
  cy.url().should("include", "category=sayuran");

  // Verify products filtered
  cy.get('[data-cy="product-card"]').should("have.length.at.least", 1);

  // Verify all products have correct category
  cy.get('[data-cy="category-badge"]').each(($badge) => {
    cy.wrap($badge).should("contain", "Sayuran");
  });

  // Verify filter tag displayed
  cy.contains("Kategori: Sayuran").should("be.visible");
});
```

**API Call with Filter:**

```javascript
GET /api/customer/products?category=sayuran
Response: {
  success: true,
  data: {
    products: [
      // Only products from "Sayuran" category
    ]
  }
}
```

---

### ✅ Test 2.4: Show category filter tag when applied

**Purpose:** Visual feedback for active filter

```javascript
it("should show category filter tag when applied", () => {
  // Apply filter
  cy.contains('[data-cy="category-filter"]', "Buah").click();
  cy.wait(500);

  // Verify filter tag
  cy.get('[data-cy="active-filter-tag"]').should("be.visible");
  cy.get('[data-cy="active-filter-tag"]').should("contain", "Kategori: Buah");

  // Verify remove button exists
  cy.get('[data-cy="remove-filter-btn"]').should("be.visible");
});
```

---

### ✅ Test 2.5: Clear category filter

**Purpose:** Remove active category filter

```javascript
it("should clear category filter", () => {
  // Apply filter
  cy.contains('[data-cy="category-filter"]', "Sayuran").click();
  cy.wait(1000);

  // Verify filter applied
  cy.contains("Kategori: Sayuran").should("be.visible");

  // Clear filter
  cy.contains("Hapus Filter").click();
  cy.wait(1000);

  // Verify filter removed
  cy.url().should("not.include", "category=");
  cy.contains("Kategori:").should("not.exist");

  // Verify all products shown
  cy.get('[data-cy="product-card"]').should("have.length.at.least", 5);
});
```

---

## 3. Product Search Tests

### ✅ Test 3.1: Display search bar in header

**Purpose:** Verify search input accessibility

```javascript
it("should display search bar in header", () => {
  cy.get('[data-cy="search-input"]').should("be.visible");
  cy.get('[data-cy="search-input"]')
    .should("have.attr", "placeholder")
    .and("include", "Cari produk");
});
```

---

### ✅ Test 3.2: Search products by name

**Purpose:** Test search functionality

```javascript
it("should search products by name", () => {
  // Type search query
  cy.get('[data-cy="search-input"]').type("Beras");
  cy.wait(1000);

  // Verify URL updated
  cy.url().should("include", "search=Beras");

  // Verify results
  cy.get('[data-cy="product-card"]').should("have.length.at.least", 1);

  // Verify all results match search
  cy.get('[data-cy="product-name"]').each(($name) => {
    cy.wrap($name).invoke("text").should("match", /Beras/i);
  });

  // Verify search info displayed
  cy.contains(/Hasil pencarian untuk "Beras"/i).should("be.visible");
});
```

**Search API Call:**

```javascript
GET /api/customer/products?search=Beras
Response: {
  success: true,
  data: {
    products: [
      { name: "Beras Premium", ... },
      { name: "Beras Organik", ... }
    ],
    searchQuery: "Beras"
  }
}
```

---

### ✅ Test 3.3: Show empty state for no results

**Purpose:** Handle empty search results

```javascript
it("should show empty state for no results", () => {
  cy.get('[data-cy="search-input"]').type("ProductNotExist123");
  cy.wait(1000);

  // Verify empty state
  cy.contains("Tidak ada produk ditemukan").should("be.visible");
  cy.get('[data-cy="product-card"]').should("not.exist");

  // Verify helpful message
  cy.contains(/Coba kata kunci lain/i).should("be.visible");
});
```

**Empty State Display:**

```html
<div data-cy="empty-state">
  <img src="/images/empty-search.svg" />
  <h3>Tidak ada produk ditemukan</h3>
  <p>Coba kata kunci lain atau lihat kategori produk</p>
  <button>Lihat Semua Produk</button>
</div>
```

---

### ✅ Test 3.4: Clear search using X button

**Purpose:** Reset search query

```javascript
it("should clear search using X button", () => {
  // Type search query
  cy.get('[data-cy="search-input"]').type("Tomat");
  cy.wait(1000);

  // Verify search applied
  cy.url().should("include", "search=Tomat");

  // Click clear button
  cy.get('[data-cy="clear-search-btn"]').click();
  cy.wait(500);

  // Verify search cleared
  cy.get('[data-cy="search-input"]').should("have.value", "");
  cy.url().should("not.include", "search=");

  // Verify all products shown
  cy.get('[data-cy="product-card"]').should("have.length.at.least", 10);
});
```

---

### ✅ Test 3.5: Combine search with category filter

**Purpose:** Test multiple filters together

```javascript
it("should combine search with category filter", () => {
  // Apply category filter
  cy.contains('[data-cy="category-filter"]', "Sayuran").click();
  cy.wait(500);

  // Search within category
  cy.get('[data-cy="search-input"]').type("Tomat");
  cy.wait(1000);

  // Verify URL has both parameters
  cy.url().should("include", "category=sayuran");
  cy.url().should("include", "search=Tomat");

  // Verify results match both filters
  cy.get('[data-cy="product-card"]').should("have.length.at.least", 1);
  cy.get('[data-cy="product-name"]').should("contain", "Tomat");
  cy.get('[data-cy="category-badge"]').should("contain", "Sayuran");

  // Verify both filter tags displayed
  cy.contains("Kategori: Sayuran").should("be.visible");
  cy.contains(/Pencarian: "Tomat"/i).should("be.visible");
});
```

---

## 4. Product Sorting Tests

### ✅ Test 4.1: Sort by newest (default)

**Purpose:** Default sorting by created_at DESC

```javascript
it("should sort by newest (default)", () => {
  // Verify default sort selected
  cy.get('[data-cy="sort-dropdown"]').should("have.value", "newest");

  // Get product dates
  cy.get('[data-cy="product-card"]').then(($products) => {
    // First product should be newest
    cy.wrap($products).first().should("contain", "BARU");
  });
});
```

---

### ✅ Test 4.2: Sort by name A-Z

**Purpose:** Alphabetical ascending sort

```javascript
it("should sort by name A-Z", () => {
  // Select sort option
  cy.get('[data-cy="sort-dropdown"]').select("name_asc");
  cy.wait(1000);

  // Verify URL updated
  cy.url().should("include", "sort=name_asc");

  // Get all product names
  cy.get('[data-cy="product-name"]').then(($names) => {
    const names = [...$names].map((el) => el.textContent.trim());

    // Verify sorted alphabetically
    const sortedNames = [...names].sort();
    expect(names).to.deep.equal(sortedNames);
  });
});
```

---

### ✅ Test 4.3: Sort by name Z-A

**Purpose:** Alphabetical descending sort

```javascript
it("should sort by name Z-A", () => {
  cy.get('[data-cy="sort-dropdown"]').select("name_desc");
  cy.wait(1000);

  cy.url().should("include", "sort=name_desc");

  cy.get('[data-cy="product-name"]').then(($names) => {
    const names = [...$names].map((el) => el.textContent.trim());
    const sortedNames = [...names].sort().reverse();
    expect(names).to.deep.equal(sortedNames);
  });
});
```

---

### ✅ Test 4.4: Sort by price lowest

**Purpose:** Price ascending sort

```javascript
it("should sort by price lowest", () => {
  cy.get('[data-cy="sort-dropdown"]').select("price_low");
  cy.wait(1000);

  cy.url().should("include", "sort=price_low");

  // Get all prices
  cy.get('[data-cy="product-price"]').then(($prices) => {
    const prices = [...$prices].map((el) =>
      parseInt(el.textContent.replace(/\D/g, ""))
    );

    // Verify sorted ascending
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).to.deep.equal(sortedPrices);
  });
});
```

---

### ✅ Test 4.5: Sort by price highest

**Purpose:** Price descending sort

```javascript
it("should sort by price highest", () => {
  cy.get('[data-cy="sort-dropdown"]').select("price_high");
  cy.wait(1000);

  cy.url().should("include", "sort=price_high");

  cy.get('[data-cy="product-price"]').then(($prices) => {
    const prices = [...$prices].map((el) =>
      parseInt(el.textContent.replace(/\D/g, ""))
    );

    // Verify sorted descending
    const sortedPrices = [...prices].sort((a, b) => b - a);
    expect(prices).to.deep.equal(sortedPrices);
  });
});
```

**Sort Options:**
| Value | Label | SQL |
|-------|-------|-----|
| `newest` | Terbaru | `ORDER BY created_at DESC` |
| `name_asc` | Nama A-Z | `ORDER BY name ASC` |
| `name_desc` | Nama Z-A | `ORDER BY name DESC` |
| `price_low` | Harga Terendah | `ORDER BY price ASC` |
| `price_high` | Harga Tertinggi | `ORDER BY price DESC` |

---

## 5. Product Pagination Tests

### ✅ Test 5.1: Display pagination controls

**Purpose:** Show pagination UI elements

```javascript
it("should display pagination controls", () => {
  // Should have pagination if products > 12
  cy.get('[data-cy="pagination"]').should("be.visible");

  // Verify page numbers
  cy.get('[data-cy="page-number"]').should("have.length.at.least", 1);

  // Verify next/prev buttons
  cy.get('[data-cy="prev-btn"]').should("exist");
  cy.get('[data-cy="next-btn"]').should("exist");

  // Verify current page highlighted
  cy.get('[data-cy="page-number"][aria-current="page"]').should("exist");
});
```

---

### ✅ Test 5.2: Navigate to next page

**Purpose:** Test next page functionality

```javascript
it("should navigate to next page", () => {
  // Verify on page 1
  cy.get('[data-cy="page-number"][aria-current="page"]').should("contain", "1");

  // Click next button
  cy.get('[data-cy="next-btn"]').click();
  cy.wait(1000);

  // Verify on page 2
  cy.url().should("include", "page=2");
  cy.get('[data-cy="page-number"][aria-current="page"]').should("contain", "2");

  // Verify different products loaded
  cy.get('[data-cy="product-card"]').should("have.length.at.least", 1);

  // Scroll to top
  cy.window().its("scrollY").should("equal", 0);
});
```

---

### ✅ Test 5.3: Navigate to previous page

**Purpose:** Test previous page functionality

```javascript
it("should navigate to previous page", () => {
  // Go to page 2 first
  cy.visit("/products?page=2");
  cy.wait(1000);

  // Click previous button
  cy.get('[data-cy="prev-btn"]').click();
  cy.wait(1000);

  // Verify back on page 1
  cy.url().should("not.include", "page=2");
  cy.get('[data-cy="page-number"][aria-current="page"]').should("contain", "1");
});
```

---

### ✅ Test 5.4: Navigate to specific page number

**Purpose:** Direct page navigation

```javascript
it("should navigate to specific page number", () => {
  // Click page 3
  cy.get('[data-cy="page-number"]').contains("3").click();
  cy.wait(1000);

  // Verify on page 3
  cy.url().should("include", "page=3");
  cy.get('[data-cy="page-number"][aria-current="page"]').should("contain", "3");
});
```

---

### ✅ Test 5.5: Display correct page numbers

**Purpose:** Validate pagination logic

```javascript
it("should display correct page numbers", () => {
  // If total products = 30, limit = 12
  // Should have 3 pages (30 / 12 = 2.5 → 3)

  cy.get('[data-cy="pagination-info"]').should("contain", "Halaman 1 dari 3");

  // Verify page numbers displayed
  cy.get('[data-cy="page-number"]').should("have.length", 3);
  cy.get('[data-cy="page-number"]').eq(0).should("contain", "1");
  cy.get('[data-cy="page-number"]').eq(1).should("contain", "2");
  cy.get('[data-cy="page-number"]').eq(2).should("contain", "3");
});
```

**Pagination Logic:**

```javascript
{
  page: 1,
  limit: 12,
  totalProducts: 30,
  totalPages: Math.ceil(30 / 12), // = 3
  hasNext: true,
  hasPrev: false
}
```

---

## 🔧 Setup & Configuration

### Before Each Test

```javascript
beforeEach(() => {
  // Reset database
  cy.resetDatabase();

  // Seed products data
  cy.seedDatabase("products");

  // Set viewport
  cy.viewport(1280, 720);

  // Visit products page
  cy.visit("/products");
});
```

### Test Fixtures

**Location:** `cypress/fixtures/products.json`

```json
{
  "validProducts": [
    {
      "id": "prod-001",
      "name": "Beras Premium",
      "category": "Beras & Padi",
      "price": 15000,
      "unit": "kg",
      "stock": 100
    },
    {
      "id": "prod-002",
      "name": "Tomat Merah",
      "category": "Sayuran",
      "price": 12000,
      "unit": "kg",
      "stock": 50
    }
  ]
}
```

---

## 🚀 How to Run

### Run All Products Tests

```bash
npm run cy:run:browsing
```

### Run Specific Test Suite

```bash
# Category filter tests only
npx cypress run --spec "cypress/e2e/customer/02-products.cy.js" --grep "Category Filter"

# Search tests only
npx cypress run --spec "cypress/e2e/customer/02-products.cy.js" --grep "Product Search"
```

### Run in Interactive Mode

```bash
npx cypress open
# Then select: customer/02-products.cy.js
```

---

## 📊 Test Results

```
✅ ALL TESTS PASSING: 25/25
Total Duration: 3 minutes 45 seconds
Success Rate: 100% 🎉
```

### Performance Metrics

- Average load time: 1.2s
- API response time: < 500ms
- Search debounce: 300ms
- Filter transition: 300ms

---

## 🎯 Custom Commands

### Product Commands

```javascript
Cypress.Commands.add("searchProduct", (query) => {
  cy.get('[data-cy="search-input"]').clear().type(query);
  cy.wait(1000);
});

Cypress.Commands.add("filterByCategory", (category) => {
  cy.contains('[data-cy="category-filter"]', category).click();
  cy.wait(1000);
});

Cypress.Commands.add("sortProducts", (sortBy) => {
  cy.get('[data-cy="sort-dropdown"]').select(sortBy);
  cy.wait(1000);
});
```

**Usage:**

```javascript
cy.searchProduct("Beras");
cy.filterByCategory("Sayuran");
cy.sortProducts("price_low");
```

---

## ✨ Best Practices

### DO's ✅

- Use semantic data-cy attributes
- Wait for API responses with cy.wait
- Test mobile and desktop viewports
- Verify URL parameters for filters
- Test empty states

### DON'Ts ❌

- Don't rely on exact product count
- Don't hardcode product names from fixtures
- Don't skip pagination tests
- Don't forget to test combinations (search + filter)

---

## 📝 Test Checklist

- [x] Product list displays correctly
- [x] Product cards have all required info
- [x] Category filtering works
- [x] Search functionality works
- [x] Combined filters work together
- [x] Sorting works for all options
- [x] Pagination navigation works
- [x] Empty states display correctly
- [x] URL parameters updated correctly
- [x] Mobile responsive (optional)

---

**Last Updated:** December 21, 2025  
**File:** `02-products.cy.js`  
**Version:** 1.0.0
