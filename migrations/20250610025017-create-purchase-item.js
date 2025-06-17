'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PurchaseItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoice: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: {
          model: 'Purchases',
          key: 'invoice'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      itemcode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        references: {
          model: 'Goods',
          key: 'barcode'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      purchaseprice: {
        type: Sequelize.DECIMAL(19, 2),
        allowNull: false
      },
      totalprice: {
        type: Sequelize.DECIMAL(19, 2),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PurchaseItems');
  }
};