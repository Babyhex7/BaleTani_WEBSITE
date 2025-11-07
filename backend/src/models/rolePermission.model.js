/**
 * ROLE PERMISSION MODEL
 * Model untuk relasi Many-to-Many antara Role dan Permission
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const RolePermission = sequelize.define(
  "RolePermission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID role dari tabel roles",
      references: {
        model: "roles",
        key: "id",
      },
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID permission dari tabel permissions",
      references: {
        model: "permissions",
        key: "id",
      },
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
    tableName: "role_permissions",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["role_id", "permission_id"],
        name: "unique_role_permission",
      },
    ],
  }
);

module.exports = RolePermission;
