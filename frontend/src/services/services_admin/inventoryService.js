import adminApiClient from "./adminApiClient";

/**
 * Service untuk API Inventory Management
 * CRUD produk, kategori, dan manajemen stok
 */

// === PRODUK ===

// Mendapatkan daftar produk dengan pagination dan filter
export const getProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await adminApiClient.get(`/admin/products?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengambil data produk" };
  }
};

// Mendapatkan detail produk
export const getProductById = async (id) => {
  try {
    const response = await adminApiClient.get(`/admin/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengambil detail produk" };
  }
};

// Membuat produk baru
export const createProduct = async (productData) => {
  try {
    // Check if productData is FormData (for image uploads)
    const isFormData = productData instanceof FormData;

    const response = await adminApiClient.post(
      "/admin/products",
      productData,
      isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal membuat produk baru" };
  }
};

// Memperbarui produk
export const updateProduct = async (id, productData) => {
  try {
    // Check if productData is FormData (for image uploads)
    const isFormData = productData instanceof FormData;

    const response = await adminApiClient.put(
      `/admin/products/${id}`,
      productData,
      isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal memperbarui produk" };
  }
};

// Menghapus produk
export const deleteProduct = async (id) => {
  try {
    const response = await adminApiClient.delete(`/admin/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal menghapus produk" };
  }
};

// === KATEGORI ===

// Mendapatkan daftar kategori dengan pagination dan filter
export const getCategories = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await adminApiClient.get(
      `/admin/categories${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengambil data kategori" };
  }
};

// Mendapatkan detail kategori by ID
export const getCategoryById = async (id) => {
  try {
    const response = await adminApiClient.get(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mengambil detail kategori" }
    );
  }
};

// Membuat kategori baru
export const createCategory = async (categoryData) => {
  try {
    // Check if categoryData is FormData (for image uploads)
    const isFormData = categoryData instanceof FormData;

    const response = await adminApiClient.post(
      "/admin/categories",
      categoryData,
      isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal membuat kategori baru" };
  }
};

// Memperbarui kategori
export const updateCategory = async (id, categoryData) => {
  try {
    // Check if categoryData is FormData (for image uploads)
    const isFormData = categoryData instanceof FormData;

    const response = await adminApiClient.put(
      `/admin/categories/${id}`,
      categoryData,
      isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal memperbarui kategori" };
  }
};

// Menghapus kategori (soft delete)
export const deleteCategory = async (id) => {
  try {
    const response = await adminApiClient.delete(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal menghapus kategori" };
  }
};

// === STOK & INVENTORY ===

// Update stok produk
export const updateProductStock = async (id, stockData) => {
  try {
    const response = await adminApiClient.patch(
      `/admin/products/${id}/stock`,
      stockData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal memperbarui stok produk" };
  }
};

// Mendapatkan riwayat inventory
export const getInventoryLogs = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await adminApiClient.get(
      `/admin/inventory/logs?${queryString}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mengambil riwayat inventory" }
    );
  }
};

// Bulk update stok (untuk multiple produk)
export const bulkUpdateStock = async (updates) => {
  try {
    const response = await adminApiClient.patch("/admin/products/bulk-stock", {
      updates,
    });
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal melakukan bulk update stok" }
    );
  }
};

// === DISCOUNT MANAGEMENT ===

// Get discounts with pagination and filters
export const getDiscounts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await adminApiClient.get(
      `/admin/discounts${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengambil data diskon" };
  }
};

// Get discount detail by id
export const getDiscountById = async (id) => {
  try {
    const response = await adminApiClient.get(`/admin/discounts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengambil detail diskon" };
  }
};

// Create discount
export const createDiscount = async (discountData) => {
  try {
    const response = await adminApiClient.post(
      `/admin/discounts`,
      discountData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal membuat diskon" };
  }
};

// Update discount
export const updateDiscount = async (id, discountData) => {
  try {
    const response = await adminApiClient.put(
      `/admin/discounts/${id}`,
      discountData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengupdate diskon" };
  }
};

// Soft delete discount
export const deleteDiscount = async (id) => {
  try {
    const response = await adminApiClient.delete(`/admin/discounts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal menghapus diskon" };
  }
};

// Restore deleted discount (super admin)
export const restoreDiscount = async (id) => {
  try {
    const response = await adminApiClient.post(
      `/admin/discounts/${id}/restore`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal memulihkan diskon" };
  }
};

// Toggle discount active status
export const toggleDiscountStatus = async (id) => {
  try {
    const response = await adminApiClient.patch(
      `/admin/discounts/${id}/toggle-status`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengubah status diskon" };
  }
};

// Add products to discount
export const addProductsToDiscount = async (discountId, productIds = []) => {
  try {
    const response = await adminApiClient.post(
      `/admin/discounts/${discountId}/products`,
      {
        product_ids: productIds,
      }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal menambahkan produk ke diskon" }
    );
  }
};

// Remove product from discount
export const removeProductFromDiscount = async (discountId, productId) => {
  try {
    const response = await adminApiClient.delete(
      `/admin/discounts/${discountId}/products/${productId}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal menghapus produk dari diskon" }
    );
  }
};

// Default export untuk backward compatibility
const inventoryService = {
  // Produk
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // Kategori
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // Stok & Inventory
  updateProductStock,
  getInventoryLogs,
  bulkUpdateStock,
  // Discounts
  getDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  restoreDiscount,
  toggleDiscountStatus,
  addProductsToDiscount,
  removeProductFromDiscount,
};

export default inventoryService;
