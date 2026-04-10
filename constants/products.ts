export type Review = {
  id: string;
  userName: string;
  date: string;
  rating: number;
  comment: string;
};

export type Product = {
  product_id: number;
  name: string;
  category: string;
  style: string;
  brand: string;
  price: number;
  displayPrice: string;
  originalPrice?: number;
  description: string;
  img: string;
  images: string[];
  tag?: string;
  label?: string;
  color?: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
};

export const PRODUCTS: Product[] = [
  // ─── Living / Sofa ───────────────────────────────────────
  {
    product_id: 101,
    name: "Minimal Chair",
    category: "sofa",
    style: "seating",
    brand: "Williams Sonoma",
    price: 7999,
    displayPrice: "₹7,999",
    description:
      "A sculptural lounge chair with clean lines and a soft, supportive silhouette. Perfect for living rooms and cozy reading nooks. Crafted from sustainably sourced beechwood with premium linen upholstery.",
    img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?q=80&w=800",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800",
    ],
    tag: "Best Seller",
    rating: 4.5,
    reviewCount: 128,
    reviews: [
      { id: "r1", userName: "Ananya S.", date: "2026-03-28", rating: 5, comment: "Absolutely stunning chair. The craftsmanship is top-notch and it fits perfectly in my reading corner." },
      { id: "r2", userName: "Rohit M.", date: "2026-03-15", rating: 4, comment: "Great design and comfort. Slight wobble on tiled floor but fixed with felt pads." },
      { id: "r3", userName: "Priya K.", date: "2026-02-10", rating: 5, comment: "Exceeded my expectations! The linen fabric feels luxurious." },
    ],
  },
  {
    product_id: 102,
    name: "Velvet Sofa",
    category: "sofa",
    style: "seating",
    brand: "Pottery Barn",
    price: 24999,
    displayPrice: "₹24,999",
    originalPrice: 32000,
    description:
      "Sink into pure luxury with this deep-seated velvet sofa. Features premium foam cushioning, solid hardwood frame, and stain-resistant velvet in a rich emerald hue.",
    img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800",
      "https://images.unsplash.com/photo-1550254478-ead40cc54513?q=80&w=800",
      "https://images.unsplash.com/photo-1558211583-d26f610c1eb1?q=80&w=800",
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=800",
    ],
    tag: "Limited",
    color: "Emerald",
    rating: 4.8,
    reviewCount: 89,
    reviews: [
      { id: "r4", userName: "Meera J.", date: "2026-04-01", rating: 5, comment: "The velvet texture is heavenly. Worth every rupee!" },
      { id: "r5", userName: "Karan P.", date: "2026-03-20", rating: 5, comment: "Statement piece for our new flat. Delivery was smooth too." },
      { id: "r6", userName: "Divya R.", date: "2026-03-05", rating: 4, comment: "Beautiful sofa but the emerald is slightly darker than photos." },
    ],
  },
  {
    product_id: 103,
    name: "Cloud Modular Sofa",
    category: "sofa",
    style: "seating",
    brand: "Restoration Hardware",
    price: 68000,
    displayPrice: "₹68,000",
    description:
      "Ultra-deep modular sofa system with cloud-like comfort. Configurable L-shape or straight layout. Wrapped in performance linen with removable, washable covers.",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=800",
      "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=800",
    ],
    tag: "Best Seller",
    rating: 4.9,
    reviewCount: 214,
    reviews: [
      { id: "r7", userName: "Arjun T.", date: "2026-04-05", rating: 5, comment: "Like sitting on a cloud. Family movie nights have never been better." },
      { id: "r8", userName: "Neha G.", date: "2026-03-22", rating: 5, comment: "The modular design is genius. We rearrange it every week!" },
    ],
  },
  {
    product_id: 104,
    name: "Velvet Lounge Chair",
    category: "sofa",
    style: "seating",
    brand: "West Elm",
    price: 21500,
    displayPrice: "₹21,500",
    description:
      "Mid-century inspired lounge chair with buttery velvet upholstery. Tapered walnut legs and ergonomic lumbar support for extended comfort.",
    img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=800",
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?q=80&w=800",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800",
    ],
    tag: "Limited",
    color: "Walnut",
    rating: 4.6,
    reviewCount: 67,
    reviews: [
      { id: "r9", userName: "Siddharth B.", date: "2026-03-18", rating: 5, comment: "The walnut legs are gorgeous. Perfect accent chair." },
      { id: "r10", userName: "Isha D.", date: "2026-02-28", rating: 4, comment: "Very comfortable for reading. Color is accurate to photos." },
    ],
  },

  // ─── Kitchen / Cookware ──────────────────────────────────
  {
    product_id: 201,
    name: "Chef's Knife Set",
    category: "knife",
    style: "cutlery",
    brand: "Zwilling",
    price: 14999,
    displayPrice: "₹14,999",
    originalPrice: 18999,
    description:
      "Professional-grade 5-piece knife set hand-forged from German stainless steel. Includes chef's knife, paring knife, bread knife, utility knife, and honing steel in a walnut block.",
    img: "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=800",
      "https://images.unsplash.com/photo-1566454419290-57a64afe21ac?q=80&w=800",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800",
    ],
    tag: "Studio Pick",
    rating: 4.7,
    reviewCount: 156,
    reviews: [
      { id: "r11", userName: "Chef Ravi", date: "2026-03-30", rating: 5, comment: "Best knives I've ever used. The balance is perfect." },
      { id: "r12", userName: "Sunita L.", date: "2026-03-12", rating: 4, comment: "Sharp right out of the box. The walnut block is beautiful." },
    ],
  },
  {
    product_id: 202,
    name: "Stoneware Dinner Set",
    category: "tableware",
    style: "dining",
    brand: "Le Creuset",
    price: 5400,
    displayPrice: "₹5,400",
    description:
      "18-piece stoneware dinner set in a warm matte glaze. Chip-resistant, dishwasher-safe, and oven-safe to 260°C. Includes dinner plates, side plates, and bowls for six.",
    img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800",
      "https://images.unsplash.com/photo-1603199506016-5596e26ea690?q=80&w=800",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800",
    ],
    tag: "New",
    rating: 4.4,
    reviewCount: 92,
    reviews: [
      { id: "r13", userName: "Alka N.", date: "2026-04-02", rating: 5, comment: "The matte finish is stunning. Perfect for dinner parties." },
      { id: "r14", userName: "Vishal K.", date: "2026-03-25", rating: 4, comment: "Great quality for the price. Survived the dishwasher many times." },
    ],
  },
  {
    product_id: 203,
    name: "Cast Iron Dutch Oven",
    category: "cookware",
    style: "electrics",
    brand: "Le Creuset",
    price: 18500,
    displayPrice: "₹18,500",
    description:
      "Iconic enameled cast iron Dutch oven in Flame Orange. 5.3L capacity, perfect for slow-cooked stews, bread, and one-pot meals. Lifetime warranty included.",
    img: "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800",
      "https://images.unsplash.com/photo-1556909114-44e3e70034e2?q=80&w=800",
      "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=800",
    ],
    tag: "Curated",
    color: "Flame Orange",
    rating: 4.9,
    reviewCount: 312,
    reviews: [
      { id: "r15", userName: "Kavita M.", date: "2026-04-06", rating: 5, comment: "Makes the perfect sourdough bread. Worth the investment." },
      { id: "r16", userName: "Amit S.", date: "2026-03-15", rating: 5, comment: "Heirloom quality. This pot will outlast me!" },
    ],
  },

  // ─── Decor ───────────────────────────────────────────────
  {
    product_id: 301,
    name: "Ceramic Vase",
    category: "decor",
    style: "homekeeping",
    brand: "Crate & Barrel",
    price: 2499,
    displayPrice: "₹2,499",
    description:
      "Handcrafted ceramic vase with elegant matte finish. A refined accent piece for modern shelves and tabletops. Each piece is unique due to the hand-thrown process.",
    img: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=800",
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800",
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=800",
    ],
    tag: "New",
    rating: 4.3,
    reviewCount: 45,
    reviews: [
      { id: "r17", userName: "Tara W.", date: "2026-03-20", rating: 5, comment: "Beautiful asymmetric shape. Looks great with dried pampas grass." },
      { id: "r18", userName: "Raj D.", date: "2026-03-01", rating: 4, comment: "Love the matte texture. Slightly smaller than expected." },
    ],
  },
  {
    product_id: 302,
    name: "Mirror Wall Accent",
    category: "decor",
    style: "homekeeping",
    brand: "West Elm",
    price: 12400,
    displayPrice: "₹12,400",
    description:
      "Oversized round mirror with brushed brass frame. Creates an instant focal point in any room. Beveled edge for a premium, gallery-level finish.",
    img: "https://images.unsplash.com/photo-1618220179428-22790b46a011?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1618220179428-22790b46a011?q=80&w=800",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800",
      "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=800",
    ],
    tag: "Curated",
    rating: 4.6,
    reviewCount: 78,
    reviews: [
      { id: "r19", userName: "Nisha P.", date: "2026-03-28", rating: 5, comment: "Makes our hallway look twice as big. The brass frame is chef's kiss." },
      { id: "r20", userName: "Varun S.", date: "2026-03-10", rating: 4, comment: "Heavy but well-packaged. Installation was straightforward." },
    ],
  },
  {
    product_id: 303,
    name: "Sculpted Candle Set",
    category: "decor",
    style: "homekeeping",
    brand: "OXO",
    price: 1800,
    displayPrice: "₹1,800",
    description:
      "Set of three hand-poured soy wax candles in sculptural geometric shapes. Infused with sandalwood and vanilla notes. 40+ hours burn time per candle.",
    img: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?q=80&w=800",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800",
      "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?q=80&w=800",
    ],
    tag: "Gift Ready",
    rating: 4.2,
    reviewCount: 210,
    reviews: [
      { id: "r21", userName: "Aditi R.", date: "2026-04-03", rating: 5, comment: "Perfect housewarming gift! The scent is divine." },
      { id: "r22", userName: "Manish T.", date: "2026-03-15", rating: 4, comment: "Beautiful shapes, great scent. Burns evenly." },
    ],
  },
  {
    product_id: 304,
    name: "Wall Frame Set",
    category: "decor",
    style: "homekeeping",
    brand: "Pottery Barn",
    price: 1499,
    displayPrice: "₹1,499",
    description:
      "Gallery-style set of 5 matching frames in matte black. Includes 3 sizes for flexible arrangements. Comes with a paper template for perfect wall mounting.",
    img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800",
      "https://images.unsplash.com/photo-1582053433976-25c00369fc93?q=80&w=800",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800",
    ],
    tag: "New",
    rating: 4.1,
    reviewCount: 33,
    reviews: [
      { id: "r23", userName: "Deepa G.", date: "2026-03-22", rating: 5, comment: "The mounting template saved so much time. Frames look expensive." },
    ],
  },

  // ─── Lighting ────────────────────────────────────────────
  {
    product_id: 401,
    name: "Pendant Light",
    category: "lighting",
    style: "electrics",
    brand: "Cuisinart",
    price: 5299,
    displayPrice: "₹5,299",
    description:
      "A statement pendant light with warm ambient glow. Hand-blown glass shade with brushed nickel hardware. Ideal for dining areas, kitchen islands, and entryways.",
    img: "https://images.unsplash.com/photo-1543055868-96bbbf829d67?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1543055868-96bbbf829d67?q=80&w=800",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800",
    ],
    tag: "New",
    rating: 4.5,
    reviewCount: 54,
    reviews: [
      { id: "r24", userName: "Pooja V.", date: "2026-03-30", rating: 5, comment: "Transforms our dining area completely. The warm glow is perfect." },
      { id: "r25", userName: "Aryan K.", date: "2026-03-18", rating: 4, comment: "Beautiful piece. Needs an electrician for installation." },
    ],
  },
  {
    product_id: 402,
    name: "Brass Arc Lamp",
    category: "lighting",
    style: "electrics",
    brand: "Restoration Hardware",
    price: 16400,
    displayPrice: "₹16,400",
    description:
      "Dramatic arc floor lamp in antique brass finish. Adjustable arm spans up to 180cm. Weighted marble base ensures stability. Dimmable LED bulb included.",
    img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800",
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800",
      "https://images.unsplash.com/photo-1543055868-96bbbf829d67?q=80&w=800",
    ],
    tag: "Studio Pick",
    rating: 4.7,
    reviewCount: 142,
    reviews: [
      { id: "r26", userName: "Ritu M.", date: "2026-04-05", rating: 5, comment: "The marble base is so elegant. Perfect reading light for the sofa." },
      { id: "r27", userName: "Sanjay P.", date: "2026-03-20", rating: 5, comment: "Hotel-quality lamp at a fraction of the price. Love the dimmer." },
    ],
  },
  {
    product_id: 403,
    name: "Floor Lamp",
    category: "lighting",
    style: "electrics",
    brand: "West Elm",
    price: 8999,
    displayPrice: "₹8,999",
    description:
      "Minimalist tripod floor lamp with natural linen shade. Mid-century walnut wood legs. Three brightness levels via touch switch. Energy-efficient LED compatible.",
    img: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800",
    ],
    tag: "New",
    rating: 4.4,
    reviewCount: 68,
    reviews: [
      { id: "r28", userName: "Sneha B.", date: "2026-03-25", rating: 4, comment: "Clean design. The linen shade gives off a lovely soft light." },
      { id: "r29", userName: "Nikhil J.", date: "2026-03-10", rating: 5, comment: "Looks way more expensive than it is. Perfect for my study." },
    ],
  },

  // ─── Outdoor ─────────────────────────────────────────────
  {
    product_id: 501,
    name: "Oak Table",
    category: "outdoor",
    style: "dining",
    brand: "Williams Sonoma",
    price: 12499,
    displayPrice: "₹12,499",
    description:
      "Solid oak table with a minimalist profile. Weather-resistant UV-protected finish. Designed for family meals, work-from-home days, and outdoor entertaining.",
    img: "https://images.unsplash.com/photo-1530018607912-eff2df114f11?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1530018607912-eff2df114f11?q=80&w=800",
      "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800",
    ],
    tag: "Curated",
    rating: 4.5,
    reviewCount: 87,
    reviews: [
      { id: "r30", userName: "Vikram A.", date: "2026-04-01", rating: 5, comment: "Beautiful grain pattern. Survived a monsoon season already!" },
      { id: "r31", userName: "Lakshmi N.", date: "2026-03-15", rating: 4, comment: "Solid and sturdy. The oak colour deepens beautifully over time." },
    ],
  },
];

/** Find a product by its slug (name lowercased, spaces to hyphens) */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(
    (p) =>
      p.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") === slug
  );
}

/** Find a product by its product_id */
export function getProductById(id: number): Product | undefined {
  return PRODUCTS.find((p) => p.product_id === id);
}

/** Get all products in a given category */
export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

/** Category display mapping for Home page */
export const HOME_CATEGORIES = ["Sofa", "Kitchen", "Decor", "Lighting", "Outdoor"];

export const CATEGORY_MAP: Record<string, string> = {
  Sofa: "sofa",
  Kitchen: "knife,cookware,tableware",
  Decor: "decor",
  Lighting: "lighting",
  Outdoor: "outdoor",
};

export function getProductsForHomeCategory(displayCategory: string): Product[] {
  const cats = CATEGORY_MAP[displayCategory];
  if (!cats) return [];
  const catList = cats.split(",");
  return PRODUCTS.filter((p) => catList.includes(p.category));
}
