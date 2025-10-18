const Admin = require("./admin.model");
const Role = require("./role.model");
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
const SoftDeleteLog = require("./softDeleteLog.model");
const StockMovement = require("./stockMovement.model");

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
  as: "rejecter",
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

// Customer ↔ Product via Cart
Customer.belongsToMany(Product, {
  through: Cart,
  foreignKey: "customer_id",
  otherKey: "product_id",
  as: "cartProducts",
});
Product.belongsToMany(Customer, {
  through: Cart,
  foreignKey: "product_id",
  otherKey: "customer_id",
  as: "cartCustomers",
});

// Direct Cart relationships
Cart.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});
Customer.hasMany(Cart, {
  foreignKey: "customer_id",
  as: "carts",
});

Cart.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
Product.hasMany(Cart, {
  foreignKey: "product_id",
  as: "carts",
});

// =============================
// SOFT DELETE LOGS
// =============================

// User → SoftDeleteLog (deleted_by)
Admin.hasMany(SoftDeleteLog, {
  foreignKey: "deleted_by",
  as: "deleteLogs",
});
SoftDeleteLog.belongsTo(Admin, {
  foreignKey: "deleted_by",
  as: "deleter",
});

module.exports = {
  Admin,
  Role,
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
  SoftDeleteLog,
  StockMovement,
  // Legacy exports for backward compatibility
  User: Admin,
};
