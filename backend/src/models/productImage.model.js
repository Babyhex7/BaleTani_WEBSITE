const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
    },
  {
    tableName: "product_images",
    timestamps: false,
    paranoid: false,
    underscored: true
  }
);

module.exports = ProductImage;
