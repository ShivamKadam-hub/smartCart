const wishlistService = require('./wishlist.service');

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function respond(res, statusCode, message, data) {
  return res.status(statusCode).json({
    message,
    data,
  });
}

const list = asyncHandler(async (req, res) => {
  const result = await wishlistService.getWishlist(req.user.id);
  return respond(res, 200, 'Wishlist fetched successfully.', result);
});

const add = asyncHandler(async (req, res) => {
  const result = await wishlistService.addWishlistItem(req.user.id, req.body);
  return respond(res, 200, 'Wishlist item added successfully.', result);
});

const remove = asyncHandler(async (req, res) => {
  const result = await wishlistService.removeWishlistItem(req.user.id, req.params.productId);
  return respond(res, 200, 'Wishlist item removed successfully.', result);
});

const clear = asyncHandler(async (req, res) => {
  const result = await wishlistService.clearWishlist(req.user.id);
  return respond(res, 200, 'Wishlist cleared successfully.', result);
});

module.exports = {
  add,
  clear,
  list,
  remove,
};
