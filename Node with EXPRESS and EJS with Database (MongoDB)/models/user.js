const getDb = require('../util/database.js').getDb;
const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; //{items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString() //'.toString()' so as to convert them to same type i.e., to string
    })

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity
      })
    }

    const updatedCart = {
      items: updatedCartItems
    };
    const db = getDb();
    return db.collection('users').updateOne({
      _id: new mongodb.ObjectId(this._id)
    }, {
      $set: {
        cart: updatedCart
      }
    });
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(i => {
      return i.productId;
    })
    return db.collection('products')
      .find({
        _id: {
          $in: productIds
        }
      }).toArray() //'$in' returns all the item (for here: productId) from the array of that item.
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(i => { //for matching the product id we want
              return i.productId.toString() === p._id.toString(); //....
            }).quantity // then after finding the roght product, we would fetch its quantity
          }
        });
      })
      .catch(err => console.log(err))
  }


  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString(); //Because I don't want that particular item so ignoring that item in filter function
    })
    const db = getDb();
    return db.collection('users').updateOne({
      _id: new mongodb.ObjectId(this._id)
    }, {
      $set: {
        cart: {
          items: updatedCartItems
        }
      }
    });
  }


  addOrder() {
    const db = getDb();
    return this.getCart()
    .then(products => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name
          }
        }
        return db.collection('orders').insertOne(order)
      })
      .then(result => {
        this.cart = {
          items: []
        };
        return db.collection('users').updateOne({
          _id: new ObjectId(this._id)
        }, {
          $set: {
            cart: {
              items: []
            }
          }
        });
      })
      .catch(err => console.log(err))
  }



  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .toArray();
  }




  static findById(userId) {
    const db = getDb();
    return db.collection('users')
      .findOne({
        _id: new mongodb.ObjectId(userId)
      })
      .then(user => {
        //console.log(user);
        return user;
      })
      .catch(err => console.log(err))
  }
}


module.exports = User;