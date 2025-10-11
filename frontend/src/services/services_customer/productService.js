import { mockProducts, mockCategories } from "../../utils/mockData";

// Demo mode - set to true to use mock data instead of real API
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || true; // Default true for now

const productService = {
  // Get all products
  getAll: async (params = {}) => {
    if (DEMO_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let products = [...mockProducts];
      
      // Filter by category if specified
      if (params.category) {
        products = products.filter(product => 
          product.category.slug === params.category
        );
      }
      
      // Search by name if specified
      if (params.search) {
        products = products.filter(product =>
          product.name.toLowerCase().includes(params.search.toLowerCase()) ||
          product.description.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      return {
        success: true,
        data: products,
        message: "Products retrieved successfully"
      };
    }
    
    // Real API call would go here
    throw new Error("Real API not available in demo mode");
  },

  // Get product by ID
  getById: async (id) => {
    if (DEMO_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const product = mockProducts.find(p => p.id === parseInt(id));
      if (!product) {
        throw new Error("Product not found");
      }
      
      return {
        success: true,
        data: product,
        message: "Product retrieved successfully"
      };
    }
    
    // Real API call would go here
    throw new Error("Real API not available in demo mode");
  },

  // Get all categories
  getCategories: async () => {
    if (DEMO_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        success: true,
        data: mockCategories,
        message: "Categories retrieved successfully"
      };
    }
    
    // Real API call would go here
    throw new Error("Real API not available in demo mode");
  }
};

export default productService;