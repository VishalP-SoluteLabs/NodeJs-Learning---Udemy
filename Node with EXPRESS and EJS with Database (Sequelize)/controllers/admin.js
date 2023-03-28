const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imgUrl = req.body.imgUrl;
  const price = req.body.price;
  const description = req.body.description;
   req.user                                //This functions makes a joint relation 
   .createProduct({                       // b/w user and product table
    title: title,
    price: price,
    imgUrl: imgUrl,
    description: description
   })
   .then(result =>{
    //console.log(result);
    console.log("Product Added");
    res.redirect('/admin/products')
   })
   .catch(err => console.log(err))
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user
   .getProducts({where: {id: prodId}
    })
  // Product.findByPk(prodId)
   .then(products => {
     const product = products[0];
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  })
   .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedimgUrl = req.body.imgUrl;
  const updatedDesc = req.body.description;
  Product.findByPk(prodId)
   .then(product =>{
     product.title = updatedTitle;
     product.price = updatedPrice;
     product.imgUrl = updatedimgUrl;
     product.description = updatedDesc;
     return product.save();                    // returned so as we can write another .then() after this .then() block. 
   })
   .then(result => {
    console.log("UPDATED Product: " + updatedTitle);
    res.redirect('/admin/products')
   })
   .catch(err => console.log(err));

   
  
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then(products => {
    res.render('admin/admin-products', {
      product: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err => console.log(err));
};


exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
  .then(product =>{
      return product.destroy();
  })
  .then(result =>{
    console.log('DELETED: ' + result.dataValues.title + ' Successfully!!');  //'result.dataValues.title' got by first printing 'result' in console.
    res.redirect('/admin/products');
  })
  .catch(err => console.log(err))
  
  
};