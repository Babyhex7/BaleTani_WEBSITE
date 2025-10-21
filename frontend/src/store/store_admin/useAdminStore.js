import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Store untuk Admin Management
 * Mengelola state global untuk admin functionality dan authentication
 */
const useAdminStore = create(
  persist(
    (set, get) => ({
      // ============ AUTH STATE ============
      admin: {
        id: "admin-001",
        full_name: "Super Admin",
        phone_number: "081234567890",
        role: {
          id: "role-001",
          role_name: "super_admin",
          description: "Full system access",
        },
      },
      isAuthenticated: true, // Set true untuk testing
      token: "dummy-token-for-testing",

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

      // ============ AUTH ACTIONS ============
      setAdmin: (adminData, token) =>
        set({
          admin: adminData,
          isAuthenticated: true,
          token: token,
        }),

      logout: () =>
        set({
          admin: null,
          isAuthenticated: false,
          token: null,
        }),

      updateAdmin: (adminData) =>
        set({
          admin: adminData,
        }),

      // Check if admin has permission
      hasPermission: (permission) => {
        const { admin } = get();
        if (!admin || !admin.role) return false;

        // Super Admin has all permissions
        if (admin.role.role_name === "super_admin") return true;

        // Define permissions per role
        const rolePermissions = {
          super_inventory_admin: [
            "products",
            "procurement",
            "inventory",
            "approval",
          ],
          super_whatsapp_admin: [
            "orders",
            "orders_online",
            "customers",
            "whatsapp",
          ],
          super_cashier: ["orders", "transactions", "customers"],
          inventory_admin: ["procurement", "inventory"],
          whatsapp_admin: ["orders_online", "customers"],
          cashier: ["transactions"],
          finance_admin: ["reports", "finance"],
        };

        const userPermissions = rolePermissions[admin.role.role_name] || [];
        return userPermissions.includes(permission);
      },

      getRole: () => {
        const { admin } = get();
        return admin?.role?.role_name || null;
      },

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
      // Hanya persist data penting, tidak persist loading/error states
      partialize: (state) => ({
        dashboardStats: state.dashboardStats,
        categories: state.categories,
        userStats: state.userStats,
      }),
    }
  )
);

export default useAdminStore;
