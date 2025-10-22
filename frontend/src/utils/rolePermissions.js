/**
 * Role-based Access Control Helper
 * Menentukan akses dan permissions berdasarkan role user
 */

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  SUPER_WHATSAPP_ADMIN: "super_whatsapp_admin",
  SUPER_CASHIER: "super_cashier",
  WHATSAPP_ADMIN: "whatsapp_admin",
  CASHIER: "cashier",
  FINANCE_ADMIN: "finance_admin",
  INVENTORY_ADMIN: "inventory_admin",
  SUPER_INVENTORY_ADMIN: "super_inventory_admin",
  CUSTOMER: "customer",
};

export const PERMISSIONS = {
  // Product permissions
  VIEW_PRODUCTS: "view_products",
  CREATE_PRODUCT: "create_product",
  UPDATE_PRODUCT: "update_product",
  DELETE_PRODUCT: "delete_product",

  // Order permissions
  VIEW_ORDERS: "view_orders",
  VIEW_ORDERS_ONLINE: "view_orders_online",
  VIEW_ORDERS_OFFLINE: "view_orders_offline",
  CREATE_ORDER: "create_order",
  CREATE_ORDER_ONLINE: "create_order_online",
  CREATE_ORDER_OFFLINE: "create_order_offline",
  UPDATE_ORDER: "update_order",
  CANCEL_ORDER: "cancel_order",

  // User/Customer permissions
  VIEW_USERS: "view_users",
  CREATE_USER: "create_user",
  UPDATE_USER: "update_user",
  DELETE_USER: "delete_user",

  // Procurement permissions
  VIEW_PROCUREMENT: "view_procurement",
  CREATE_PROCUREMENT: "create_procurement",
  APPROVE_PROCUREMENT: "approve_procurement",
  REJECT_PROCUREMENT: "reject_procurement",

  // Report permissions
  VIEW_REPORTS: "view_reports",
  VIEW_FINANCE_REPORTS: "view_finance_reports",
  VIEW_INVENTORY_REPORTS: "view_inventory_reports",
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.CANCEL_ORDER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.VIEW_PROCUREMENT,
    PERMISSIONS.CREATE_PROCUREMENT,
    PERMISSIONS.APPROVE_PROCUREMENT,
    PERMISSIONS.REJECT_PROCUREMENT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_FINANCE_REPORTS,
    PERMISSIONS.VIEW_INVENTORY_REPORTS,
  ],
  [ROLES.SUPER_WHATSAPP_ADMIN]: [
    PERMISSIONS.VIEW_ORDERS_ONLINE,
    PERMISSIONS.CREATE_ORDER_ONLINE,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.UPDATE_USER,
  ],
  [ROLES.SUPER_CASHIER]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.VIEW_PRODUCTS,
  ],
  [ROLES.WHATSAPP_ADMIN]: [
    PERMISSIONS.VIEW_ORDERS_ONLINE,
    PERMISSIONS.CREATE_ORDER_ONLINE,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.VIEW_USERS,
  ],
  [ROLES.CASHIER]: [
    PERMISSIONS.VIEW_ORDERS_OFFLINE,
    PERMISSIONS.CREATE_ORDER_OFFLINE,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.VIEW_PRODUCTS,
  ],
  [ROLES.FINANCE_ADMIN]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_PROCUREMENT,
    PERMISSIONS.VIEW_FINANCE_REPORTS,
  ],
  [ROLES.INVENTORY_ADMIN]: [
    PERMISSIONS.VIEW_PROCUREMENT,
    PERMISSIONS.CREATE_PROCUREMENT,
    PERMISSIONS.VIEW_PRODUCTS,
  ],
  [ROLES.SUPER_INVENTORY_ADMIN]: [
    PERMISSIONS.VIEW_PROCUREMENT,
    PERMISSIONS.CREATE_PROCUREMENT,
    PERMISSIONS.APPROVE_PROCUREMENT,
    PERMISSIONS.REJECT_PROCUREMENT,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.VIEW_INVENTORY_REPORTS,
  ],
};

