require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Product = require('../src/models/product.model');
const products = require('./catalog-products');

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapProduct(product) {
  const images = Array.isArray(product.images) ? product.images : [];
  const primaryImage = images[0]?.url || '';

  return {
    name: product.name || product.product_id,
    slug: slugify(product.name || product.product_id),
    description: product.description || '',
    category: product.category || '',
    brand: product.brand || '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    price: Number(product.price) || 0,
    compareAtPrice: null,
    stock: 25,
    imageUrl: primaryImage,
    isActive: true,
    compatibleWith: [],
    metadata: {
      externalProductId: product.product_id || '',
      style: product.style || '',
      images,
    },
  };
}

async function run() {
  try {
    await connectDB();

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const insertedProducts = await Product.insertMany(products.map(mapProduct));
    console.log(`Inserted ${insertedProducts.length} products.`);

    console.log('Product seeding complete.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

run();
