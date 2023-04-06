const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',                     //giving reference to User Model that we want to associate with products
    required: true
  } 
});


module.exports = mongoose.model('Product', productSchema);  // 'mongoose.model('model name', schema that we created);'






// const mongoConnect = require('../util/database.js').mongoConnect;
// const getDb = require('../util/database.js').getDb;
// const mongodb = require('mongodb');
// const ObjectId = mongodb.ObjectId;

// class Product {
//   constructor(title, imgUrl, price, description, id, userId) {
//     this.title = title;
//     this.imgUrl = imgUrl;
//     this.price = price;
//     this.description = description;
//     this._id = id ? new ObjectId(id) : null; //checking if there is any id found or not, if not found, set it to null
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       //Update the product if there is a product already
//       dbOp = db.collection('products').updateOne({
//         _id: (this._id)
//       }, {
//         $set: this
//       }); //'$set' tells what should be taken as replacement
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return db.collection('products') //'products' is the collection that we want to have
//       .insertOne(this) //'this' refers to the current product
//       .then(result => {
//         //console.log(result)
//       })
//       .catch(err => console.log(err));
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db.collection('products')
//       .find()
//       .toArray() //To convert data into array (Don't use for larger data, instead use pagination (later in course))
//       .then(products => {
//         // console.log(products);
//         return products;
//       })
//       .catch(err => console.log(err));
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db.collection('products')
//       .find({
//         _id: new ObjectId(prodId)
//       }) //new because it is a constructor
//       .next() //it it chain-able you can use next to sort through the returned "cursor" which lets you use next to systemically sort  (also .next() is requires here but not required in .findOne())
//       // through the items in the db one at a time using the .next() chain-able function. 
//       .then(product => {
//         //console.log(product);
//         return product;
//       })
//       .catch(err => console.log(err))
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .deleteOne({
//         _id: new ObjectId(prodId)
//       })
//       .then(result => {
//         return db
//           .collection('users')
//           .updateMany({}, {         //deleting that product from all users existing
//             $pull: {               //'$pull' removes from an existing array all instances of a value or values that match a specified condition.
//               'cart.items': {
//                 productId: new ObjectId(prodId)
//               },
//             },
//           })

//       })
//       .then(result => {
//         console.log('Item Deleted Successfully!');
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

// }







// module.exports = Product