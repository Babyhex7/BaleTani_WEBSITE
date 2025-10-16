import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Store untuk Admin Management
 * Mengelola state global untuk admin functionality
 */
const useAdminStore = create(
  persist(
    (set, get) => ({
      // Admin Auth State
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // State untuk dashboard
      dashboardStats: null,
      recentOrders: [],
      lowStockProducts: [],
      notifications: [],

      // State untuk inventory
      products: [],
      categories: [],
      totalProducts: 0,

      // State untuk users
      users: [],
      totalUsers: 0,
      userStats: {
        totalAdmins: 0,
        totalStaff: 0,
        totalCustomers: 0,
      },

      // Loading states
      isLoadingDashboard: false,
      isLoadingProducts: false,
      isLoadingUsers: false,

      // Error states
      dashboardError: null,
      inventoryError: null,
      userError: null,

      // Admin Auth Actions
      login: (admin, token) =>
        set({
          admin,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      // Actions untuk Dashboard
      setDashboardData: (data) =>
        set({
          dashboardStats: data.stats,
          recentOrders: data.recentOrders,
          lowStockProducts: data.lowStockProducts,
          notifications: data.notifications,
        }),

      setDashboardLoading: (isLoading) =>
        set({ isLoadingDashboard: isLoading }),
      setDashboardError: (error) => set({ dashboardError: error }),

      // Actions untuk Inventory
      setProducts: (products, total) =>
        set({
          products,
          totalProducts: total,
        }),

      setCategories: (categories) => set({ categories }),

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
          totalProducts: state.totalProducts + 1,
        })),

      updateProduct: (id, updatedProduct) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updatedProduct } : p
          ),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          totalProducts: state.totalProducts - 1,
        })),

      setInventoryLoading: (isLoading) => set({ isLoadingProducts: isLoading }),
      setInventoryError: (error) => set({ inventoryError: error }),

      // Actions untuk User Management
      setUsers: (users, total) =>
        set({
          users,
          totalUsers: total,
        }),

      setUserStats: (stats) => set({ userStats: stats }),

      addUser: (user) =>
        set((state) => ({
          users: [...state.users, user],
          totalUsers: state.totalUsers + 1,
        })),

      updateUser: (id, updatedUser) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updatedUser } : u
          ),
        })),

      removeUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          totalUsers: state.totalUsers - 1,
        })),

      setUserLoading: (isLoading) => set({ isLoadingUsers: isLoading }),
      setUserError: (error) => set({ userError: error }),

      // Clear functions
      clearDashboardError: () => set({ dashboardError: null }),
      clearInventoryError: () => set({ inventoryError: null }),
      clearUserError: () => set({ userError: null }),

      // Reset store
      resetAdminStore: () =>
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          dashboardStats: null,
          recentOrders: [],
          lowStockProducts: [],
          notifications: [],
          products: [],
          categories: [],
          totalProducts: 0,
          users: [],
          totalUsers: 0,
          userStats: {
            totalAdmins: 0,
            totalStaff: 0,
            totalCustomers: 0,
          },
          isLoadingDashboard: false,
          isLoadingProducts: false,
          isLoadingUsers: false,
          dashboardError: null,
          inventoryError: null,
          userError: null,
        }),
    }),
    {
      name: "baletani-admin-storage",
      // Persist admin auth dan data penting
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        dashboardStats: state.dashboardStats,
        categories: state.categories,
        userStats: state.userStats,
      }),
    }
  )
);

export default useAdminStore;
