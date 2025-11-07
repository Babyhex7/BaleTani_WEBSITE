/**
 * CART SERVICE
 * API calls for cart operations
 */

import api from "./apiClient";

const cartService = {
  /**
   * Get customer's cart
   */
  getCart: async () => {
    const response = await api.get("/customer/cart");
    return response.data;
  },

  /**
   * Add item to cart
   */
  addToCart: async (productId, quantity) => {
    const response = await api.post("/customer/cart", {
      product_id: productId,
      quantity: quantity,
    });
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/customer/cart/${itemId}`, {
      quantity: quantity,
    });
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/customer/cart/${itemId}`);
    return response.data;
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    const response = await api.delete("/customer/cart");
    return response.data;
  },
};

export default cartService;
