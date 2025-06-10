'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PurchaseItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PurchaseItem.belongsTo(models.Purchase, {
        foreignKey: 'invoice',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
      PurchaseItem.belongsTo(models.Good, {
        foreignKey: 'itemcode',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  PurchaseItem.init({
    invoice: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'Purchases',
        key: 'invoice'
      }
    },
    itemcode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'Goods',
        key: 'barcode'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    purchaseprice: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false
    },
    totalprice: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PurchaseItem',
  });
  return PurchaseItem;
};