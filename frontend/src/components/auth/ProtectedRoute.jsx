import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// Import admin store for admin routes
import useAdminStore from '../../store/store_admin/useAdminStore';
import useAuthStore from '../../store/store_customer/useAuthStore';
import { Alert } from '../ui_admin/CommonComponents';

/**
 * Komponen untuk melindungi route berdasarkan role (RBAC)
 * Mengecek apakah user sudah login dan memiliki role yang sesuai
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requireAuth = true,
  requireAdmin = false, // NEW: For admin routes
  requiredPermission = null, // NEW: For permission-based access
  redirectTo = '/login' 
}) => {
  const location = useLocation();
  
  // Use different store based on route type
  const adminStore = useAdminStore();
  const customerStore = useAuthStore();
  
  // Determine which store to use
  const isAdminRoute = requireAdmin || location.pathname.startsWith('/admin');
  const { isAuthenticated, user, admin, hasPermission } = isAdminRoute 
    ? { isAuthenticated: adminStore.isAuthenticated, user: null, admin: adminStore.admin, hasPermission: adminStore.hasPermission }
    : { isAuthenticated: customerStore.isAuthenticated, user: customerStore.user, admin: null, hasPermission: null };

  // ========== ADMIN ROUTES ==========
  if (requireAdmin || isAdminRoute) {
    // Check if admin is authenticated
    if (!isAuthenticated || !admin) {
      console.log('❌ Admin not authenticated, redirecting to login...');
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    // Check specific permission if required
    if (requiredPermission && !hasPermission(requiredPermission)) {
      console.log('❌ No permission:', requiredPermission);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full">
            <Alert
              type="error"
              title="Akses Ditolak"
              message="Anda tidak memiliki izin untuk mengakses halaman ini."
            />
          </div>
        </div>
      );
    }
    
    // Admin authenticated and has permission
    return children;
  }

  // ========== CUSTOMER ROUTES ==========
  // Jika butuh authentication tapi user belum login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Jika tidak butuh authentication dan user sudah login, redirect ke dashboard sesuai role
  if (!requireAuth && isAuthenticated) {
    const userRole = user?.role;
    if (userRole === 'admin' || userRole === 'staff') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  // Jika ada required role, cek apakah user memiliki role tersebut
  if (requiredRole && !hasRequiredRole(user?.role, requiredRole)) {
    // Jika user adalah admin/staff tapi mencoba akses customer area
    if ((user?.role === 'admin' || user?.role === 'staff') && requiredRole === 'customer') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Jika user adalah customer tapi mencoba akses admin area
    if (user?.role === 'customer' && (requiredRole === 'admin' || requiredRole === 'staff')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full">
            <Alert
              type="error"
              title="Akses Ditolak"
              message="Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika ini adalah kesalahan."
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => window.history.back()}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                ← Kembali
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <Navigate to="/unauthorized" replace />;
  }

  // Helper function to check role permissions
  function hasRequiredRole(userRole, requiredRole) {
    if (!userRole || !requiredRole) return false;
    
    // If required role is admin, allow both admin and staff
    if (requiredRole === 'admin') {
      return userRole === 'admin' || userRole === 'staff';
    }
    
    // Otherwise, exact match
    return userRole === requiredRole;
  }

  return children;
};

/**
 * Komponen untuk redirect berdasarkan role user
 * Digunakan untuk root path "/"
 */
export const RoleBasedRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  const userRole = user?.role;
  
  // Redirect admin dan staff ke admin dashboard
  if (userRole === 'admin' || userRole === 'staff') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Redirect customer ke home
  return <Navigate to="/home" replace />;
};

export default ProtectedRoute;