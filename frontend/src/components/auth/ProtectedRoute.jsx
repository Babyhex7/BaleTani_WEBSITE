import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// Corrected relative paths
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
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

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
  if (requiredRole && user?.role !== requiredRole) {
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