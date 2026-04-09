require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Product = require('../src/models/product.model');

const products = [
  {
    name: 'Cast Iron Skillet 12"',
    description: 'Pre-seasoned cast iron skillet perfect for stovetop and oven cooking.',
    price: 89.99,
    category: 'cookware',
    subCategory: 'skillets',
    tags: ['cast-iron', 'stovetop', 'oven-safe', 'frying'],
    imageUrl: 'https://example.com/images/cast-iron-skillet.jpg',
    inventory: 50,
    isAvailable: true,
    bundleGroups: ['cookware-starter-bundle'],
    rating: 4.8,
  },
  {
    name: 'Dutch Oven 5.5 Qt',
    description: 'Enameled cast iron Dutch oven for braising, soups, and stews.',
    price: 149.99,
    category: 'cookware',
    subCategory: 'dutch-ovens',
    tags: ['cast-iron', 'oven-safe', 'braising', 'soup'],
    imageUrl: 'https://example.com/images/dutch-oven.jpg',
    inventory: 30,
    isAvailable: true,
    bundleGroups: ['cookware-starter-bundle'],
    rating: 4.9,
  },
  {
    name: 'Non-Stick Frying Pan 10"',
    description: 'Ceramic non-stick frying pan with ergonomic handle.',
    price: 49.99,
    category: 'cookware',
    subCategory: 'frying-pans',
    tags: ['non-stick', 'ceramic', 'stovetop', 'frying'],
    imageUrl: 'https://example.com/images/nonstick-pan.jpg',
    inventory: 75,
    isAvailable: true,
    bundleGroups: ['cookware-starter-bundle'],
    rating: 4.5,
  },
  {
    name: 'Stainless Steel Saucepan 2 Qt',
    description: 'Tri-ply stainless steel saucepan with glass lid.',
    price: 69.99,
    category: 'cookware',
    subCategory: 'saucepans',
    tags: ['stainless-steel', 'stovetop', 'sauce', 'boiling'],
    imageUrl: 'https://example.com/images/saucepan.jpg',
    inventory: 40,
    isAvailable: true,
    bundleGroups: ['cookware-starter-bundle'],
    rating: 4.6,
  },
  {
    name: 'Cast Iron Skillet Lid',
    description: 'Tempered glass lid that fits 12" cast iron skillets.',
    price: 24.99,
    category: 'accessories',
    subCategory: 'lids',
    tags: ['cast-iron', 'lid', 'glass', 'cookware-accessory'],
    imageUrl: 'https://example.com/images/skillet-lid.jpg',
    inventory: 60,
    isAvailable: true,
    bundleGroups: ['cookware-starter-bundle'],
    rating: 4.3,
  },
  {
    name: 'Silicone Spatula Set (3 Pack)',
    description: 'Heat-resistant silicone spatulas safe up to 600F.',
    price: 19.99,
    category: 'accessories',
    subCategory: 'utensils',
    tags: ['silicone', 'spatula', 'heat-resistant', 'cookware-accessory'],
    imageUrl: 'https://example.com/images/spatula-set.jpg',
    inventory: 100,
    isAvailable: true,
    bundleGroups: ['cookware-starter-bundle'],
    rating: 4.7,
  },
  {
    name: 'Cast Iron Cleaning Brush',
    description: 'Stiff bristle brush designed for cleaning cast iron without soap.',
    price: 12.99,
    category: 'accessories',
    subCategory: 'cleaning',
    tags: ['cleaning', 'cast-iron', 'brush', 'maintenance'],
    imageUrl: 'https://example.com/images/cleaning-brush.jpg',
    inventory: 80,
    isAvailable: true,
    bundleGroups: ['cookware-starter-bundle'],
    rating: 4.4,
  },
  {
    name: 'Wooden Spoon Set (4 Pack)',
    description: 'Natural beechwood spoons for stirring and serving.',
    price: 15.99,
    category: 'accessories',
    subCategory: 'utensils',
    tags: ['wooden', 'spoon', 'stirring', 'cookware-accessory'],
    imageUrl: 'https://example.com/images/wooden-spoons.jpg',
    inventory: 90,
    isAvailable: true,
    bundleGroups: [],
    rating: 4.5,
  },
  {
    name: 'Non-Stick Baking Sheet Set',
    description: 'Set of 2 heavy-gauge aluminum baking sheets with non-stick coating.',
    price: 39.99,
    category: 'bakeware',
    subCategory: 'baking-sheets',
    tags: ['non-stick', 'aluminum', 'baking', 'oven-safe'],
    imageUrl: 'https://example.com/images/baking-sheet.jpg',
    inventory: 55,
    isAvailable: true,
    bundleGroups: ['bakeware-bundle'],
    rating: 4.6,
  },
  {
    name: 'Ceramic Mixing Bowl Set (3 Pack)',
    description: 'Nesting ceramic mixing bowls in small, medium, and large.',
    price: 44.99,
    category: 'bakeware',
    subCategory: 'mixing-bowls',
    tags: ['ceramic', 'mixing', 'nesting', 'baking'],
    imageUrl: 'https://example.com/images/mixing-bowls.jpg',
    inventory: 35,
    isAvailable: true,
    bundleGroups: ['bakeware-bundle'],
    rating: 4.7,
  },
  {
    name: 'Silicone Baking Mat (2 Pack)',
    description: 'Reusable non-stick silicone baking mats, replaces parchment paper.',
    price: 22.99,
    category: 'bakeware',
    subCategory: 'baking-mats',
    tags: ['silicone', 'non-stick', 'reusable', 'baking'],
    imageUrl: 'https://example.com/images/baking-mat.jpg',
    inventory: 70,
    isAvailable: true,
    bundleGroups: ['bakeware-bundle'],
    rating: 4.8,
  },
  {
    name: 'Stand Mixer Attachment Set',
    description: 'Dough hook, wire whip, and flat beater for stand mixers.',
    price: 59.99,
    category: 'bakeware',
    subCategory: 'mixer-attachments',
    tags: ['mixer', 'dough', 'baking', 'attachment'],
    imageUrl: 'https://example.com/images/mixer-attachments.jpg',
    inventory: 25,
    isAvailable: true,
    bundleGroups: ['bakeware-bundle'],
    rating: 4.5,
  },
  {
    name: "Chef's Knife 8\"",
    description: 'High-carbon stainless steel chef knife with full tang.',
    price: 129.99,
    category: 'knives',
    subCategory: 'chefs-knives',
    tags: ['stainless-steel', 'chef-knife', 'cutting', 'high-carbon'],
    imageUrl: 'https://example.com/images/chefs-knife.jpg',
    inventory: 45,
    isAvailable: true,
    bundleGroups: ['knife-bundle'],
    rating: 4.9,
  },
  {
    name: 'Knife Sharpening Steel',
    description: 'Honing steel rod to maintain knife edge between sharpenings.',
    price: 34.99,
    category: 'accessories',
    subCategory: 'knife-accessories',
    tags: ['sharpening', 'honing', 'knife-accessory', 'maintenance'],
    imageUrl: 'https://example.com/images/honing-steel.jpg',
    inventory: 50,
    isAvailable: true,
    bundleGroups: ['knife-bundle'],
    rating: 4.6,
  },
  {
    name: 'Bamboo Cutting Board',
    description: 'Large bamboo cutting board with juice groove.',
    price: 29.99,
    category: 'accessories',
    subCategory: 'cutting-boards',
    tags: ['bamboo', 'cutting-board', 'knife-accessory', 'chopping'],
    imageUrl: 'https://example.com/images/cutting-board.jpg',
    inventory: 65,
    isAvailable: true,
    bundleGroups: ['knife-bundle'],
    rating: 4.7,
  },
  {
    name: 'Glass Food Storage Set (10 Piece)',
    description: 'Airtight borosilicate glass containers with snap-lock lids.',
    price: 54.99,
    category: 'storage',
    subCategory: 'food-containers',
    tags: ['glass', 'airtight', 'storage', 'meal-prep'],
    imageUrl: 'https://example.com/images/glass-storage.jpg',
    inventory: 40,
    isAvailable: true,
    bundleGroups: [],
    rating: 4.6,
  },
  {
    name: 'Spice Rack Organizer (20 Jars)',
    description: 'Rotating countertop spice rack with 20 refillable glass jars.',
    price: 49.99,
    category: 'storage',
    subCategory: 'spice-storage',
    tags: ['spice', 'organizer', 'glass-jars', 'countertop'],
    imageUrl: 'https://example.com/images/spice-rack.jpg',
    inventory: 30,
    isAvailable: true,
    bundleGroups: [],
    rating: 4.5,
  },
  {
    name: 'Copper Sauté Pan 3 Qt',
    description: 'Professional copper sauté pan with stainless steel lining.',
    price: 199.99,
    category: 'cookware',
    subCategory: 'saute-pans',
    tags: ['copper', 'professional', 'stovetop', 'saute'],
    imageUrl: 'https://example.com/images/copper-saute.jpg',
    inventory: 0,
    isAvailable: false,
    bundleGroups: [],
    rating: 4.9,
  },
];

