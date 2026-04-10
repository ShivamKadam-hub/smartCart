import { Product, PRODUCTS } from "./products";

export type BundleDefinition = {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  requiredCategories: string[]; // e.g. ["sofa", "decor"]
  icon: "home-outline" | "restaurant-outline" | "leaf-outline" | "bulb-outline";
  bgColor: string;
};

export const BUNDLES: BundleDefinition[] = [
  {
    id: "living-room-refresh",
    name: "Living Room Refresh",
    description: "Pair any Sofa with a Decor piece to unlock 15% off both.",
    discountPercent: 15,
    requiredCategories: ["sofa", "decor"],
    icon: "home-outline",
    bgColor: "#F3EFE9",
  },
  {
    id: "chefs-kitchen",
    name: "The Chef's Kitchen",
    description: "Combine a professional Knife set with any Cookware for a 20% bundle discount.",
    discountPercent: 20,
    requiredCategories: ["knife", "cookware"],
    icon: "restaurant-outline",
    bgColor: "#E9F0F3",
  },
  {
    id: "dining-glow",
    name: "Dining Glow Up",
    description: "Match Tableware with any Lighting fixture to save 15% instantly.",
    discountPercent: 15,
    requiredCategories: ["tableware", "lighting"],
    icon: "bulb-outline",
    bgColor: "#F5F0E6",
  },
];

// Helper to check what bundles are active in the cart, and what's missing
export function analyzeCartBundles(cartItems: { name?: string; category?: string; price: number; quantity: number; tag?: string; label?: string }[]) {
  // Normalize cart items to their categories (handling 'label' fallback if category isn't directly on CartProduct but product_id could be used, 
  // actually CartProduct doesn't store category currently, we might need to map it via product name / id)
  
  // To be safe, let's look up the full product from PRODUCTS using the name or id
  const cartProductsWithCategory = cartItems.map(item => {
    const fullProduct = PRODUCTS.find(p => p.name === item.name);
    return {
      ...item,
      category: fullProduct?.category || "",
    };
  });

  return BUNDLES.map(bundle => {
    const inCartCategories = new Set(cartProductsWithCategory.map(c => c.category));
    const fulfilledCategories = bundle.requiredCategories.filter(rc => inCartCategories.has(rc));
    const missingCategories = bundle.requiredCategories.filter(rc => !inCartCategories.has(rc));
    
    const isCompleted = missingCategories.length === 0;

    // Calculate how much they currently have in the cart for this bundle
    let currentInBundleValue = 0;
    if (fulfilledCategories.length > 0) {
      fulfilledCategories.forEach(fc => {
        // Find cheapest item of this category to group as bundle, or just sum all matching?
        // Usually bundle applies to 1 set of items. We'll simplify: sum of all items in these categories gets the discount.
        const itemsInCat = cartProductsWithCategory.filter(c => c.category === fc);
        currentInBundleValue += itemsInCat.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      });
    }

    return {
      ...bundle,
      isCompleted,
      fulfilledCategories,
      missingCategories,
      currentInBundleValue,
      potentialSavings: Math.round(currentInBundleValue * (bundle.discountPercent / 100))
    };
  });
}

// Helper to get product suggestions for a specific category
export function getSuggestionsForCategory(category: string, limit: number = 4): Product[] {
  return PRODUCTS.filter(p => p.category === category).slice(0, limit);
}
