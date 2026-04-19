/**
 * ============================================
 * CUSTOM HOOK: useAddToCart
 * ============================================
 * Handle logic untuk menambahkan produk ke keranjang
 * Termasuk validasi auth, stok, dan notifikasi
 *
 * Reusable di berbagai komponen:
 * - ProductCard
 * - ProductDetail
 * - QuickView Modal
 * - Related Products
 * - Featured Products
 *
 * @module useAddToCart
 * @requires react
 * @requires react-hot-toast
 * @requires store/store_customer/useAuthStore
 * @requires store/store_customer/useCartStore
 *
 * @author BaleTani Development Team
 * @created 2025-11-12
 */

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/store_customer/useAuthStore";
import useCartStore from "../../store/store_customer/useCartStore";

/**
 * Custom hook untuk handle add to cart functionality
 *
 * @function useAddToCart
 * @returns {Object} Hook utilities
 * @returns {Function} returns.handleAddToCart - Function untuk add to cart dengan validasi lengkap
 * @returns {Boolean} returns.showLoginModal - State untuk kontrol login modal
 * @returns {Function} returns.setShowLoginModal - Setter untuk login modal state
 * @returns {Boolean} returns.isProcessing - State untuk loading saat add to cart
 *
 * @example
 * const { handleAddToCart, showLoginModal, setShowLoginModal } = useAddToCart();
 *
 * // Basic usage
 * <button onClick={handleAddToCart(product, 1)}>Add to Cart</button>
 *
 * // Custom quantity
 * <button onClick={handleAddToCart(product, 5)}>Add 5 to Cart</button>
 *
 * // With login modal
 * <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
 */
