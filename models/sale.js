'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Sale.belongsTo(models.Customer, {
        foreignKey: 'customerid',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })

      Sale.belongsTo(models.User, {
        foreignKey: 'operator',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })

      Sale.hasMany(models.SaleItem, {
        foreignKey: 'invoice',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  Sale.init({
    invoice: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(20)
    },
    time: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()'),
    },
    totalsum: DataTypes.DECIMAL(19, 2),
    pay: DataTypes.DECIMAL(19, 2),
    change: DataTypes.DECIMAL(19, 2),
    customer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'customerid'
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
    modelName: 'Sale',
  });
  return Sale;
};