const path = require('path');

const express = require('express');

const router = express.Router();
const shopController = require('../controllers/shop.js');
const isAuth = require('../middleware/is-auth.js');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProductDetails);

router.get('/cart',isAuth, shopController.getCart);

router.post('/cart',isAuth, shopController.postCart);

router.post('/cart-delete-item',isAuth, shopController.postCartDeleteProduct);

router.get('/checkout' ,isAuth, shopController.getCheckout);

router.get('/checkout/success',isAuth, shopController.getCheckoutSuccess);

router.get('/checkout/cancel',isAuth, shopController.getCheckout);

// router.post('/create-order',isAuth, shopController.postOrder);

router.get('/orders',isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);


module.exports = router;
