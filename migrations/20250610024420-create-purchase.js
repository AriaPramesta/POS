'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Purchases', {
      invoice: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(20)
      },
      time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      totalsum: {
        type: Sequelize.DECIMAL(19, 2),
        allowNull: false
      },
      supplier: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Suppliers',
          key: 'supplierid'
        }
      },
      operator: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
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
    await queryInterface.dropTable('Purchases');
  }
};