const Product = require('../../models/product.model');
const {
  callMlChat,
  callMlRecommend,
  mapCurrentItemToMlId,
  mapMlItemToBackendProduct,
  serializeProduct,
} = require('../../utils/ml-bridge');

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

function normalizeInputItem(item) {
  return {
    name: String(item?.name || ''),
    description: String(item?.description || ''),
    label: String(item?.label || item?.category || ''),
    category: String(item?.category || item?.label || ''),
    brand: String(item?.brand || ''),
    price: Number(item?.price || 0),
    backendProductId: item?.backendProductId ? String(item.backendProductId) : '',
  };
}

function mapBackendRecommendations(recommendedItems, backendProducts, text, topK) {
  const mapped = [];
  const usedIds = new Set();

  for (const item of recommendedItems) {
    const backendProduct = mapMlItemToBackendProduct(item, backendProducts, text);
    if (!backendProduct) {
      continue;
    }

    const productId = String(backendProduct._id);
    if (usedIds.has(productId)) {
      continue;
    }

    usedIds.add(productId);
    mapped.push({
      ...serializeProduct(backendProduct),
      metadata: {
        ...(backendProduct.metadata || {}),
        mlProductId: item.product_id,
        mlScore: item.final_score ?? item.semantic_score ?? 0,
        mlCategory: item.category,
        mlStyle: item.style,
        mlBrand: item.brand,
      },
    });

    if (mapped.length >= topK) {
      break;
    }
  }

  return mapped;
}

const recommendations = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const inputItems = Array.isArray(body.cartItems) ? body.cartItems : [];
  const text = String(body.text || '').trim();
  const topK = Math.max(1, Math.min(Number(body.topK || 6), 12));

  const backendProducts = await Product.find({ isActive: true }).lean();
  const backendById = new Map(backendProducts.map((product) => [String(product._id), product]));

  const cartItems = inputItems
    .map((item) => normalizeInputItem(item))
    .filter((item) => item.name || item.description || item.label || item.category);

  const mappedCartItems = cartItems
    .map((item) => {
      const backendProduct =
        item.backendProductId && backendById.has(String(item.backendProductId))
          ? backendById.get(String(item.backendProductId))
          : null;
      return mapCurrentItemToMlId(item, backendProduct);
    })
    .filter(Boolean);

  let mlResponse;
  try {
    mlResponse = await callMlRecommend({
      cart_items: mappedCartItems,
      text,
      top_k: topK,
    });
  } catch (error) {
    const fallback = backendProducts.slice(0, topK).map((product) => serializeProduct(product));
    return respond(
      res,
      200,
      'ML recommendations unavailable, returned fallback products.',
      fallback
    );
  }

  const recommendedItems = Array.isArray(mlResponse.items) ? mlResponse.items : [];
  const mapped = mapBackendRecommendations(recommendedItems, backendProducts, text, topK);

  if (!mapped.length) {
    for (const product of backendProducts) {
      mapped.push(serializeProduct(product));
      if (mapped.length >= topK) {
        break;
      }
    }
  }

  return respond(res, 200, 'ML recommendations fetched successfully.', mapped);
});

const chat = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const inputItems = Array.isArray(body.cartItems) ? body.cartItems : [];
  const text = String(body.text || '').trim();
  const topK = Math.max(1, Math.min(Number(body.topK || 4), 8));

  const backendProducts = await Product.find({ isActive: true }).lean();
  const backendById = new Map(backendProducts.map((product) => [String(product._id), product]));

  const cartItems = inputItems
    .map((item) => normalizeInputItem(item))
    .filter((item) => item.name || item.description || item.label || item.category);

  const mappedCartItems = cartItems
    .map((item) => {
      const backendProduct =
        item.backendProductId && backendById.has(String(item.backendProductId))
          ? backendById.get(String(item.backendProductId))
          : null;
      return mapCurrentItemToMlId(item, backendProduct);
    })
    .filter(Boolean);

  try {
    const mlResponse = await callMlChat({
      cart_items: mappedCartItems,
      text,
      top_k: topK,
    });

    const recommendedItems = Array.isArray(mlResponse.items) ? mlResponse.items : [];
    const mapped = mapBackendRecommendations(recommendedItems, backendProducts, text, topK);

    return res.status(200).json({
      message: 'ML chat response fetched successfully.',
      data: {
        reply:
          typeof mlResponse.reply === 'string' && mlResponse.reply.trim()
            ? mlResponse.reply.trim()
            : 'Here are a few strong matches for your current shopping context.',
        items: mapped,
        intent: mlResponse.intent || null,
      },
    });
  } catch (error) {
    const fallback = backendProducts.slice(0, topK).map((product) => serializeProduct(product));
    return res.status(200).json({
      message: 'ML chat unavailable, returned fallback guidance.',
      data: {
        reply:
          'I can still help with a few curated picks. Start with these and refine your request if you want something more specific.',
        items: fallback,
        intent: null,
      },
    });
  }
});

module.exports = {
  chat,
  recommendations,
};
