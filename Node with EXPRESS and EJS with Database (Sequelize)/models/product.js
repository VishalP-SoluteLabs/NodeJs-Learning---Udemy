const Sequelize = require('sequelize');

const sequelize = require('../util/database.js');

const Product = sequelize.define('product', {   //first model name and after '{' all attributes of the model are defined
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },

  title: Sequelize.STRING,
  
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },

  imgUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Product;
