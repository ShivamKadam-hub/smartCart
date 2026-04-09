import { create } from 'zustand';
import { Product } from '../data/mockProducts';
import mockProducts from '../data/mockProducts';

/* ─── types ─── */
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  savedForLater: CartItem[];
  dismissedBundles: string[];

  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  addBundleItems: (products: Product[]) => void;
  dismissBundle: (bundleId: string) => void;
  getSubtotal: () => number;
  getSavings: () => number;
}

/* ─── initial cart: preload 2-3 items ─── */
const initialItems: CartItem[] = [
  { product: mockProducts[0], quantity: 1 }, // Stainless Steel Skillet
  { product: mockProducts[2], quantity: 1 }, // Cast Iron Dutch Oven
  { product: mockProducts[7], quantity: 2 }, // Nonstick Baking Sheet
];

const initialSaved: CartItem[] = [
  { product: mockProducts[4], quantity: 1 }, // Wooden Spoon Collection
  { product: mockProducts[11], quantity: 1 }, // Digital Kitchen Scale
];

export const useCartStore = create<CartState>((set, get) => ({
  items: initialItems,
  savedForLater: initialSaved,
  dismissedBundles: [],

  /* ── add ── */
  addItem: (product, qty = 1) =>
    set((s) => {
      const existing = s.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + qty }
              : i,
          ),
        };
      }
      return { items: [...s.items, { product, quantity: qty }] };
    }),

  /* ── remove ── */
  removeItem: (productId) =>
    set((s) => ({
      items: s.items.filter((i) => i.product.id !== productId),
    })),

  /* ── quantity ── */
  updateQuantity: (productId, delta) =>
    set((s) => ({
      items: s.items
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    })),

  /* ── save / restore ── */
  saveForLater: (productId) =>
    set((s) => {
      const item = s.items.find((i) => i.product.id === productId);
      if (!item) return s;
      return {
        items: s.items.filter((i) => i.product.id !== productId),
        savedForLater: [...s.savedForLater, { ...item, quantity: 1 }],
      };
    }),

  moveToCart: (productId) =>
    set((s) => {
      const saved = s.savedForLater.find((i) => i.product.id === productId);
      if (!saved) return s;
      const existing = s.items.find((i) => i.product.id === productId);
      return {
        savedForLater: s.savedForLater.filter(
          (i) => i.product.id !== productId,
        ),
        items: existing
          ? s.items.map((i) =>
              i.product.id === productId
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            )
          : [...s.items, { product: saved.product, quantity: 1 }],
      };
    }),

  /* ── bundles ── */
  addBundleItems: (products) =>
    set((s) => {
      let newItems = [...s.items];
      for (const p of products) {
        const exists = newItems.find((i) => i.product.id === p.id);
        if (exists) {
          newItems = newItems.map((i) =>
            i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i,
          );
        } else {
          newItems.push({ product: p, quantity: 1 });
        }
      }
      return { items: newItems };
    }),

  dismissBundle: (bundleId) =>
    set((s) => ({
      dismissedBundles: [...s.dismissedBundles, bundleId],
    })),

  /* ── computed ── */
  getSubtotal: () =>
    get().items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0,
    ),

  getSavings: () => {
    const subtotal = get().getSubtotal();
    // e.g. 5% threshold discount when > $200
    if (subtotal > 200) return subtotal * 0.05;
    return 0;
  },
}));
