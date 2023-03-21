const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();
const adminData = require('./admin.js');

router.get('/', (req, res, next) => {
 const products = adminData.products;
 res.render('shop', {prods: products, pageTitle: 'Shop 🛒', path: '/'});   //res.render is used by templating engine to render templating files
});

module.exports = router;
