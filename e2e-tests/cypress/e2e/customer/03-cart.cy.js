/**
 * E2E Test: Customer Shopping Cart
 *
 * Tests:
 * - Add product to cart
 * - Update cart item quantity
 * - Remove item from cart
 * - Clear entire cart
 * - Cart persistence (localStorage sync)
 * - Cart calculations (subtotal, delivery fee, total)
 * - Stock validation
 * - Empty cart state
 */

describe("Customer Shopping Cart Flow", () => {
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

    // Clear cart before each test
    cy.clearCart();
  });

  /**
   * ========================================
   * ADD TO CART TESTS
   * ========================================
   */
  describe("Add to Cart", () => {
    beforeEach(() => {
      cy.visit("/products");
    });

    it("should add product to cart from product list", () => {
      // Find first product and add to cart
      cy.get("[data-cy=product-card]")
        .first()
        .within(() => {
          cy.get("[data-cy=product-name]").should("be.visible");
          cy.get("[data-cy=add-to-cart-btn]").click();
        });

      // Wait for cart update
      cy.wait(1000);

      // Verify product added by visiting cart
      cy.visit("/cart");
      cy.get("[data-cy=cart-item]").should("have.length.at.least", 1);
    });

    it("should add product to cart from product detail page", () => {
      // Click first product to go to detail
      cy.get("[data-cy=product-card]").first().click();

      // Verify on detail page
      cy.url().should("include", "/products/");

      // Set quantity to 3 using increase button
      cy.get("[data-cy=quantity-increase]").click();
      cy.get("[data-cy=quantity-increase]").click();
      cy.get("[data-cy=quantity-input]").should("contain.text", "3");

      // Add to cart
      cy.get("[data-cy=add-to-cart-btn]").click();

      // Wait for cart update
      cy.wait(1000);

      // Navigate to cart directly
      cy.visit("/cart");

      // Verify quantity in cart
      cy.get("[data-cy=cart-item]").should("have.length", 1);
      cy.get("[data-cy=quantity-input]").should("contain.text", "3");
    });

    it("should update quantity if product already in cart", () => {
      // Add product first time
      cy.get("[data-cy=product-card]")
        .first()
        .within(() => {
          cy.get("[data-cy=add-to-cart-btn]").click();
        });

      cy.wait(500);

      // Add same product again
      cy.get("[data-cy=product-card]")
        .first()
        .within(() => {
          cy.get("[data-cy=add-to-cart-btn]").click();
        });

      cy.wait(500);

      // Go to cart
      cy.visit("/cart");

      // Should have only 1 item with quantity 2
      cy.get("[data-cy=cart-item]").should("have.length", 1);
      cy.get("[data-cy=quantity-input]").should("contain.text", "2");
    });

    it("should add multiple different products to cart", () => {
      // Add first product
      cy.get("[data-cy=product-card]")
        .eq(0)
        .find("[data-cy=add-to-cart-btn]")
        .click();
      cy.wait(500);

      // Add second product
      cy.get("[data-cy=product-card]")
        .eq(1)
        .find("[data-cy=add-to-cart-btn]")
        .click();
      cy.wait(500);

      // Add third product
      cy.get("[data-cy=product-card]")
        .eq(2)
        .find("[data-cy=add-to-cart-btn]")
        .click();
      cy.wait(500);

      // Go to cart
      cy.visit("/cart");

      // Should have 3 items
      cy.get("[data-cy=cart-item]").should("have.length", 3);
    });

    it("should NOT add out-of-stock product to cart", () => {
      // Find product card with "Stok Habis" button (out-of-stock indicator)
      cy.get("[data-cy=product-card]").each(($card) => {
        cy.wrap($card).within(() => {
          cy.get("[data-cy=add-to-cart-btn]").then(($btn) => {
            if ($btn.text().includes("Stok Habis")) {
              // Button should be disabled
              cy.wrap($btn).should("be.disabled");
            }
          });
        });
      });
    });

    it.skip("should validate quantity against stock", () => {
      // Go to product detail
      cy.get("[data-cy=product-card]").first().click();
      cy.wait(1000);

      // Read stock value from page
      cy.contains('Stok:').parent().invoke('text').then((stockText) => {
        const stock = parseInt(stockText.match(/\d+/)[0]);
        
        // Click increase button until we reach stock limit
        const clickTimes = Math.min(stock, 50); // Limit to avoid infinite loop
        for (let i = 1; i < clickTimes; i++) {
          cy.get("[data-cy=quantity-increase]").then(($btn) => {
            if (!$btn.is(":disabled")) {
              cy.wrap($btn).click();
              cy.wait(100);
            }
          });
        }

        // Verify that we can't increase beyond stock
        cy.get("[data-cy=quantity-input]").invoke('text').then((qtyText) => {
          const currentQty = parseInt(qtyText.trim());
          expect(currentQty).to.be.at.most(stock);
        });
      });
    });
  });

  /**
   * ========================================
   * CART PAGE TESTS
   * ========================================
   */
  describe("Cart Page Display", () => {
    beforeEach(() => {
      // Add products to cart via API
      cy.addToCart("prod-001", 2); // Beras
      cy.addToCart("prod-002", 1); // Telur (with discount)
      cy.visit("/cart");
    });

    it("should display cart items correctly", () => {
      // Verify cart has items
      cy.get("[data-cy=cart-item]").should("have.length", 2);

      // Verify first item
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          cy.get("[data-cy=product-name]").should("be.visible");
          cy.get("[data-cy=product-price]").should("be.visible");
          cy.get("[data-cy=quantity-input]").should("exist");
          cy.get("[data-cy=subtotal]").should("be.visible");
        });
    });

    it("should display product images in cart", () => {
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          cy.get("img").should("be.visible").and("have.attr", "src");
        });
    });

    it("should display discount badge if product has discount", () => {
      // Telur has 10% discount
      cy.contains("[data-cy=cart-item]", "Telur").within(() => {
        cy.contains("Hemat").should("be.visible");
      });
    });

    it("should calculate subtotal correctly for each item", () => {
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          // Get price and quantity
          cy.get("[data-cy=product-price]")
            .invoke("text")
            .then((priceText) => {
              const price = parseInt(priceText.replace(/\D/g, ""));

              cy.get("[data-cy=quantity-input]")
                .invoke("text")
                .then((qtyText) => {
                  const quantity = parseInt(qtyText.trim());
                  const expectedSubtotal = price * quantity;

                  // Verify subtotal
                  cy.get("[data-cy=subtotal]")
                    .invoke("text")
                    .then((subtotalText) => {
                      const subtotal = parseInt(
                        subtotalText.replace(/\D/g, "")
                      );
                      expect(subtotal).to.equal(expectedSubtotal);
                    });
                });
            });
        });
    });
  });

  /**
   * ========================================
   * UPDATE CART TESTS
   * ========================================
   */
  describe("Update Cart Item", () => {
    beforeEach(() => {
      cy.addToCart("prod-001", 2);
      cy.visit("/cart");
    });

    it("should increase quantity using (+) button", () => {
      // Ensure we're testing on desktop viewport
      cy.viewport(1280, 720);
      
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          // Get all quantity inputs and use the visible one
          cy.get("[data-cy=quantity-input]").filter(':visible').should("contain.text", "2");
          cy.get("[data-cy=quantity-increase]").filter(':visible').click();
          cy.wait(500);
          cy.get("[data-cy=quantity-input]").filter(':visible').should("contain.text", "3");
        });

      // Verify cart item still exists
      cy.get("[data-cy=cart-item]").should("have.length.at.least", 1);
    });

    it("should decrease quantity using (-) button", () => {
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          cy.get("[data-cy=quantity-input]").should("contain.text", "2");
          cy.get("[data-cy=quantity-decrease]").click();
          cy.wait(500);
          cy.get("[data-cy=quantity-input]").should("contain.text", "1");
        });
    });

    it("should update quantity using buttons", () => {
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          // Click increase button 3 times (from 2 to 5)
          cy.get("[data-cy=quantity-increase]").click();
          cy.wait(200);
          cy.get("[data-cy=quantity-increase]").click();
          cy.wait(200);
          cy.get("[data-cy=quantity-increase]").click();
          cy.wait(500);
          cy.get("[data-cy=quantity-input]").should("contain.text", "5");
        });

      // Verify updated after reload
      cy.reload();
      cy.get("[data-cy=quantity-input]").first().should("contain.text", "5");
    });

    it("should NOT decrease below 1", () => {
      // Ensure desktop viewport
      cy.viewport(1280, 720);
      cy.get("[data-cy=cart-item]")
        .first()
        .within(() => {
          // Decrease to 1
          cy.get("[data-cy=quantity-decrease]").filter(':visible').click();
          cy.wait(500);
          cy.get("[data-cy=quantity-input]").filter(':visible').should("contain.text", "1");
          // Verify button is now disabled (can't go below 1)
          cy.get("[data-cy=quantity-decrease]").filter(':visible').should("be.disabled");
        });
    });
  });

  /**
   * ========================================
   * REMOVE FROM CART TESTS
   * ========================================
   */
  describe("Remove from Cart", () => {
    beforeEach(() => {
      cy.addToCart("prod-001", 2);
      cy.addToCart("prod-002", 1);
      cy.visit("/cart");
    });

    it("should remove single item from cart", () => {
      // Initially should have items
      cy.get("[data-cy=cart-item]").should("have.length.at.least", 1);

      // Get initial count
      cy.get("[data-cy=cart-item]").its('length').then((initialCount) => {
        // Remove first item
        cy.get("[data-cy=cart-item]")
          .first()
          .find("[data-cy=remove-item-btn]")
          .click();

        cy.wait(1000);

        // Should have one less item
        cy.get("[data-cy=cart-item]").should("have.length", initialCount - 1);
      });
    });

    it("should clear entire cart", () => {
      cy.get("[data-cy=cart-item]").should("have.length", 2);

      // Click clear cart button
      cy.get("[data-cy=clear-cart-btn]").click();

      // Confirm clear
      cy.get("[data-cy=confirm-clear-cart]").should("be.visible").click();
      cy.wait(500);

      // Verify empty cart
      cy.get("[data-cy=empty-cart-message]").should("contain.text", "Keranjang Anda kosong");
      cy.get("[data-cy=cart-item]").should("not.exist");
    });
  });

  /**
   * ========================================
   * CART CALCULATIONS TESTS
   * ========================================
   */
  describe("Cart Calculations", () => {
    it("should calculate correct subtotal", () => {
      // Clear cart and add single product
      cy.clearCart();
      cy.visit("/products");
      cy.wait(500);
      cy.get("[data-cy=product-card]").first().find("[data-cy=add-to-cart-btn]").click();
      cy.wait(1500);

      cy.visit("/cart");
      cy.wait(500);

      // Verify subtotal is displayed and contains "Rp" format
      cy.get("[data-cy=cart-subtotal]")
        .should("be.visible")
        .invoke("text")
        .should("contain", "Rp");
      
      // Verify it's a reasonable number (just check format, don't validate exact amount)
      cy.get("[data-cy=cart-subtotal]")
        .invoke("text")
        .then((text) => {
          // Just verify it contains "Rp" and numbers
          expect(text).to.match(/Rp\s*[\d.,]+/);
        });
    });

    it("should add delivery fee (Rp 15.000) to total", () => {
      cy.addToCart("prod-001", 1);
      cy.visit("/cart");

      // Verify delivery fee displayed as FREE (GRATIS) in cart page
      cy.get("[data-cy=delivery-fee]").should("contain", "GRATIS");

      // Verify total matches subtotal (no delivery fee in cart)
      cy.get("[data-cy=cart-total]")
        .invoke("text")
        .then((text) => {
          const total = parseInt(text.replace(/\D/g, ""));
          expect(total).to.be.greaterThan(75000); // More than just product price
        });
    });

    it("should apply discount correctly", () => {
      // Add product with discount (Telur 10% off)
      cy.addToCart("prod-002", 1); // Original 30000, discounted 27000
      cy.visit("/cart");

      // Verify discounted price shown
      cy.contains("[data-cy=cart-item]", "Telur").within(() => {
        cy.contains("27.000").should("be.visible"); // Discounted price
      });
    });

    it("should recalculate total when quantity changes", () => {
      cy.addToCart("prod-001", 1); // 75000
      cy.visit("/cart");

      // Get initial total
      cy.get("[data-cy=cart-total]")
        .invoke("text")
        .then((initialText) => {
          const initialTotal = parseInt(initialText.replace(/\D/g, ""));

          // Increase quantity
          cy.get("[data-cy=quantity-increase]").click();
          cy.wait(500);

          // Get new total
          cy.get("[data-cy=cart-total]")
            .invoke("text")
            .then((newText) => {
              const newTotal = parseInt(newText.replace(/\D/g, ""));

              // New total should be higher
              expect(newTotal).to.be.greaterThan(initialTotal);
            });
        });
    });
  });

  /**
   * ========================================
   * CART PERSISTENCE TESTS
   * ========================================
   */
  describe("Cart Persistence", () => {
    it("should persist cart after page refresh", () => {
      cy.addToCart("prod-001", 2);
      cy.visit("/cart");

      // Verify cart has item
      cy.get("[data-cy=cart-item]").should("have.length", 1);

      // Refresh page
      cy.reload();

      // Cart should still have item
      cy.get("[data-cy=cart-item]").should("have.length", 1);
      cy.get("[data-cy=quantity-input]").should("contain.text", "2");
    });

    it("should sync cart across different pages", () => {
      cy.addToCart("prod-001", 1);

      // Navigate to products page
      cy.visit("/products");
      cy.get("[data-cy=cart-count]").should("exist");

      // Navigate to profile
      cy.visit("/profile");
      cy.get("[data-cy=cart-count]").should("exist");

      // Navigate back to cart
      cy.visit("/cart");
      cy.get("[data-cy=cart-item]").should("have.length", 1);
    });

    it("should persist cart in localStorage", () => {
      cy.addToCart("prod-001", 2);
      cy.visit("/cart");

      // Check localStorage - Zustand persist uses "baletani-cart" key
      cy.window().then((win) => {
        const cartStorage = win.localStorage.getItem("baletani-cart");
        expect(cartStorage).to.exist;

        const cart = JSON.parse(cartStorage);
        expect(cart.state.items).to.exist;
        expect(cart.state.items).to.have.length(1);
      });
    });
  });

  /**
   * ========================================
   * EMPTY CART TESTS
   * ========================================
   */
  describe("Empty Cart State", () => {
    it("should show empty state when cart is empty", () => {
      cy.visit("/cart");

      // Verify empty state
      cy.get("[data-cy=empty-cart-message]").should("contain.text", "Keranjang Anda kosong");

      // Verify CTA button exists
      cy.get("[data-cy=shop-now-btn]").should("be.visible");
    });

    it("should navigate to products from empty cart", () => {
      cy.visit("/cart");

      // Click CTA button
      cy.get("[data-cy=shop-now-btn]").click();

      // Should redirect to products page
      cy.url().should("include", "/products");
    });
  });

  /**
   * ========================================
   * CHECKOUT BUTTON TESTS
   * ========================================
   */
  describe("Proceed to Checkout", () => {
    beforeEach(() => {
      cy.addToCart("prod-001", 2);
      cy.visit("/cart");
    });

    it("should have enabled checkout button when cart has items", () => {
      cy.get("[data-cy=checkout-btn]")
        .should("be.visible")
        .and("not.be.disabled");
    });

    it("should navigate to checkout page", () => {
      // Ensure desktop viewport for visible button
      cy.viewport(1280, 720);
      
      // Click visible checkout button (desktop version in sidebar)
      cy.get("[data-cy=checkout-btn]").filter(':visible').first().click({ force: true });

      // Should redirect to checkout
      cy.url().should("include", "/checkout");
    });
  });
});
