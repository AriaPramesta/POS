'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Purchase.hasMany(models.PurchaseItem, {
        foreignKey: 'invoice',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
      Purchase.belongsTo(models.Supplier, {
        foreignKey: 'supplier',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
      Purchase.belongsTo(models.User, {
        foreignKey: 'operator',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }

  Purchase.init({
    invoice: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(20)
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    totalsum: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false
    },
    supplier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Suppliers',
        key: 'supplierid'
      }
    },
    operator: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Purchase',
  });
  return Purchase;
};