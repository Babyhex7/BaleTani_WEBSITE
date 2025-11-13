/**
 * CART STORE - Zustand
 * Manages shopping cart state for customer
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],

      // Computed values (as functions)
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.finalPrice * item.quantity,
          0
        );
      },

      // Actions
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          // Update quantity if item exists
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                // Handle both single image and array of images
                image:
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : product.image || null,
                price: product.price,
                finalPrice: product.discount?.finalPrice || product.price,
                discount: product.discount,
                quantity,
                stock: product.stock,
                unit: product.unit,
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === productId
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      // Get item by ID
      getItem: (productId) => {
        return get().items.find((item) => item.id === productId);
      },
    }),
    {
      name: "baletani-cart", // LocalStorage key
      partialState: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

export default useCartStore;
