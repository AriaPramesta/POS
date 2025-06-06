'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Goods', {
      barcode: {
        type: Sequelize.STRING(20),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      purchaseprice: {
        type: Sequelize.DECIMAL(19, 2),
        allowNull: false
      },
      sellingprice: {
        type: Sequelize.DECIMAL(19, 2),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: 'Units',
          key: 'unit'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      picture: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Goods');
  }
};
