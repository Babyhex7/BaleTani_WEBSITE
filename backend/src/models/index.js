const User = require("./user.model");
const Category = require("./category.model");
const Product = require("./product.model");

// Define associations
Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "products",
});

module.exports = {
  User,
  Category,
  Product,
};
