const Cart = require('./cart');

const db = require('../util/database.js')

module.exports = class Product {
  constructor(id, title, imgUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imgUrl = imgUrl;
    this.description = description;
    this.price = price;
  }

  save() {
      return db.execute('INSERT INTO products (title, price, description, imgUrl) values (?, ?, ?, ?)',   //'?' helps to prevent SQL Injection attack (i.e., no attack query would be inserted due to it.)
          [this.title, this.price, this.description, this.imgUrl]
      );
  }

  static deleteById(id) {

  }

  static fetchAll() {
    return db.execute('SELECT * FROM products')
  }

  static findById(id) {
    return db.execute('SELECT * FROM products where products.id=?',[id]);
  }
};
