'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Good extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Good.belongsTo(models.Unit, {
        foreignKey: 'unit',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Good.hasMany(models.PurchaseItem, {
        foreignKey: 'itemcode',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })

    }
  }
  Good.init({
    barcode: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    purchaseprice: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false
    },
    sellingprice: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    picture: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Good',
  });
  return Good;
};