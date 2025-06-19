'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SaleItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoice: {
        type: Sequelize.STRING(20),
        references: {
          model: 'Sales',
          key: 'invoice'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      itemcode: {
        type: Sequelize.STRING(20),
        references: {
          model: 'Goods',
          key: 'barcode'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      sellingprice: {
        type: Sequelize.DECIMAL(19, 2)
      },
      totalprice: {
        type: Sequelize.DECIMAL(19, 2)
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
    await queryInterface.dropTable('SaleItems');
  }
};