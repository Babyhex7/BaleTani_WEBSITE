const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SoftDeleteLog = sequelize.define(
  "SoftDeleteLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    record_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    deleted_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    deleted_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "soft_delete_logs",
    timestamps: false,
    underscored: true,
  }
);

module.exports = SoftDeleteLog;