/**
 * Check if user has permission
 * @param {string} userRole - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions ? permissions.includes(permission) : false;
};

/**
 * Check if user has any of the permissions
 * @param {string} userRole - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

/**
 * Check if user has all permissions
 * @param {string} userRole - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};

/**
 * Get role display name
 * @param {string} role - Role key
 * @returns {string}
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.SUPER_ADMIN]: "Super Admin",
    [ROLES.SUPER_WHATSAPP_ADMIN]: "Super WhatsApp Admin",
    [ROLES.SUPER_CASHIER]: "Super Cashier",
    [ROLES.WHATSAPP_ADMIN]: "WhatsApp Admin",
    [ROLES.CASHIER]: "Cashier",
    [ROLES.FINANCE_ADMIN]: "Finance Admin",
    [ROLES.INVENTORY_ADMIN]: "Inventory Admin",
    [ROLES.SUPER_INVENTORY_ADMIN]: "Super Inventory Admin",
    [ROLES.CUSTOMER]: "Customer",
  };
  return roleNames[role] || role;
};

/**
 * Get accessible menu items based on role
 * @param {string} userRole - User role
 * @returns {Array}
 */
export const getAccessibleMenuItems = (userRole) => {
  const allMenuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      permission: null, // All admin roles can access
    },
    {
      name: "Products",
      path: "/admin/products",
      permission: PERMISSIONS.VIEW_PRODUCTS,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      permission: PERMISSIONS.VIEW_ORDERS,
    },
    {
      name: "Customers",
      path: "/admin/customers",
      permission: PERMISSIONS.VIEW_USERS,
    },
    {
      name: "Procurement",
      path: "/admin/procurement",
      permission: PERMISSIONS.VIEW_PROCUREMENT,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      permission: PERMISSIONS.VIEW_REPORTS,
    },
    {
      name: "User Management",
      path: "/admin/users",
      permission: PERMISSIONS.VIEW_USERS,
    },
  ];

  return allMenuItems.filter(
    (item) => !item.permission || hasPermission(userRole, item.permission)
  );
};

/**
 * Check if user can manage online orders
 * @param {string} userRole - User role
 * @returns {boolean}
 */
export const canManageOnlineOrders = (userRole) => {
  return [
    ROLES.SUPER_ADMIN,
    ROLES.SUPER_WHATSAPP_ADMIN,
    ROLES.SUPER_CASHIER,
    ROLES.WHATSAPP_ADMIN,
  ].includes(userRole);
};

/**
 * Check if user can manage offline orders
 * @param {string} userRole - User role
 * @returns {boolean}
 */
export const canManageOfflineOrders = (userRole) => {
  return [
    ROLES.SUPER_ADMIN,
    ROLES.SUPER_CASHIER,
    ROLES.CASHIER,
  ].includes(userRole);
};

/**
 * Check if user can approve procurement
 * @param {string} userRole - User role
 * @returns {boolean}
 */
export const canApproveProcurement = (userRole) => {
  return [ROLES.SUPER_ADMIN, ROLES.SUPER_INVENTORY_ADMIN].includes(userRole);
};

/**
 * Get allowed transaction types for user
 * @param {string} userRole - User role
 * @returns {string[]}
 */
export const getAllowedTransactionTypes = (userRole) => {
  if (canManageOnlineOrders(userRole) && canManageOfflineOrders(userRole)) {
    return ["online", "offline"];
  } else if (canManageOnlineOrders(userRole)) {
    return ["online"];
  } else if (canManageOfflineOrders(userRole)) {
    return ["offline"];
  }
  return [];
};

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRoleDisplayName,
  getAccessibleMenuItems,
  canManageOnlineOrders,
  canManageOfflineOrders,
  canApproveProcurement,
  getAllowedTransactionTypes,
};
