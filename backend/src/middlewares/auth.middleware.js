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

// Legacy middleware untuk backward compatibility
const authMiddleware = authenticateAdmin;

module.exports = {
  authMiddleware, // Legacy support
  authenticateAdmin,
  authenticateCustomer,
  roleMiddleware,
};
