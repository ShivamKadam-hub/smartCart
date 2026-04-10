const Product = require('../../models/product.model');

function serializeProduct(product) {
  const metadata = product.metadata || {};
  const images = Array.isArray(metadata.images) ? metadata.images : [];

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
    images,
    rating: metadata.rating ?? 0,
    metadata,
  };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

const listProducts = asyncHandler(async (req, res) => {
  const { category, q } = req.query;
  const query = {
    isActive: true,
  };

  if (category) {
    query.category = new RegExp(`^${escapeRegExp(category)}$`, 'i');
  }

  if (q) {
    const term = String(q).trim();
    if (term) {
      const pattern = new RegExp(escapeRegExp(term), 'i');
      query.$or = [
        { name: pattern },
        { description: pattern },
        { category: pattern },
        { brand: pattern },
        { tags: pattern },
      ];
    }
  }

  const products = await Product.find(query).lean();

  return res.status(200).json({
    message: 'Products fetched successfully.',
    data: products.map(serializeProduct),
  });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true }).lean();

  if (!product) {
    return res.status(404).json({
      message: 'Product not found.',
    });
  }

  return res.status(200).json({
    message: 'Product fetched successfully.',
    data: serializeProduct(product),
  });
});

module.exports = {
  getProductBySlug,
  listProducts,
};