const useAddToCart = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // State untuk kontrol login modal visibility
  const [showLoginModal, setShowLoginModal] = useState(false);

  // State untuk tracking proses add to cart (loading state)
  const [isProcessing, setIsProcessing] = useState(false);

  // Ref untuk AbortController - prevent race condition
  const abortControllerRef = useRef(null);

  // ✅ CRITICAL: Debounce timer untuk prevent spam click
  const debounceTimerRef = useRef(null);
  const lastClickTimeRef = useRef(0);

  // ========================================
  // ZUSTAND STORES
  // ========================================

  // Get authentication state dari Auth Store
  const { isAuthenticated } = useAuthStore();

  // Get addItem function dari Cart Store
  const addItem = useCartStore((state) => state.addItem);

  const normalizeQty = (value) => {
    const numeric = parseFloat(value);
    if (Number.isNaN(numeric)) {
      return 0;
    }
    return Math.round(numeric * 100) / 100;
  };

  const formatQty = (value) => {
    const numeric = normalizeQty(value);
    if (Number.isInteger(numeric)) {
      return String(numeric);
    }
    return numeric.toFixed(2).replace(/\.00$/, "").replace(/0$/, "");
  };

  const getUnitLabel = (product) => {
    return product?.unit || product?.quantityInfo || "kg";
  };

  /**
   * Handler untuk add to cart dengan berbagai validasi
   * Returns event handler function untuk button onClick
   *
   * @function handleAddToCart
   * @param {Object} product - Product object yang akan ditambahkan
   * @param {String} product.id - Product ID
   * @param {String} product.name - Product name
   * @param {Number} product.price - Product price
   * @param {Number} product.stock - Available stock
   * @param {String} product.image - Product image URL
   * @param {Number} quantity - Jumlah produk yang ingin ditambahkan (default: 1)
   * @param {Boolean} stopPropagation - Stop event bubbling ke parent (default: true)
   * @param {Boolean} silent - Jika true, tidak tampilkan toast success (default: false)
   *
   * @returns {Function} Event handler function
   *
   * Flow:
   * 1. Validasi authentication
   * 2. Validasi product object
   * 3. Validasi stock availability
   * 4. Validasi quantity vs stock
   * 5. Add to cart via Zustand store
   * 6. Show success/error notification (kecuali silent mode)
   */
  const handleAddToCart = (
    product,
    quantity = 1,
    stopPropagation = true,
    silent = false
  ) => {
    // Return event handler function
    return async (e) => {
      const requestedQty = normalizeQty(quantity);

      // ========================================
      // STEP 0: EVENT HANDLING
      // ========================================
      // Prevent parent element click (e.g., card navigation)
      if (stopPropagation && e) {
        e.stopPropagation();
        e.preventDefault();
      }

      // ========================================
      // STEP 0.5: PREVENT SPAM CLICK (DEBOUNCE)
      // ========================================
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastClickTimeRef.current;

      // ✅ CRITICAL: Block rapid clicks (less than 300ms apart)
      if (timeSinceLastClick < 300) {
        console.log(
          `⚠️ Spam click detected! Blocked. (${timeSinceLastClick}ms since last click)`
        );
        if (!silent) {
          toast.error("Terlalu cepat! Tunggu sebentar...", { duration: 1000 });
        }
        return;
      }

      // Update last click time
      lastClickTimeRef.current = currentTime;

      // ========================================
      // STEP 0.6: PREVENT RACE CONDITION
      // ========================================
      // Cancel previous request if user spam-click
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      // Prevent duplicate processing
      if (isProcessing) {
        console.log("⚠️ Already processing, ignoring duplicate request");
        return;
      }

      // ========================================
      // STEP 1: VALIDASI AUTHENTICATION
      // ========================================
      if (!isAuthenticated) {
        console.log("🔒 User not authenticated, showing login modal");

        // Tampilkan login modal (TIDAK PAKAI TOAST, modal saja sudah cukup)
        setShowLoginModal(true);

        return; // Stop execution
      }

      // ========================================
      // STEP 2: VALIDASI PRODUCT OBJECT
      // ========================================
      if (!product || typeof product !== "object") {
        console.error("❌ Invalid product object:", product);

        toast.error("Produk tidak valid");

        return; // Stop execution
      }

      // ========================================
      // STEP 3: VALIDASI STOCK AVAILABILITY
      // ========================================
      if (
        product.stock === undefined ||
        product.stock === null ||
        parseFloat(product.stock) === 0
      ) {
        console.log("⚠️ Product out of stock:", product.name);

        toast.error(`Maaf, ${product.name} sedang habis stok`);

        return; // Stop execution
      }

      // ========================================
      // STEP 4: VALIDASI QUANTITY VS STOCK
      // ========================================
      const availableStock = normalizeQty(product.stock);
      const unitLabel = getUnitLabel(product);

      if (requestedQty > availableStock) {
        console.log(
          "⚠️ Insufficient stock. Requested:",
          requestedQty,
          "Available:",
          availableStock
        );

        toast.error(
          `Stok tidak mencukupi. Tersedia: ${formatQty(availableStock)} ${unitLabel}`
        );

        return; // Stop execution
      }

      // Validasi quantity minimal
      if (requestedQty <= 0) {
        console.log("⚠️ Invalid quantity:", requestedQty);

        toast.error(`Jumlah minimal pembelian adalah lebih dari 0 ${unitLabel}`);

        return; // Stop execution
      }

      // ========================================
      // STEP 4.5: VALIDASI CURRENT CART QUANTITY
      // ========================================
      // ✅ CRITICAL: Check if adding will exceed stock limit
      const cartStore = useCartStore.getState();
      const existingCartItem = cartStore.items.find(
        (item) => item.id === product.id
      );

      if (existingCartItem) {
        const newTotalQuantity = normalizeQty(
          normalizeQty(existingCartItem.quantity) + requestedQty
        );

        if (newTotalQuantity > availableStock) {
          console.log("⚠️ Adding would exceed stock:", {
            currentInCart: existingCartItem.quantity,
            tryingToAdd: requestedQty,
            newTotal: newTotalQuantity,
            maxStock: availableStock,
          });

          const remaining = normalizeQty(
            availableStock - normalizeQty(existingCartItem.quantity)
          );

          if (remaining <= 0) {
            toast.error(
              `${product.name} sudah maksimal di keranjang (${formatQty(availableStock)} ${unitLabel})`
            );
          } else {
            toast.error(
              `Hanya bisa menambah ${formatQty(remaining)} ${unitLabel} lagi. Stok maksimal: ${formatQty(availableStock)} ${unitLabel}`
            );
          }

          return; // Stop execution
        }
      }

      // ========================================
      // STEP 5: ADD TO CART
      // ========================================
      try {
        // Set loading state IMMEDIATELY before any async operation
        setIsProcessing(true);

        console.log("🛒 Adding to cart:", {
          product: product.name,
          quantity: requestedQty,
          stock: availableStock,
          currentInCart: existingCartItem?.quantity || 0,
        });

        // Add item to cart via Zustand store
        // Store akan handle:
        // - Merge jika produk sudah ada
        // - Simpan ke localStorage
        // - Update total items & price
        addItem(product, requestedQty);

        // ========================================
        // SUCCESS NOTIFICATION (Skip if silent mode)
        // ========================================
        if (!silent) {
          // Format pesan sesuai quantity
          const message = `${product.name} (${formatQty(requestedQty)} ${unitLabel}) ditambahkan ke keranjang!`;

          toast.success(message);
        }

        console.log(
          "✅ Successfully added to cart",
          silent ? "(silent mode)" : ""
        );
      } catch (error) {
        // ========================================
        // ERROR HANDLING
        // ========================================
        console.error("❌ Error adding to cart:", error);

        toast.error(
          "Gagal menambahkan produk ke keranjang. Silakan coba lagi."
        );
      } finally {
        // Reset loading state
        setIsProcessing(false);
      }
    };
  };

  // ========================================
  // RETURN HOOK UTILITIES
  // ========================================
  return {
    handleAddToCart, // Function untuk add to cart
    showLoginModal, // State login modal
    setShowLoginModal, // Setter login modal
    isProcessing, // Loading state
  };
};

export default useAddToCart;
