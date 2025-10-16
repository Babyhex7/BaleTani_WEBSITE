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

  // Determine which auth to use based on required role
  let isAuthenticated, user;
  
  if (requiredRole === 'admin' || requiredRole === 'staff') {
    // For admin routes, use admin store
    isAuthenticated = adminAuth.isAuthenticated;
    user = adminAuth.admin;
  } else {
    // For customer routes or no specific role, use customer store
    isAuthenticated = customerAuth.isAuthenticated;
    user = customerAuth.user;
  }

  // Debug logging
  console.log('[ProtectedRoute] Check:', {
    isAuthenticated,
    user,
    userRole: user?.role,
    normalizedRole: typeof user?.role === 'string' ? user?.role : user?.role?.role_name,
    requiredRole,
    requireAuth,
    path: location.pathname,
    adminAuth: adminAuth.isAuthenticated,
    customerAuth: customerAuth.isAuthenticated
  });

  // Jika butuh authentication tapi user belum login
  if (requireAuth && !isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    // Redirect admin ke admin login
    if (requiredRole === 'admin' || requiredRole === 'staff') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // Redirect customer ke customer login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
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