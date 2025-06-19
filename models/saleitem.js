'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SaleItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SaleItem.belongsTo(models.Sale, {
        foreignKey: 'invoice',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })

      SaleItem.belongsTo(models.Good, {
        foreignKey: 'itemcode',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  SaleItem.init({
    invoice: {
      type: DataTypes.STRING(20),
      references: {
        model: 'Sales',
        key: 'invoice'
      }
    },
    itemcode: {
      type: DataTypes.STRING(20),
      references: {
        model: 'Goods',
        key: 'barcode'
      }
    },
    quantity: DataTypes.INTEGER,
    sellingprice: DataTypes.DECIMAL(19, 2),
    totalprice: DataTypes.DECIMAL(19, 2)
  }, {
    sequelize,
    modelName: 'SaleItem',
  });
  return SaleItem;
};