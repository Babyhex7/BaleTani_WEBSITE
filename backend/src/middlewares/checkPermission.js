/**
 * PERMISSION CHECK MIDDLEWARE
 * Middleware untuk mengecek apakah user punya permission tertentu
 * Reusable untuk semua endpoint
 */

const { Admin, Role, Permission, RolePermission } = require("../models");

/**
 * Middleware untuk cek permission
 * @param {string} module - Nama module (contoh: 'products', 'orders')
 * @param {string} action - Aksi yang dilakukan (contoh: 'view', 'create', 'update', 'delete')
 * @returns {Function} Express middleware
 *
 * @example
 * router.post('/products', checkPermission('products', 'create'), createProduct);
 * router.put('/products/:id', checkPermission('products', 'update'), updateProduct);
 */
const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // Ambil admin dari request (sudah di-set oleh authenticateAdmin middleware)
      const adminId = req.admin?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Admin not logged in",
        });
      }

      // Ambil admin dengan role-nya
      const admin = await Admin.findByPk(adminId, {
        include: [
          {
            model: Role,
            as: "role",
          },
        ],
      });

      if (!admin || !admin.role) {
        return res.status(403).json({
          success: false,
          message: "Access denied - No role assigned",
        });
      }

      // Super Admin punya akses ke semua
      if (admin.role.role_name === "super_admin") {
        req.userRole = admin.role.role_name;
        return next();
      }

      // Cari permission yang diminta
      const permission = await Permission.findOne({
        where: { module, action },
      });

      if (!permission) {
        return res.status(500).json({
          success: false,
          message: `Permission not found: ${module}.${action}`,
        });
      }

      // Cek apakah role punya permission ini
      const rolePermission = await RolePermission.findOne({
        where: {
          role_id: admin.role.id,
          permission_id: permission.id,
        },
      });

      if (!rolePermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied - Required permission: ${module}.${action}`,
          userRole: admin.role.role_name,
          requiredPermission: `${module}.${action}`,
        });
      }

      // Simpan info role di request untuk dipakai controller
      req.userRole = admin.role.role_name;

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
        error: error.message,
      });
    }
  };
};

module.exports = checkPermission;
