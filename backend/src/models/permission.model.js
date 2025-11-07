/**
 * PERMISSION MODEL
 * Model untuk mengelola permission/hak akses di sistem
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Permission = sequelize.define(
  "Permission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Module/fitur sistem (products, orders, dll)",
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Aksi yang bisa dilakukan (view, create, update, delete)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Deskripsi permission",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "permissions",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["module", "action"],
        name: "unique_permission",
      },
    ],
  }
);

module.exports = Permission;
