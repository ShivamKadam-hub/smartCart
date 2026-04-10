const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');

function toIdString(value) {
  return String(value);
}

function buildCartView(cart, populated = false) {
  const items = cart.items.map((item) => {
    const product = populated ? item.product : null;
    return {
      id: item._id,
      productId: item.product,
      product: product
        ? {
            id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            stock: product.stock,
            category: product.category,
            brand: product.brand,
            imageUrl: product.imageUrl,
            tags: product.tags || [],
            rating: product.metadata?.rating ?? 0,
          }
        : undefined,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      selected: item.selected,
      addedAt: item.addedAt,
      lineTotal: Number((item.quantity * item.price).toFixed(2)),
    };
  });

  const savedForLater = cart.savedForLater.map((item) => {
    const product = populated ? item.product : null;
    return {
      id: item._id,
      productId: item.product,
      product: product
        ? {
            id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            stock: product.stock,
            category: product.category,
            brand: product.brand,
            imageUrl: product.imageUrl,
            tags: product.tags || [],
            rating: product.metadata?.rating ?? 0,
          }
        : undefined,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      savedAt: item.savedAt,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart._id,
    userId: cart.user,
    currency: cart.currency,
    items,
    savedForLater,
    summary: {
      itemCount,
      subtotal: Number(subtotal.toFixed(2)),
    },
  };
}

function scoreProduct(candidate, context) {
  let score = 0;
  const reasons = [];

  if (context.productIds.has(toIdString(candidate._id))) {
    return { score: -Infinity, reasons: [] };
  }

  if (context.categories.has(candidate.category)) {
    score += 4;
    reasons.push('same category');
  }

  if (candidate.brand && context.brands.has(candidate.brand)) {
    score += 3;
    reasons.push('same brand');
  }

  const sharedTags = (candidate.tags || []).filter((tag) => context.tags.has(tag));
  if (sharedTags.length > 0) {
    score += Math.min(sharedTags.length * 2, 6);
    reasons.push(`shared tags: ${sharedTags.slice(0, 3).join(', ')}`);
  }

  const compatible = (candidate.compatibleWith || []).some((id) => context.productIds.has(toIdString(id)));
  if (compatible) {
    score += 5;
    reasons.push('known compatible item');
  }

  if (candidate.stock > 0) {
    score += 1;
  }

  return { score, reasons };
}

async function buildRecommendations(cart) {
  const productIds = new Set();
  const categories = new Set();
  const brands = new Set();
  const tags = new Set();

  for (const item of [...cart.items, ...cart.savedForLater]) {
    if (!item.product) {
      continue;
    }

    productIds.add(toIdString(item.product._id));
    if (item.product.category) {
      categories.add(item.product.category);
    }
    if (item.product.brand) {
      brands.add(item.product.brand);
    }
    for (const tag of item.product.tags || []) {
      tags.add(tag);
    }
  }

  const candidates = await Product.find({
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ updatedAt: -1 })
    .lean();

  return candidates
    .map((candidate) => {
      const result = scoreProduct(candidate, {
        productIds,
        categories,
        brands,
        tags,
      });

      return {
        candidate,
        ...result,
      };
    })
    .filter((entry) => Number.isFinite(entry.score) && entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => ({
      id: entry.candidate._id,
      name: entry.candidate.name,
      slug: entry.candidate.slug,
      price: entry.candidate.price,
      imageUrl: entry.candidate.imageUrl,
      category: entry.candidate.category,
      brand: entry.candidate.brand,
      tags: entry.candidate.tags || [],
      rating: entry.candidate.metadata?.rating ?? 0,
      reasons: entry.reasons,
    }));
}

async function ensureCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId });
  }

  return cart;
}

async function loadPopulatedCart(userId) {
  const cart = await ensureCart(userId);
  await cart.populate('items.product');
  await cart.populate('savedForLater.product');
  return cart;
}

function findEmbeddedItem(collection, id) {
  return collection.find((item) => toIdString(item._id) === toIdString(id));
}

async function addItem(userId, payload) {
  const product = await Product.findOne({
    _id: payload.productId,
    isActive: true,
  });

  if (!product) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }

  if (product.stock < payload.quantity) {
    const error = new Error('Requested quantity is not available in stock.');
    error.statusCode = 400;
    throw error;
  }

  const cart = await ensureCart(userId);
  const existingItem = cart.items.find((item) => toIdString(item.product) === toIdString(product._id));

  if (existingItem) {
    const newQuantity = existingItem.quantity + payload.quantity;
    if (newQuantity > product.stock) {
      const error = new Error('Combined quantity exceeds available stock.');
      error.statusCode = 400;
      throw error;
    }

    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity: payload.quantity,
      name: product.name,
      price: product.price,
      sku: product.slug,
      selected: true,
    });
  }

  await cart.save();
  const populated = await loadPopulatedCart(userId);
  return buildCartView(populated, true);
}

