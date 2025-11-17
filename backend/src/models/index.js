const Admin = require("./admin.model");
const Role = require("./role.model");
const Permission = require("./permission.model");
const RolePermission = require("./rolePermission.model");
const Customer = require("./customer.model");
const Category = require("./category.model");
const Product = require("./product.model");
const ProductImage = require("./productImage.model");
const Discount = require("./discount.model");
const ProductDiscount = require("./productDiscount.model");
const Procurement = require("./procurement.model");
const ProcurementItem = require("./procurementItem.model");
const Cart = require("./cart.model");
const Order = require("./order.model");
const OrderItem = require("./orderItem.model");
const OrderStatusHistory = require("./orderStatusHistory.model");
const PaymentDetail = require("./paymentDetail.model");
const StockMovement = require("./stockMovement.model");
const SoftDeleteLog = require("./softDeleteLog.model");
const FAQ = require("./faq.model");
const ContactMessage = require("./contactMessage.model");

// =============================
// ONE-TO-MANY RELATIONSHIPS
// =============================

// Role → Users (Admin)
Role.hasMany(Admin, {
  foreignKey: "role_id",
  as: "users",
});
Admin.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
});

// =============================
// MANY-TO-MANY: ROLE & PERMISSION
// =============================

// Role ← → Permission (melalui RolePermission)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "role_id",
  otherKey: "permission_id",
  as: "permissions",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permission_id",
  otherKey: "role_id",
  as: "roles",
});

// Relasi langsung untuk RolePermission
RolePermission.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
});

RolePermission.belongsTo(Permission, {
  foreignKey: "permission_id",
  as: "permission",
});

// =============================
// PRODUCT & CATEGORY
// =============================

// Category → Products
Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});
Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// Product → ProductImages
Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images",
});
ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// Product → ProcurementItems
Product.hasMany(ProcurementItem, {
  foreignKey: "product_id",
  as: "procurementItems",
});
ProcurementItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// Product → OrderItems
Product.hasMany(OrderItem, {
  foreignKey: "product_id",
  as: "orderItems",
});
OrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// Customer → Orders
Customer.hasMany(Order, {
  foreignKey: "customer_id",
  as: "orders",
});
Order.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});

// Order → OrderItems
Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "orderItems",
});
OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

// Order → OrderStatusHistory
Order.hasMany(OrderStatusHistory, {
  foreignKey: "order_id",
  as: "statusHistory",
});
OrderStatusHistory.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

// Order → PaymentDetail (One-to-One)
Order.hasOne(PaymentDetail, {
  foreignKey: "order_id",
  as: "payment",
});
PaymentDetail.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

// Admin → OrderStatusHistory
Admin.hasMany(OrderStatusHistory, {
  foreignKey: "changed_by",
  as: "statusChanges",
});
OrderStatusHistory.belongsTo(Admin, {
  foreignKey: "changed_by",
  as: "admin",
});

// Admin → Orders (processed_by, cancelled_by)
Admin.hasMany(Order, {
  foreignKey: "processed_by",
  as: "processedOrders",
});
Order.belongsTo(Admin, {
  foreignKey: "processed_by",
  as: "processor",
});

Admin.hasMany(Order, {
  foreignKey: "cancelled_by",
  as: "cancelledOrders",
});
Order.belongsTo(Admin, {
  foreignKey: "cancelled_by",
  as: "canceller",
});

// Procurement → ProcurementItems
Procurement.hasMany(ProcurementItem, {
  foreignKey: "procurement_id",
  as: "items",
});
ProcurementItem.belongsTo(Procurement, {
  foreignKey: "procurement_id",
  as: "procurement",
});

// User → Procurements (created_by, approved_by, rejected_by)
Admin.hasMany(Procurement, {
  foreignKey: "created_by",
  as: "createdProcurements",
});
Procurement.belongsTo(Admin, {
  foreignKey: "created_by",
  as: "creator",
});

Admin.hasMany(Procurement, {
  foreignKey: "approved_by",
  as: "approvedProcurements",
});
Procurement.belongsTo(Admin, {
  foreignKey: "approved_by",
  as: "approver",
});

Admin.hasMany(Procurement, {
  foreignKey: "rejected_by",
  as: "rejectedProcurements",
});
Procurement.belongsTo(Admin, {
  foreignKey: "rejected_by",
  as: "rejector",
});

