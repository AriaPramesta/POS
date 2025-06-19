'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sales', {
      invoice: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(20)
      },
      time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      totalsum: {
        type: Sequelize.DECIMAL(19, 2)
      },
      pay: {
        type: Sequelize.DECIMAL(19, 2)
      },
      change: {
        type: Sequelize.DECIMAL(19, 2)
      },
      customer: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Customers',
          key: 'customerid'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      operator: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
    await queryInterface.dropTable('Sales');
  }
};