async function updateItem(userId, itemId, payload) {
  const cart = await ensureCart(userId);
  const item = findEmbeddedItem(cart.items, itemId);

  if (!item) {
    const error = new Error('Cart item not found.');
    error.statusCode = 404;
    throw error;
  }

  const product = await Product.findById(item.product);
  if (!product || !product.isActive) {
    const error = new Error('The product for this cart item is unavailable.');
    error.statusCode = 400;
    throw error;
  }

  if (payload.quantity > product.stock) {
    const error = new Error('Requested quantity exceeds available stock.');
    error.statusCode = 400;
    throw error;
  }

  item.quantity = payload.quantity;
  item.name = product.name;
  item.price = product.price;
  item.sku = product.slug;

  await cart.save();
  const populated = await loadPopulatedCart(userId);
  return buildCartView(populated, true);
}

async function removeItem(userId, itemId) {
  const cart = await ensureCart(userId);
  const before = cart.items.length;
  cart.items = cart.items.filter((item) => toIdString(item._id) !== toIdString(itemId));

  if (cart.items.length === before) {
    const error = new Error('Cart item not found.');
    error.statusCode = 404;
    throw error;
  }

  await cart.save();
  const populated = await loadPopulatedCart(userId);
  return buildCartView(populated, true);
}

async function clearCart(userId) {
  const cart = await ensureCart(userId);
  cart.items = [];
  await cart.save();
  const populated = await loadPopulatedCart(userId);
  return buildCartView(populated, true);
}

async function saveForLater(userId, itemId) {
  const cart = await ensureCart(userId);
  const item = findEmbeddedItem(cart.items, itemId);

  if (!item) {
    const error = new Error('Cart item not found.');
    error.statusCode = 404;
    throw error;
  }

  cart.items = cart.items.filter((entry) => toIdString(entry._id) !== toIdString(itemId));

  const savedItem = cart.savedForLater.find((entry) => toIdString(entry.product) === toIdString(item.product));
  if (savedItem) {
    savedItem.quantity = item.quantity;
    savedItem.name = item.name;
    savedItem.price = item.price;
    savedItem.savedAt = new Date();
  } else {
    cart.savedForLater.push({
      product: item.product,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      savedAt: new Date(),
    });
  }

  await cart.save();
  const populated = await loadPopulatedCart(userId);
  return buildCartView(populated, true);
}

async function moveSavedItemToCart(userId, savedItemId) {
  const cart = await ensureCart(userId);
  const savedItem = findEmbeddedItem(cart.savedForLater, savedItemId);

  if (!savedItem) {
    const error = new Error('Saved item not found.');
    error.statusCode = 404;
    throw error;
  }

  const product = await Product.findById(savedItem.product);
  if (!product || !product.isActive) {
    const error = new Error('The saved product is unavailable.');
    error.statusCode = 400;
    throw error;
  }

  const cartItem = cart.items.find((item) => toIdString(item.product) === toIdString(savedItem.product));
  const requestedQuantity = savedItem.quantity + (cartItem ? cartItem.quantity : 0);

  if (requestedQuantity > product.stock) {
    const error = new Error('Requested quantity exceeds available stock.');
    error.statusCode = 400;
    throw error;
  }

  if (cartItem) {
    cartItem.quantity = requestedQuantity;
  } else {
    cart.items.push({
      product: savedItem.product,
      quantity: savedItem.quantity,
      name: product.name,
      price: product.price,
      sku: product.slug,
      selected: true,
    });
  }

  cart.savedForLater = cart.savedForLater.filter((entry) => toIdString(entry._id) !== toIdString(savedItemId));

  await cart.save();
  const populated = await loadPopulatedCart(userId);
  return buildCartView(populated, true);
}

async function removeSavedItem(userId, savedItemId) {
  const cart = await ensureCart(userId);
  const before = cart.savedForLater.length;
  cart.savedForLater = cart.savedForLater.filter((entry) => toIdString(entry._id) !== toIdString(savedItemId));

  if (cart.savedForLater.length === before) {
    const error = new Error('Saved item not found.');
    error.statusCode = 404;
    throw error;
  }

  await cart.save();
  const populated = await loadPopulatedCart(userId);
  return buildCartView(populated, true);
}

async function getCart(userId) {
  const cart = await loadPopulatedCart(userId);
  const cartView = buildCartView(cart, true);
  const recommendations = await buildRecommendations(cart);

  return {
    ...cartView,
    recommendations,
  };
}

module.exports = {
  addItem,
  clearCart,
  getCart,
  moveSavedItemToCart,
  removeItem,
  removeSavedItem,
  saveForLater,
  updateItem,
};
