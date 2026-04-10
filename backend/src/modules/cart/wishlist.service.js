const mongoose = require('mongoose');

const User = require('../../models/user.model');
const Product = require('../../models/product.model');

function asyncError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function serializeProduct(product) {
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    category: product.category,
    tags: product.tags || [],
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    imageUrl: product.imageUrl,
    rating: product.metadata?.rating ?? 0,
    metadata: product.metadata || {},
  };
}

async function getWishlist(userId) {
  const user = await User.findById(userId).populate('wishlist');
  if (!user || !user.isActive) {
    throw asyncError('User not found.', 404);
  }

  const items = (user.wishlist || []).filter(Boolean).map((product) => serializeProduct(product));

  return {
    id: user._id,
    userId: user._id,
    items,
    summary: {
      itemCount: items.length,
    },
  };
}

async function addWishlistItem(userId, payload) {
  const productId = String(payload.productId || '').trim();
  if (!productId) {
    throw asyncError('Product id is required.', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw asyncError('Invalid product id.', 400);
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw asyncError('Product not found.', 404);
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw asyncError('User not found.', 404);
  }

  const alreadySaved = (user.wishlist || []).some((item) => String(item) === String(product._id));
  if (!alreadySaved) {
    user.wishlist = [...(user.wishlist || []), product._id];
    await user.save();
  }

  return getWishlist(userId);
}

async function removeWishlistItem(userId, productId) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw asyncError('Invalid product id.', 400);
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw asyncError('User not found.', 404);
  }

  user.wishlist = (user.wishlist || []).filter((item) => String(item) !== String(productId));
  await user.save();

  return getWishlist(userId);
}

async function clearWishlist(userId) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw asyncError('User not found.', 404);
  }

  user.wishlist = [];
  await user.save();

  return getWishlist(userId);
}

module.exports = {
  addWishlistItem,
  clearWishlist,
  getWishlist,
  removeWishlistItem,
};
