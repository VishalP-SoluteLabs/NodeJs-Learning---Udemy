const path = require('path');

const express = require('express');

const router = express.Router();
const shopController = require('../controllers/shop.js');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProductDetails);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct)

router.get('/orders', shopController.getOrders);

router.get('/checkout');

module.exports = router;
