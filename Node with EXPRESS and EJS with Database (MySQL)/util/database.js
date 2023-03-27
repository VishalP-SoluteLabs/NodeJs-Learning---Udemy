const Sequelize = require('sequelize');  //Capital 'S' because we are calling a constructor (name can be anyone though)

const sequelize = new Sequelize('node-complete', 'root', '123456', {
    dialect: 'mysql',     //'dialect' means data exchange language or type of sql engine that we are going to run
    host: 'localhost'
});


module.exports = sequelize;