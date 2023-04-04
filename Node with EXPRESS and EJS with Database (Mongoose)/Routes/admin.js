const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth.js');
const { body } =require('express-validator')
 
const router = express.Router();

// // /admin/add-product => GET
router.get('/add-product',isAuth, adminController.getAddProduct);

// // /admin/add-product => POST
router.post('/add-product',[
    body('title')
    .isString()
    .isLength({ min: 3 })
    .trim(),
    body('price')
    .isFloat(),  // This will validate to have compulsory decimal places in the price
    body('description')
    .isLength({ min: 5, max: 400 })
    .trim()
],isAuth, adminController.postAddProduct);

// // // /admin/products => GET
router.get('/products',isAuth, adminController.getProducts);

router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);

router.post('/edit-product',[
    body('title')
    .isString()
    .isLength({ min: 3 })
    .trim(),
    body('price')
    .isFloat(),  // This will validate to have compulsory decimal places in the price
    body('description')
    .isLength({ min: 5, max: 400 })
    .trim()
],isAuth, adminController.postEditProduct);

router.delete('/product/:productId',isAuth, adminController.deleteProduct)

module.exports = router;
