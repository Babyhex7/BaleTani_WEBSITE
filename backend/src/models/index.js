const User = require("./user.model");
const Category = require("./category.model");
const Product = require("./product.model");
const Order = require("./order.model");

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

module.exports = {
  User,
  Category,
  Product,
  Order,
};
