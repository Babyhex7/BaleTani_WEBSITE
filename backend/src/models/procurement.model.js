const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Procurement = sequelize.define(
  "Procurement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    procurement_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    procurement_type: {
      type: DataTypes.ENUM("online", "offline"),
      allowNull: false,
      defaultValue: "online"
    },
    supplier_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    procurement_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending"
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejected_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    rejected_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_by: {
      type: DataTypes.UUID,
      allowNull: true
    }
    },
  {
    tableName: "procurements",
    timestamps: false,
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
);

module.exports = Procurement;
