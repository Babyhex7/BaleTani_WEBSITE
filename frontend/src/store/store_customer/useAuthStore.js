import { create } from "zustand";
import { persist } from "zustand/middleware";
import { debugLog, diffStates } from "../../utils/debugLogger";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        debugLog("AUTH", "setUser called", { user });
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token) => {
        debugLog("AUTH", "setToken called", { hasToken: !!token });
        set({ token });
      },

      setLoading: (isLoading) => {
        debugLog("AUTH", "setLoading", { isLoading });
        set({ isLoading });
      },

      setError: (error) => {
        debugLog("AUTH", "setError", { error });
        set({ error });
      },

      login: (userData, token) => {
        debugLog("AUTH", "Customer login()", { userData, hasToken: !!token });
        set({
          user: userData,
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        debugLog("AUTH", "Customer logout()");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear ONLY customer storage
        localStorage.removeItem("baletani-customer-storage");
      },

      clearError: () => set({ error: null }),

      // Check if user has specific role
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      // Check if user has any of the specified roles
      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.includes(user?.role);
      },

      // Check if user is admin or staff
      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin";
      },

      isStaff: () => {
        const { user } = get();
        return user?.role === "staff";
      },

      isCustomer: () => {
        const { user } = get();
        return user?.role === "customer";
      },

      // Check if user can access admin area
      canAccessAdmin: () => {
        const { user } = get();
        return user?.role === "admin" || user?.role === "staff";
      },

      // Get user display name
      getDisplayName: () => {
        const { user } = get();
        return user?.full_name || user?.email || "User";
      },

      // Update user profile
      updateProfile: (updatedUser) => {
        debugLog("AUTH", "updateProfile()", { updatedUser });
        set((state) => ({
          user: { ...state.user, ...updatedUser },
        }));
      },
    }),
    {
      name: "baletani-customer-storage", // HARUS BEDA dengan admin!
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Subscribe untuk diff logging (hanya aktif jika debug)
let prevState;
useAuthStore.subscribe((next) => {
  if (prevState) diffStates(prevState, next);
  prevState = next;
});

export default useAuthStore;
