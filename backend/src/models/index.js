const User = require("./user.model");
const Category = require("./category.model");
const Product = require("./product.model");
const Order = require("./order.model");
const Procurement = require("./procurement.model");
const ProcurementItem = require("./procurementItem.model");
const StockMovement = require("./stockMovement.model");

// Define associations
Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});

// User associations
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });

// Procurement associations
Procurement.belongsTo(User, { foreignKey: "created_by", as: "creator" });
Procurement.belongsTo(User, { foreignKey: "approved_by", as: "approver" });
Procurement.belongsTo(User, { foreignKey: "rejected_by", as: "rejecter" });

Procurement.hasMany(ProcurementItem, {
  foreignKey: "procurement_id",
  as: "items",
});
ProcurementItem.belongsTo(Procurement, {
  foreignKey: "procurement_id",
  as: "procurement",
});

ProcurementItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
Product.hasMany(ProcurementItem, {
  foreignKey: "product_id",
  as: "procurementItems",
});

// Stock Movement associations
StockMovement.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
StockMovement.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});
Product.hasMany(StockMovement, {
  foreignKey: "product_id",
  as: "stockMovements",
});

module.exports = {
  User,
  Category,
  Product,
  Order,
  Procurement,
  ProcurementItem,
  StockMovement,
};
