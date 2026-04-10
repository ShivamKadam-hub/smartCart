const fs = require('fs');
const path = require('path');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5051';
const ML_CATALOG_PATH =
  process.env.ML_CATALOG_PATH ||
  path.resolve(__dirname, '../../../CapstoneCreators/products.json');

let mlCatalogCache = null;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(...parts) {
  return new Set(
    parts
      .filter(Boolean)
      .flatMap((part) => normalizeText(part).split(/\s+/).filter(Boolean))
  );
}

function overlapScore(sourceParts, targetParts) {
  const source = tokenize(...sourceParts);
  const target = tokenize(...targetParts);

  if (source.size === 0 || target.size === 0) {
    return 0;
  }

  let matches = 0;
  for (const token of source) {
    if (target.has(token)) {
      matches += 1;
    }
  }

  return matches / Math.max(source.size, target.size, 1);
}

function loadMlCatalog() {
  if (mlCatalogCache) {
    return mlCatalogCache;
  }

  const raw = fs.readFileSync(ML_CATALOG_PATH, 'utf8');
  const catalog = JSON.parse(raw);
  mlCatalogCache = catalog.map((item) => ({
    ...item,
    product_id: String(item.product_id),
    price: Number(item.price) || 0,
  }));

  return mlCatalogCache;
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

function scoreBackendProductAgainstMlItem(product, mlItem) {
  const scoreParts = [
    overlapScore(
      [product.name, product.description, product.category, product.brand, ...(product.tags || [])],
      [mlItem.category, mlItem.style, mlItem.brand, mlItem.description]
    ),
  ];

  if (normalizeText(product.category) === normalizeText(mlItem.category)) {
    scoreParts.push(1.5);
  }

  if (normalizeText(product.brand) === normalizeText(mlItem.brand)) {
    scoreParts.push(1.0);
  }

  const productTokens = tokenize(product.name, product.description, ...(product.tags || []));
  const mlTokens = tokenize(mlItem.category, mlItem.style, mlItem.brand, mlItem.description);
  let tokenOverlap = 0;
  for (const token of productTokens) {
    if (mlTokens.has(token)) {
      tokenOverlap += 1;
    }
  }
  scoreParts.push(tokenOverlap * 0.25);

  return scoreParts.reduce((sum, value) => sum + value, 0);
}

function scoreBackendProductAgainstQuery(product, queryText) {
  return overlapScore(
    [product.name, product.description, product.category, product.brand, ...(product.tags || [])],
    [queryText]
  );
}

function scoreCartItemAgainstMlItem(cartItem, mlItem) {
  const sourceParts = [
    cartItem.name,
    cartItem.description,
    cartItem.label,
    cartItem.category,
    cartItem.brand,
  ];
  const targetParts = [mlItem.category, mlItem.style, mlItem.brand, mlItem.description];
  let score = overlapScore(sourceParts, targetParts);

  if (normalizeText(cartItem.label) === normalizeText(mlItem.category)) {
    score += 1;
  }
  if (normalizeText(cartItem.brand) === normalizeText(mlItem.brand)) {
    score += 1;
  }

  return score;
}

function mapCurrentItemToMlId(item, backendProduct) {
  const catalog = loadMlCatalog();
  if (catalog.length === 0) {
    return null;
  }

  const source = backendProduct
    ? {
        name: backendProduct.name,
        description: backendProduct.description,
        label: backendProduct.category,
        category: backendProduct.category,
        brand: backendProduct.brand,
        price: backendProduct.price,
      }
    : item;

  let best = catalog[0];
  let bestScore = -Infinity;

  for (const candidate of catalog) {
    let score = scoreCartItemAgainstMlItem(source, candidate);

    if (source.price && candidate.price) {
      const relativeGap =
        Math.abs(Number(source.price) - candidate.price) / Math.max(candidate.price, 1);
      score += Math.max(0, 1 - Math.min(relativeGap, 1));
    }

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best?.product_id || null;
}

function mapMlItemToBackendProduct(mlItem, backendProducts, cartQueryText = '') {
  let bestProduct = null;
  let bestScore = -Infinity;

  for (const product of backendProducts) {
    let score = scoreBackendProductAgainstMlItem(product, mlItem);

    if (cartQueryText) {
      score += scoreBackendProductAgainstQuery(product, cartQueryText) * 0.5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  return bestProduct;
}

async function callMlRecommend(payload) {
  const response = await fetch(`${ML_SERVICE_URL}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error = new Error(
      body?.error || body?.message || `ML service failed with status ${response.status}`
    );
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

async function callMlChat(payload) {
  const response = await fetch(`${ML_SERVICE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error = new Error(
      body?.error || body?.message || `ML chat failed with status ${response.status}`
    );
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

module.exports = {
  callMlChat,
  callMlRecommend,
  loadMlCatalog,
  mapCurrentItemToMlId,
  mapMlItemToBackendProduct,
  serializeProduct,
};
