import { useMemo } from 'react';
import { CartItem } from '../store/cartStore';
import mockProducts, { Product } from '../data/mockProducts';
import { bundleRules, Bundle } from '../data/bundleRules';

interface SmartRecommendations {
  bundles: Bundle[];
  complementary: Product[];
  savedForLater: CartItem[];
}

/**
 * Derives bundles + complementary products from the current cart.
 *
 * RULES:
 *  - cookware in cart → suggest utensils & lids
 *  - bakeware in cart → suggest cooling_rack / parchment
 *  - total > $150      → "Complete the set" bundle
 *  - max 5 complementary, no duplicates
 *  - prioritise saved items matching cart category
 */
export function useSmartRecommendations(
  cartItems: CartItem[],
  savedItems: CartItem[],
  dismissedBundles: string[],
): SmartRecommendations {
  const cartIds = useMemo(
    () => new Set(cartItems.map((i) => i.product.id)),
    [cartItems],
  );

  const cartTags = useMemo(
    () => new Set(cartItems.flatMap((i) => i.product.tags)),
    [cartItems],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0),
    [cartItems],
  );

  /* ── bundles ── */
  const bundles: Bundle[] = useMemo(() => {
    const result: Bundle[] = [];

    for (const rule of bundleRules) {
      if (dismissedBundles.includes(rule.id)) continue;

      // "complete-the-set" fires only when total > $150 and there are items
      if (rule.id === 'complete-the-set') {
        if (subtotal <= 150 || cartItems.length === 0) continue;
      } else {
        // Normal rules need a triggerTag in the cart
        const triggered = rule.triggerTags.some((t) => cartTags.has(t));
        if (!triggered) continue;
      }

      // Gather products to suggest
      const products = mockProducts.filter(
        (p) =>
          !cartIds.has(p.id) &&
          p.tags.some((t) => rule.suggestTags.includes(t)),
      );

      if (products.length === 0) continue;

      const savings =
        products.reduce((s, p) => s + p.price, 0) * rule.discount;
      result.push({ rule, products, savings });
    }

    return result;
  }, [cartItems, cartIds, cartTags, subtotal, dismissedBundles]);

  /* ── complementary ── */
  const complementary: Product[] = useMemo(() => {
    // Collect categories present in cart
    const cartCategories = new Set(cartItems.map((i) => i.product.category));
    const savedIds = new Set(savedItems.map((i) => i.product.id));

    // Candidates: products NOT already in cart
    const candidates = mockProducts.filter((p) => !cartIds.has(p.id));

    // Prioritise saved items whose category matches the cart
    const prioritised = candidates.sort((a, b) => {
      const aScore =
        (savedIds.has(a.id) ? 2 : 0) +
        (cartCategories.has(a.category) ? 1 : 0);
      const bScore =
        (savedIds.has(b.id) ? 2 : 0) +
        (cartCategories.has(b.category) ? 1 : 0);
      return bScore - aScore;
    });

    return prioritised.slice(0, 5);
  }, [cartItems, cartIds, savedItems]);

  /* ── saved for later (passed through) ── */
  const savedForLater = useMemo(() => savedItems, [savedItems]);

  return { bundles, complementary, savedForLater };
}
