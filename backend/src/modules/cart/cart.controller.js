const cartService = require('./cart.service');

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function handleError(res, error) {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message || 'Something went wrong.',
  });
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  return res.status(200).json({
    message: 'Cart fetched successfully.',
    data: cart,
  });
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);
  return res.status(201).json({
    message: 'Item added to cart.',
    data: cart,
  });
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.id, req.params.itemId, req.body);
  return res.status(200).json({
    message: 'Cart item updated.',
    data: cart,
  });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.itemId);
  return res.status(200).json({
    message: 'Cart item removed.',
    data: cart,
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  return res.status(200).json({
    message: 'Cart cleared.',
    data: cart,
  });
});

const saveForLater = asyncHandler(async (req, res) => {
  const cart = await cartService.saveForLater(req.user.id, req.params.itemId);
  return res.status(200).json({
    message: 'Item moved to saved for later.',
    data: cart,
  });
});

const moveSavedItemToCart = asyncHandler(async (req, res) => {
  const cart = await cartService.moveSavedItemToCart(req.user.id, req.params.savedItemId);
  return res.status(200).json({
    message: 'Saved item moved to cart.',
    data: cart,
  });
});

const removeSavedItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeSavedItem(req.user.id, req.params.savedItemId);
  return res.status(200).json({
    message: 'Saved item removed.',
    data: cart,
  });
});

function errorHandler(error, req, res, next) {
  return handleError(res, error);
}

module.exports = {
  addItem,
  clearCart,
  errorHandler,
  getCart,
  moveSavedItemToCart,
  removeItem,
  removeSavedItem,
  saveForLater,
  updateItem,
};
