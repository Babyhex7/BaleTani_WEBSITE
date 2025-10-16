const Admin = require("./admin.model");
const Role = require("./role.model");
const Customer = require("./customer.model");
const Category = require("./category.model");
const Product = require("./product.model");
// const Order = require("./order.model"); // Temporarily disabled

// Define associations
// Role and Admin relationship
Role.hasMany(Admin, {
  foreignKey: "role_id",
  as: "admins",
});

Admin.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
});

// Product and Category relationship
Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});

module.exports = {
  Admin,
  Role,
  Customer,
  Category,
  Product,
  // Order, // Temporarily disabled
};
