import { create } from "zustand";
import { persist } from "zustand/middleware";
import { debugLog, diffStates } from "../../utils/debugLogger";
import useCartStore from "./useCartStore";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      tokenExpiry: null, // Timestamp when token expires
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

        // Clear cart jika user berbeda login (atau user baru)
        const currentUser = get().user;
        if (currentUser && currentUser.id !== userData.id) {
          debugLog("AUTH", "Different user detected, clearing cart");
          useCartStore.getState().clearCart();
        } else if (!currentUser) {
          // User baru login pertama kali, clear cart untuk memastikan fresh start
          debugLog("AUTH", "New login session, clearing cart");
          useCartStore.getState().clearCart();
        }

        // Calculate token expiry (24 hours from now)
        const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 jam dalam milliseconds

        set({
          user: userData,
          token,
          tokenExpiry: expiryTime,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        debugLog("AUTH", "Customer logout()");

        // Clear cart saat logout untuk mencegah cart tercampur antar user
        useCartStore.getState().clearCart();

        set({
          user: null,
          token: null,
          tokenExpiry: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear ONLY customer storage
        localStorage.removeItem("baletani-customer-storage");
      },

      clearError: () => set({ error: null }),

      // Check if token is still valid (not expired)
      isTokenValid: () => {
        const { token, tokenExpiry } = get();
        if (!token || !tokenExpiry) return false;

        const now = Date.now();
        const isValid = now < tokenExpiry;

        if (!isValid) {
          debugLog("AUTH", "Token expired, auto logout");
        }

        return isValid;
      },

      // Check and auto-logout if token expired
      checkAndLogoutIfExpired: () => {
        const { isTokenValid, logout } = get();
        if (!isTokenValid()) {
          logout();
          return true; // Token expired
        }
        return false; // Token still valid
      },

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
        tokenExpiry: state.tokenExpiry,
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
