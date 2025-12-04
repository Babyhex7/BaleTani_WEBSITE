import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// Corrected relative paths
import useAuthStore from '../../store/store_customer/useAuthStore';
import useAdminStore from '../../store/store_admin/useAdminStore';
import { Alert } from '../ui_admin/CommonComponents';

// Helper function to check role permissions
function hasRequiredRole(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  
  // Normalize userRole (bisa string atau object dengan role_name)
  const normalizedRole = typeof userRole === 'string' 
    ? userRole 
    : userRole.role_name || userRole;
  
  // Admin roles that are allowed to access admin area
  const adminRoles = [
    'admin',
    'staff',
    'super_admin',
    'super_whatsapp_admin',
    'super_cashier',
    'whatsapp_admin',
    'cashier',
    'finance_admin',
    'inventory_admin',
    'super_inventory_admin'
  ];
  
  // If required role is admin, allow any admin role
  if (requiredRole === 'admin') {
    return adminRoles.includes(normalizedRole);
  }
  
  // Otherwise, exact match
  return normalizedRole === requiredRole;
}

/**
 * Komponen untuk melindungi route berdasarkan role (RBAC)
 * Mengecek apakah user sudah login dan memiliki role yang sesuai
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requireAuth = true,
  redirectTo = '/login' 
}) => {
  const customerAuth = useAuthStore();
  const adminAuth = useAdminStore();
  const location = useLocation();

  // Check if current path is admin route
  const isAdminPath = location.pathname.startsWith('/admin');
  
  // Determine which auth to use based on required role OR path
  let isAuthenticated, user;
  
  if (requiredRole === 'admin' || requiredRole === 'staff' || isAdminPath) {
    // For admin routes, ALWAYS use admin store
    isAuthenticated = adminAuth.isAuthenticated && !!adminAuth.token && !!adminAuth.admin;
    user = adminAuth.admin;
    
    // Check token expiry for admin
    if (isAuthenticated && adminAuth.tokenExpiry) {
      const now = Date.now();
      if (now > adminAuth.tokenExpiry) {
        console.warn('[ProtectedRoute] Admin token expired, logging out');
        adminAuth.logout();
        isAuthenticated = false;
        user = null;
      }
    }
  } else {
    // For customer routes or no specific role, use customer store
    isAuthenticated = customerAuth.isAuthenticated;
    user = customerAuth.user;
  }

  // Enhanced debug logging
  console.log('[ProtectedRoute] ===== ROUTE PROTECTION CHECK =====');
  console.log('[ProtectedRoute] Path:', location.pathname);
  console.log('[ProtectedRoute] Is Admin Path:', isAdminPath);
  console.log('[ProtectedRoute] Required Role:', requiredRole);
  console.log('[ProtectedRoute] Require Auth:', requireAuth);
  console.log('[ProtectedRoute] Authentication Status:', {
    isAuthenticated,
    user: user?.name || user?.username,
    userRole: user?.role,
  });
  console.log('[ProtectedRoute] Admin Store:', {
    isAuthenticated: adminAuth.isAuthenticated,
    hasToken: !!adminAuth.token,
    hasAdmin: !!adminAuth.admin,
    adminName: adminAuth.admin?.name,
    tokenExpiry: adminAuth.tokenExpiry ? new Date(adminAuth.tokenExpiry).toISOString() : null,
    isExpired: adminAuth.tokenExpiry ? Date.now() > adminAuth.tokenExpiry : null
  });
  console.log('[ProtectedRoute] Customer Store:', {
    isAuthenticated: customerAuth.isAuthenticated,
    hasToken: !!customerAuth.token,
    hasUser: !!customerAuth.user
  });
  console.log('[ProtectedRoute] =====================================');

  // Jika butuh authentication tapi user belum login
  if (requireAuth && !isAuthenticated) {
    console.warn('[ProtectedRoute] ❌ NOT AUTHENTICATED - REDIRECTING');
    
    // ALWAYS redirect admin paths to admin login
    if (isAdminPath || requiredRole === 'admin' || requiredRole === 'staff') {
      console.log('[ProtectedRoute] 🔐 Redirecting to ADMIN LOGIN (/admin/login)');
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    // Redirect customer ke customer login WITH returnUrl
    const returnUrl = `${redirectTo}?returnUrl=${location.pathname}`;
    console.log('[ProtectedRoute] 🔐 Redirecting to CUSTOMER LOGIN:', returnUrl);
    return <Navigate to={returnUrl} state={{ from: location }} replace />;
  }

  // Jika tidak butuh authentication dan user sudah login, redirect ke dashboard sesuai role
  if (!requireAuth && isAuthenticated) {
    const userRole = typeof user?.role === 'string' ? user?.role : user?.role?.role_name;
    const adminRoles = ['admin', 'staff', 'super_admin', 'super_whatsapp_admin', 'super_cashier', 
                        'whatsapp_admin', 'cashier', 'finance_admin', 'inventory_admin', 'super_inventory_admin'];
    
    if (adminRoles.includes(userRole)) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  // Jika ada required role, cek apakah user memiliki role tersebut
  if (requiredRole && !hasRequiredRole(user?.role, requiredRole)) {
    console.log('[ProtectedRoute] Role mismatch:', { userRole: user?.role, requiredRole });
    
    const userRole = typeof user?.role === 'string' ? user?.role : user?.role?.role_name;
    const adminRoles = ['admin', 'staff', 'super_admin', 'super_whatsapp_admin', 'super_cashier', 
                        'whatsapp_admin', 'cashier', 'finance_admin', 'inventory_admin', 'super_inventory_admin'];
    
    // Jika user adalah admin/staff tapi mencoba akses customer area
    if (adminRoles.includes(userRole) && requiredRole === 'customer') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Jika user adalah customer tapi mencoba akses admin area
    if (userRole === 'customer' && requiredRole === 'admin') {
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

    // Default unauthorized page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full">
          <Alert
            type="error"
            title="Akses Ditolak"
            message="Anda tidak memiliki izin untuk mengakses halaman ini."
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

  return children;
};

/**
 * Komponen untuk redirect berdasarkan role user
 * Digunakan untuk root path "/"
 */
export const RoleBasedRedirect = () => {
  const customerAuth = useAuthStore();
  const adminAuth = useAdminStore();

  // Check admin auth first
  if (adminAuth.isAuthenticated && adminAuth.admin) {
    const adminRole = typeof adminAuth.admin?.role === 'string' 
      ? adminAuth.admin?.role 
      : adminAuth.admin?.role?.role_name;
    
    const adminRoles = ['admin', 'staff', 'super_admin', 'super_whatsapp_admin', 'super_cashier', 
                        'whatsapp_admin', 'cashier', 'finance_admin', 'inventory_admin', 'super_inventory_admin'];
    
    if (adminRoles.includes(adminRole)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Check customer auth
  if (customerAuth.isAuthenticated && customerAuth.user) {
    return <Navigate to="/home" replace />;
  }

  // Not authenticated, redirect to landing
  return <Navigate to="/landing" replace />;
};

export default ProtectedRoute;