// User → Orders (created_by, updated_by)
Admin.hasMany(Order, {
  foreignKey: "created_by",
  as: "createdOrders",
});
Order.belongsTo(Admin, {
  foreignKey: "created_by",
  as: "creator",
});

Admin.hasMany(Order, {
  foreignKey: "updated_by",
  as: "updatedOrders",
});
Order.belongsTo(Admin, {
  foreignKey: "updated_by",
  as: "updater",
});

// User → StockMovements (created_by)
Admin.hasMany(StockMovement, {
  foreignKey: "created_by",
  as: "stockMovements",
});
StockMovement.belongsTo(Admin, {
  foreignKey: "created_by",
  as: "creator",
});

// Product → StockMovements
Product.hasMany(StockMovement, {
  foreignKey: "product_id",
  as: "stockMovements",
});
StockMovement.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// =============================
// SOFT DELETE LOG RELATIONSHIPS
// =============================

// Procurement → SoftDeleteLog (One-to-One)
Procurement.hasOne(SoftDeleteLog, {
  foreignKey: "record_id",
  constraints: false,
  scope: {
    table_name: "procurements",
  },
  as: "softDeleteLog",
});

SoftDeleteLog.belongsTo(Procurement, {
  foreignKey: "record_id",
  constraints: false,
  as: "procurement",
});

// SoftDeleteLog → Admin (deleted_by)
SoftDeleteLog.belongsTo(Admin, {
  foreignKey: "deleted_by",
  as: "deleter",
});

Admin.hasMany(SoftDeleteLog, {
  foreignKey: "deleted_by",
  as: "deletedRecords",
});

// =============================
// MANY-TO-MANY RELATIONSHIPS
// =============================

// Product ↔ Discount via ProductDiscount
Product.belongsToMany(Discount, {
  through: ProductDiscount,
  foreignKey: "product_id",
  otherKey: "discount_id",
  as: "discounts",
});
Discount.belongsToMany(Product, {
  through: ProductDiscount,
  foreignKey: "discount_id",
  otherKey: "product_id",
  as: "products",
});

// Direct ProductDiscount relationships (for eager loading)
Product.hasMany(ProductDiscount, {
  foreignKey: "product_id",
  as: "productDiscounts",
});
ProductDiscount.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

ProductDiscount.belongsTo(Discount, {
  foreignKey: "discount_id",
  as: "discount",
});
Discount.hasMany(ProductDiscount, {
  foreignKey: "discount_id",
  as: "productDiscounts",
});

// =============================
// CART RELATIONSHIPS
// =============================

// Cart → Product (Each cart item references a product)
Cart.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
Product.hasMany(Cart, {
  foreignKey: "product_id",
  as: "cartItems",
});

// Cart → Customer (Each cart item belongs to a customer)
Cart.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});
Customer.hasMany(Cart, {
  foreignKey: "customer_id",
  as: "cartItems",
});

// =============================
// FAQ & CONTACT MESSAGE RELATIONSHIPS
// =============================

// FAQ → Admin (created_by & updated_by)
FAQ.belongsTo(Admin, {
  foreignKey: "created_by",
  as: "creator",
});
FAQ.belongsTo(Admin, {
  foreignKey: "updated_by",
  as: "updater",
});

// ContactMessage → Customer (optional, jika user login)
ContactMessage.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});
Customer.hasMany(ContactMessage, {
  foreignKey: "customer_id",
  as: "contactMessages",
});

// ContactMessage → Admin (replied_by)
ContactMessage.belongsTo(Admin, {
  foreignKey: "replied_by",
  as: "replier",
});
Admin.hasMany(ContactMessage, {
  foreignKey: "replied_by",
  as: "repliedMessages",
});

module.exports = {
  Admin,
  Role,
  Permission,
  RolePermission,
  Customer,
  Category,
  Product,
  ProductImage,
  Discount,
  ProductDiscount,
  Procurement,
  ProcurementItem,
  Cart,
  Order,
  OrderItem,
  OrderStatusHistory,
  PaymentDetail,
  StockMovement,
  SoftDeleteLog,
  FAQ,
  ContactMessage,
  // Legacy exports for backward compatibility
  User: Admin,
};
