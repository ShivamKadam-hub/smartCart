const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const wishlistController = require('./wishlist.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', wishlistController.list);
router.post('/items', wishlistController.add);
router.delete('/items/:productId', wishlistController.remove);
router.delete('/', wishlistController.clear);

module.exports = router;
