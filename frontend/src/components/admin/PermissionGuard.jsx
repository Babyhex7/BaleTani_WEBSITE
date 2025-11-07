import { Navigate } from 'react-router-dom';
import useAdminStore from '../../store/store_admin/useAdminStore';

/**
 * PermissionGuard Component
 * Komponen untuk membatasi akses berdasarkan RBAC permissions
 * 
 * @param {string} module - Nama module (products, orders, users, dll)
 * @param {string} action - Aksi yang dibutuhkan (view, create, update, delete)
 * @param {ReactNode} children - Komponen yang akan di-render jika punya permission
 * @param {ReactNode} fallback - Komponen alternatif jika tidak punya permission (opsional)
 * @param {string} redirectTo - Path untuk redirect jika tidak punya permission (opsional)
 */
const PermissionGuard = ({ 
  module, 
  action, 
  children, 
  fallback = null,
  redirectTo = null 
}) => {
  const hasPermission = useAdminStore((state) => state.hasPermission);
  const admin = useAdminStore((state) => state.admin);

  // Super admin bypass semua permission check
  if (admin?.role === 'super_admin') {
    return <>{children}</>;
  }

  // Check permission
  const allowed = hasPermission(module, action);

  if (!allowed) {
    // Jika ada redirect path, redirect
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Jika ada fallback, tampilkan fallback
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default: tidak render apa-apa
    return null;
  }

  return <>{children}</>;
};

/**
 * Hook untuk check permission di functional component
 * 
 * @example
 * const canCreateProduct = usePermission('products', 'create');
 * if (canCreateProduct) {
 *   // Show create button
 * }
 */
export const usePermission = (module, action) => {
  const hasPermission = useAdminStore((state) => state.hasPermission);
  const admin = useAdminStore((state) => state.admin);

  // Super admin punya akses semua
  if (admin?.role === 'super_admin') {
    return true;
  }

  return hasPermission(module, action);
};

/**
 * Hook untuk check role
 * 
 * @example
 * const isCashier = useRole('cashier');
 */
export const useRole = (roleName) => {
  const admin = useAdminStore((state) => state.admin);
  return admin?.role === roleName;
};

/**
 * Hook untuk check multiple permissions (OR logic - salah satu harus match)
 * 
 * @example
 * const canManageOrders = useAnyPermission([
 *   { module: 'online_orders', action: 'update' },
 *   { module: 'offline_orders', action: 'update' }
 * ]);
 */
export const useAnyPermission = (checks) => {
  const hasAnyPermission = useAdminStore((state) => state.hasAnyPermission);
  const admin = useAdminStore((state) => state.admin);

  // Super admin punya akses semua
  if (admin?.role === 'super_admin') {
    return true;
  }

  return hasAnyPermission(checks);
};

export default PermissionGuard;
