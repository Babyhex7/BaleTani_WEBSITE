/**
 * CUSTOM HOOK: useProducts
 * Manages product state, fetching, filtering, and pagination
 */

import { useState, useEffect, useCallback } from "react";
import productService from "../../services/services_customer/productService";

const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: "",
    category: "",
    minPrice: 0,
    maxPrice: 999999999,
    sortBy: "newest",
    ...initialFilters,
  });
  const [categories, setCategories] = useState([]);

  /**
   * Fetch products based on current filters
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getAllProducts(filters);

      if (response.success) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);

        // Update categories list if available
        if (response.data.filters?.categories) {
          setCategories(response.data.filters.categories);
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Update filters and trigger fetch
   */
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1, // Reset to page 1 when filters change
    }));
  };

  /**
   * Search products by name
   */
  const searchProducts = (searchQuery) => {
    updateFilters({ search: searchQuery, page: 1 });
  };

  /**
   * Filter by category
   */
  const filterByCategory = (categoryId) => {
    updateFilters({ category: categoryId, page: 1 });
  };

  /**
   * Filter by price range
   */
  const filterByPrice = (minPrice, maxPrice) => {
    updateFilters({ minPrice, maxPrice, page: 1 });
  };

  /**
   * Sort products
   */
  const sortProducts = (sortBy) => {
    updateFilters({ sortBy, page: 1 });
  };

  /**
   * Change page
   */
  const changePage = (page) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      search: "",
      category: "",
      minPrice: 0,
      maxPrice: 999999999,
      sortBy: "newest",
    });
  };

  /**
   * Fetch products when filters change
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    filters,
    categories,
    searchProducts,
    filterByCategory,
    filterByPrice,
    sortProducts,
    changePage,
    resetFilters,
    refetch: fetchProducts,
  };
};

export default useProducts;
