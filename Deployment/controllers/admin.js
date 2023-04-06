const Product = require('../models/product.js');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const fileHelper = require('../util/file.js');

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login')              //300 status code (because of redirect())  
  }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
 // console.log(image)
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imgUrl: imgUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }
  console.log('AAAAAAAAAAAAAAAAAAAAAa',req.user)
  const imgUrl = image.path;

  const product = new Product({
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    title: title,
    price: price,
    description: description,
    imgUrl: imgUrl,
    userId: req.user
  });
console.log("BBBBBBBBBBBBBBBBBBBBB") 
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');            //300 status code (because of redirect())
  }
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => { 
      // res.redirect('/500')
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);  //It will go to error handling middleware, the middleware that have 4 arguments in app.js
    })
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
 
  if (!errors.isEmpty()) {
   
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }


  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(image){
        fileHelper.deleteFile(product.imgUrl)
        product.imgUrl = image.path;
      }

      return product.save()
        .then(result => {
          console.log("UPDATED Product: " + updatedTitle);
          res.redirect('/admin/products')           //300 status code (because of redirect())
        })
    })

    .catch(err => { 
      // res.redirect('/500')
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);  //It will go to error handling middleware, the middleware that have 4 arguments in app.js
    })

};

exports.getProducts = (req, res, next) => {
  Product.find({
    userId: req.user
  })
    // .select('title price -_id')      //it helps us to show only selected items and after '-' whatever is written, it is excluded or neglected 
    // .populate('userId')             // helps to populate a field e.g., 'userId' here, with all info it has in its collection with
    .then(products => {
      res.render('admin/admin-products', {
        product: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => { 
      // res.redirect('/500')
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);  //It will go to error handling middleware, the middleware that have 4 arguments in app.js
    })
};


exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;   //req.body will not work, because we are not getting values from a form by submitting, but just doing actions on the same page
  Product.findById(prodId)
  .then(product => {
    if(!product){
      return next(new Error('Product not found!'))
    }
     fileHelper.deleteFile(product.imgUrl)
     return Product.deleteOne({
      _id: prodId,
      userId: req.user._id
    })
  })
    .then(() => {
      console.log('Product Deleted Successfully!!')
      res.status(200).json({ message: 'Success!' })
    })
    .catch(err => { 
      res.status(500).json({ message: 'Deleting Product failed!' })
    })
};