const complementaryMap = [
  {
    name: 'Cast Iron Skillet 12"',
    complementary: [
      'Cast Iron Skillet Lid',
      'Cast Iron Cleaning Brush',
      'Silicone Spatula Set (3 Pack)',
      'Wooden Spoon Set (4 Pack)',
    ],
  },
  {
    name: 'Dutch Oven 5.5 Qt',
    complementary: [
      'Cast Iron Cleaning Brush',
      'Wooden Spoon Set (4 Pack)',
      'Glass Food Storage Set (10 Piece)',
    ],
  },
  {
    name: 'Chef\'s Knife 8"',
    complementary: ['Knife Sharpening Steel', 'Bamboo Cutting Board'],
  },
  {
    name: 'Non-Stick Baking Sheet Set',
    complementary: ['Silicone Baking Mat (2 Pack)', 'Ceramic Mixing Bowl Set (3 Pack)'],
  },
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapProduct(product) {
  return {
    name: product.name,
    slug: slugify(product.name),
    description: product.description,
    category: product.category,
    brand: '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    price: product.price,
    compareAtPrice: null,
    stock: product.inventory ?? 0,
    imageUrl: product.imageUrl || '',
    isActive: Boolean(product.isAvailable),
    compatibleWith: [],
    metadata: {
      subCategory: product.subCategory || '',
      bundleGroups: product.bundleGroups || [],
      rating: product.rating ?? null,
      inventory: product.inventory ?? 0,
      isAvailable: Boolean(product.isAvailable),
    },
  };
}

async function seedComplementary(insertedProducts) {
  const byName = new Map(insertedProducts.map((product) => [product.name, product]));

  for (const item of complementaryMap) {
    const source = byName.get(item.name);
    if (!source) {
      continue;
    }

    const complementaryIds = item.complementary
      .map((name) => byName.get(name)?._id)
      .filter(Boolean);

    await Product.findByIdAndUpdate(source._id, {
      compatibleWith: complementaryIds,
    });
  }

  console.log('Linked complementary products.');
}

async function run() {
  try {
    await connectDB();

    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const insertedProducts = await Product.insertMany(products.map(mapProduct));
    console.log(`Inserted ${insertedProducts.length} products.`);

    await seedComplementary(insertedProducts);

    console.log('Product seeding complete.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

run();
