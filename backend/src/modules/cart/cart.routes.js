const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const cartController = require('./cart.controller');
const cartValidator = require('./cart.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/items', validateMiddleware({ body: cartValidator.addItemBody }), cartController.addItem);
router.patch(
  '/items/:itemId',
  validateMiddleware({
    params: cartValidator.itemIdParam,
    body: cartValidator.updateItemBody,
  }),
  cartController.updateItem
);
router.delete(
  '/items/:itemId',
  validateMiddleware({ params: cartValidator.itemIdParam }),
  cartController.removeItem
);
router.delete('/', cartController.clearCart);
router.post(
  '/items/:itemId/save-for-later',
  validateMiddleware({ params: cartValidator.itemIdParam }),
  cartController.saveForLater
);
router.post(
  '/save-for-later/:itemId',
  validateMiddleware({ params: cartValidator.itemIdParam }),
  cartController.saveForLater
);
router.post(
  '/saved-items/:savedItemId/move-to-cart',
  validateMiddleware({ params: cartValidator.savedItemIdParam }),
  cartController.moveSavedItemToCart
);

module.exports = router;
