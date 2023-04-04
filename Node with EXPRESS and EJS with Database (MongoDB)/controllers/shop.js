const Product = require('../models/product.js');

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      console.log(products)
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop 🛒',
        path: '/',
      });
    })
    .catch(err => console.log(err));
}


exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch(err => console.log(err));;
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
    .catch(err => console.log(err))
}


exports.getCart = (req, res, next) => {

  req.user
    .getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })

    .catch(err => console.log(err));
};


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      console.log(product);
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
    .deleteItemFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};


exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .addOrder()
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};


exports.getOrders = (req, res, next) => {
  req.user
    .getOrders() //tell to return Orders value with including products 
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};