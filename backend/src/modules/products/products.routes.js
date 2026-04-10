const express = require('express');

const productsController = require('./products.controller');

const router = express.Router();

router.get('/', productsController.listProducts);
router.get('/:slug', productsController.getProductBySlug);

module.exports = router;
