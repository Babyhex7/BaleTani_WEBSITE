const jwt = require("jsonwebtoken");
const { User, Customer, Role } = require("../models");

// Middleware untuk Admin Authentication
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak tersedia.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token type is admin
    if (decoded.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Token tidak valid untuk admin.",
      });
    }

    const user = await User.findOne({
      where: {
        id: decoded.userId,
        deleted_at: null,
        is_active: true,
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name", "description"],
        },
      ],
      attributes: { exclude: ["password_hash"] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid.",
      });
    }

    // Check if user has admin role (not customer)
    if (user.role.role_name === "customer") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Token tidak valid.",
    });
  }
};

// Middleware untuk Customer Authentication
const authenticateCustomer = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Token tidak tersedia.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token type is customer
    if (decoded.type !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Token tidak valid untuk customer.",
      });
    }

    const customer = await Customer.findOne({
      where: {
        id: decoded.id,
        deleted_at: null,
        is_active: true,
      },
      attributes: { exclude: ["password_hash"] },
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid.",
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    console.error("Customer auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Token tidak valid.",
    });
  }
};

// Middleware untuk RBAC (Role-Based Access Control) - hanya untuk admin
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. User tidak ditemukan.",
      });
    }

    if (!allowedRoles.includes(req.user.role.role_name)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Permissions tidak mencukupi.",
      });
    }

    next();
  };
};

// Legacy middleware untuk backward compatibility
const authMiddleware = authenticateAdmin;

module.exports = {
  authMiddleware, // Legacy support
  authenticateAdmin,
  authenticateCustomer,
  roleMiddleware,
};
