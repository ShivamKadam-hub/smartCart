import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  addWishlistItem,
  clearWishlist as clearBackendWishlist,
  getWishlist,
  removeWishlistItem,
  type ProductRecord,
} from '@/lib/api';
import { useAuth } from './AuthContext';

export type WishlistItem = {
  slug: string;
  title: string;
  price: string;
  image: string;
  description: string;
  backendProductId?: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (identifier: string) => Promise<void>;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  isWishlisted: (identifier: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString('en-IN')}`;
}

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function matchesWishlistItem(item: WishlistItem, identifier: string) {
  const normalized = normalizeIdentifier(identifier);
  return (
    normalizeIdentifier(item.slug) === normalized ||
    normalizeIdentifier(item.backendProductId || '') === normalized
  );
}

function mapProductsToWishlistItems(products: ProductRecord[]): WishlistItem[] {
  return products.map((product) => ({
    slug: product.slug,
    title: product.name,
    price: formatPrice(product.price),
    image: product.imageUrl,
    description: product.description,
    backendProductId: product.id,
  }));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Track which user's wishlist is loaded to avoid redundant fetches
  const loadedUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    // User logged out — wipe wishlist immediately
    if (!accessToken || !user) {
      setItems([]);
      loadedUserIdRef.current = null;
      return;
    }

    // Same user — skip re-fetch
    if (loadedUserIdRef.current === user.id) {
      return;
    }

    // New user — clear previous data, then load theirs
    setItems([]);
    loadedUserIdRef.current = user.id;

    getWishlist(accessToken)
      .then((response) => {
        setItems(mapProductsToWishlistItems(response.data.items || []));
      })
      .catch(() => {
        setItems([]);
      });
  }, [accessToken, user]);

  const addToWishlist = useCallback(
    async (item: WishlistItem) => {
      if (accessToken && item.backendProductId) {
        try {
          const response = await addWishlistItem(accessToken, item.backendProductId);
          setItems(mapProductsToWishlistItems(response.data.items || []));
          return;
        } catch {
          // Fall through to local-only add
        }
      }

      setItems((current) => {
        if (current.some((existing) => matchesWishlistItem(existing, item.slug))) {
          return current;
        }
        return [...current, item];
      });
    },
    [accessToken]
  );

  const removeFromWishlist = useCallback(
    async (identifier: string) => {
      const currentItem = items.find((item) => matchesWishlistItem(item, identifier));

      if (accessToken && currentItem?.backendProductId) {
        try {
          const response = await removeWishlistItem(accessToken, currentItem.backendProductId);
          setItems(mapProductsToWishlistItems(response.data.items || []));
          return;
        } catch {
          // Fall through to local-only remove
        }
      }

      setItems((current) => current.filter((item) => !matchesWishlistItem(item, identifier)));
    },
    [accessToken, items]
  );

  const toggleWishlist = useCallback(
    async (item: WishlistItem) => {
      const exists = items.some((existing) => matchesWishlistItem(existing, item.slug));
      if (exists) {
        await removeFromWishlist(item.backendProductId || item.slug);
        return;
      }

      await addToWishlist(item);
    },
    [addToWishlist, items, removeFromWishlist]
  );

  const isWishlisted = useCallback(
    (identifier: string) => items.some((item) => matchesWishlistItem(item, identifier)),
    [items]
  );

  const value = useMemo(
    () => ({ items, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted }),
    [addToWishlist, isWishlisted, items, removeFromWishlist, toggleWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
