const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No user found.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

// Role-based permissions helper
const ROLE_PERMISSIONS = {
  super_admin: {
    products: ["create", "read", "update", "delete"],
    orders: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
    procurement: ["create", "read", "update", "delete", "approve"],
    reports: ["view_all"],
  },
  super_whatsapp_admin: {
    orders: ["create", "read", "update"], // only online orders
    customers: ["create", "read", "update"],
  },
  super_cashier: {
    orders: ["create", "read", "update"], // both online and offline
    products: ["read"],
  },
  whatsapp_admin: {
    orders: ["create", "read", "update"], // only online orders
    customers: ["read"],
  },
  cashier: {
    orders: ["create", "read", "update"], // only offline orders
    products: ["read"],
  },
  finance_admin: {
    orders: ["read"],
    procurement: ["read"],
    reports: ["view_finance"],
  },
  inventory_admin: {
    procurement: ["create", "read"],
    products: ["read"],
  },
  super_inventory_admin: {
    procurement: ["create", "read", "update", "approve"],
    products: ["create", "read", "update", "delete"],
    reports: ["view_inventory"],
  },
};

// Check specific permission
const hasPermission = (role, resource, action) => {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions || !permissions[resource]) {
    return false;
  }
  return permissions[resource].includes(action);
};

// Middleware to check specific permission
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No user found.",
      });
    }

    if (!hasPermission(req.user.role, resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You don't have permission to ${action} ${resource}.`,
      });
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware, checkPermission, hasPermission };
