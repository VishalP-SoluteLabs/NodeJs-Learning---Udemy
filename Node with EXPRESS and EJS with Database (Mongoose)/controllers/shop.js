const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit')

const Product = require('../models/product.js');
const Order = require('../models/order.js');

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()         //returns a number
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop 🛒',
        path: '/',
        totalProducts: totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE) 
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}


exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()         //returns a number
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        totalProducts: totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE) 
      });
    })

    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}


exports.getProductDetails = (req, res, next) => {

  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title + ' Details',
        path: '/products' //It is for highlighting the path we want to be active

      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}


exports.getCart = (req, res, next) => {

  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      //console.log(product);
      return req.user.addToCart(product);
    }).then(result => {
      //console.log(result);
      res.redirect('/cart')
    })
    .catch(err => console.log(err));
  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({
  //       where: {
  //         id: prodId
  //       }
  //     });
  //   })
  //   .then(products => {
  //     let product;
  //     if (products.length) {
  //       product = products[0];
  //     }
  //     if (product) { //Checking if there is an existing same product in the cart and updating its quantity.
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //     }

  //     return Product.findByPk(prodId);

  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, {
  //       through: {
  //         quantity: newQuantity
  //       } //Setting additional information for the in-between tables (associated tables)
  //     })
  //   })
  //   .then(() => {
  //     res.redirect('/cart');
  //   })
  //   .catch(err => console.log(err))
};


exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getOrders = (req, res, next) => {
  Order.find({
      'user.userId': req.user._id
    })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: {
            ...i.productId._doc //_doc helps to access to all data bind with the productId, and spread operator helps to pass the whole data at once
          }
        }
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.!'))
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res); //to return it to client

      pdfDoc.fontSize(28).text('Invoice', {
        underline: true
      });

      pdfDoc.text('----------------------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += (prod.quantity * prod.product.price);
        pdfDoc.fontSize(14).text('-> ' + prod.product.title + ' - ' + prod.quantity + ' * ' + 'Rs.' + prod.product.price);
      })

      pdfDoc.text('--------------------');
      pdfDoc.fontSize(20).text('Total Cost: Rs.' + totalPrice)

      pdfDoc.end()

      // fs.readFile(invoicePath, (err, data) => {   //while reading a file, node will first download it in memory and read the file as wholw, which can 
      // take space and time for larger file, so we will create stream instead
      //   if(err){
      //     next(err); 
      //   }
      //   res.setHeader('Content-Type', 'application/pdf')
      //   res.setHeader("Content-disposition", 'attachment; filename="' + invoiceName + '"');
      //   res.send(data);
      // })
      // const file = fs.createReadStream(invoicePath);

      //    file.pipe(res)  //to forward my readed stream to response(res) //it pipes readable stream to writable

    })
    .catch(err => next(err))
}