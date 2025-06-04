'use strict';
const {
  Model
} = require('sequelize');
const { generatePassword } = require('../helper/util');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: DataTypes.STRING,
    password: { type: DataTypes.STRING, allowNull: false },
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: (user, options) => {
        user.password = generatePassword(user.password)
      },
    }
  });
  return User;
};