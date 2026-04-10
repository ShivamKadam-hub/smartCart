import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addCartItem,
  clearCart as clearBackendCart,
  getCart,
  removeCartItem,
  saveCartItemForLater,
  moveSavedItemToCart,
  removeSavedCartItem,
  updateCartItem,
} from "@/lib/api";
import { useAuth } from "./AuthContext";

export type CartProduct = {
  id: number | string;
  name: string;
  description: string;
  price: number;
  img: string;
  label?: string;
  originalPrice?: number;
  color?: string;
  quantity: number;
  backendProductId?: string;
  backendCartItemId?: string;
};

type AddToCartPayload = Omit<CartProduct, "quantity">;

type CartContextValue = {
  cartItems: CartProduct[];
  savedItems: CartProduct[];
  totalItemCount: number;
  addToCart: (product: AddToCartPayload) => Promise<void>;
  updateQuantity: (id: number | string, amount: number) => Promise<void>;
  removeFromCart: (id: number | string) => Promise<void>;
  saveForLater: (id: number | string) => Promise<void>;
  moveToCart: (id: number | string) => Promise<void>;
  removeSavedItem: (id: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [savedItems, setSavedItems] = useState<CartProduct[]>([]);

  const totalItemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const hydrateFromBackend = useCallback(async () => {
    if (!accessToken || !user) {
      // Not logged in — keep local cart items as-is
      return;
    }

    const response = await getCart(accessToken);
    const nextCartItems = (response.data.items || []).map((item) => ({
      id: item.id,
      backendCartItemId: item.id,
      backendProductId: item.productId,
      name: item.name,
      description: item.product?.description || item.name,
      price: item.price,
      img: item.product?.imageUrl || "",
      label: item.product?.category,
      quantity: item.quantity,
    }));
    const nextSavedItems = (response.data.savedForLater || []).map((item) => ({
      id: item.id,
      backendCartItemId: item.id,
      backendProductId: item.productId,
      name: item.name,
      description: item.name,
      price: item.price,
      img: "",
      label: "Saved",
      quantity: item.quantity,
    }));

    setCartItems(nextCartItems);
    setSavedItems(nextSavedItems);
  }, [accessToken, user]);

  useEffect(() => {
    void hydrateFromBackend().catch(() => {
      // Backend fetch failed — keep existing local cart items
    });
  }, [hydrateFromBackend]);

  const addToCart = useCallback(async (product: AddToCartPayload) => {
    if (accessToken && product.backendProductId) {
      try {
        const response = await addCartItem(accessToken, {
          productId: product.backendProductId,
          quantity: 1,
        });
        const nextCartItems = (response.data.items || []).map((item) => ({
          id: item.id,
          backendCartItemId: item.id,
          backendProductId: item.productId,
          name: item.name,
          description: item.product?.description || item.name,
          price: item.price,
          img: item.product?.imageUrl || "",
          label: item.product?.category,
          quantity: item.quantity,
        }));
        const nextSavedItems = (response.data.savedForLater || []).map((item) => ({
          id: item.id,
          backendCartItemId: item.id,
          backendProductId: item.productId,
          name: item.name,
          description: item.name,
          price: item.price,
          img: "",
          label: "Saved",
          quantity: item.quantity,
        }));
        setCartItems(nextCartItems);
        setSavedItems(nextSavedItems);
        return;
      } catch {
        // Fall through to local-only add
      }
    }

    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }, [accessToken]);

  const updateQuantity = useCallback(async (id: number | string, amount: number) => {
    const item = cartItems.find((entry) => entry.id === id);
    if (accessToken && item?.backendCartItemId) {
      try {
        const nextQuantity = Math.max(1, item.quantity + amount);
        const response = await updateCartItem(accessToken, item.backendCartItemId, {
          quantity: nextQuantity,
        });
        const nextCartItems = (response.data.items || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.product?.description || entry.name,
          price: entry.price,
          img: entry.product?.imageUrl || "",
          label: entry.product?.category,
          quantity: entry.quantity,
        }));
        const nextSavedItems = (response.data.savedForLater || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.name,
          price: entry.price,
          img: "",
          label: "Saved",
          quantity: entry.quantity,
        }));
        setCartItems(nextCartItems);
        setSavedItems(nextSavedItems);
        return;
      } catch {
        // Fall through to local-only update
      }
    }

    setCartItems((current) =>
      current
        .map((entry) =>
          entry.id === id
            ? { ...entry, quantity: Math.max(0, entry.quantity + amount) }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  }, [accessToken, cartItems]);

  const removeFromCart = useCallback(async (id: number | string) => {
    const item = cartItems.find((entry) => entry.id === id);
    if (accessToken && item?.backendCartItemId) {
      try {
        const response = await removeCartItem(accessToken, item.backendCartItemId);
        const nextCartItems = (response.data.items || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.product?.description || entry.name,
          price: entry.price,
          img: entry.product?.imageUrl || "",
          label: entry.product?.category,
          quantity: entry.quantity,
        }));
        const nextSavedItems = (response.data.savedForLater || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.name,
          price: entry.price,
          img: "",
          label: "Saved",
          quantity: entry.quantity,
        }));
        setCartItems(nextCartItems);
        setSavedItems(nextSavedItems);
        return;
      } catch {
        // Fall through to local-only remove
      }
    }

    setCartItems((current) => current.filter((entry) => entry.id !== id));
  }, [accessToken, cartItems]);

  const saveForLater = useCallback(async (id: number | string) => {
    const item = cartItems.find((entry) => entry.id === id);
    if (accessToken && item?.backendCartItemId) {
      try {
        const response = await saveCartItemForLater(accessToken, item.backendCartItemId);
        const nextCartItems = (response.data.items || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.product?.description || entry.name,
          price: entry.price,
          img: entry.product?.imageUrl || "",
          label: entry.product?.category,
          quantity: entry.quantity,
        }));
        const nextSavedItems = (response.data.savedForLater || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.name,
          price: entry.price,
          img: "",
          label: "Saved",
          quantity: entry.quantity,
        }));
        setCartItems(nextCartItems);
        setSavedItems(nextSavedItems);
        return;
      } catch {
        // Fall through to local-only save
      }
    }

    setCartItems((current) => {
      const found = current.find((entry) => entry.id === id);
      if (!found) return current;
      setSavedItems((saved) => {
        const alreadySaved = saved.find((entry) => entry.id === found.id);
        if (alreadySaved) return saved;
        return [...saved, { ...found, quantity: 1 }];
      });
      return current.filter((entry) => entry.id !== id);
    });
  }, [accessToken, cartItems]);

  const moveToCart = useCallback(async (id: number | string) => {
    const item = savedItems.find((entry) => entry.id === id);
    if (accessToken && item?.backendCartItemId) {
      try {
        const response = await moveSavedItemToCart(accessToken, item.backendCartItemId);
        const nextCartItems = (response.data.items || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.product?.description || entry.name,
          price: entry.price,
          img: entry.product?.imageUrl || "",
          label: entry.product?.category,
          quantity: entry.quantity,
        }));
        const nextSavedItems = (response.data.savedForLater || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.name,
          price: entry.price,
          img: "",
          label: "Saved",
          quantity: entry.quantity,
        }));
        setCartItems(nextCartItems);
        setSavedItems(nextSavedItems);
        return;
      } catch {
        // Fall through to local-only move
      }
    }

    setSavedItems((current) => {
      const found = current.find((entry) => entry.id === id);
      if (!found) return current;
      setCartItems((cart) => {
        const existing = cart.find((entry) => entry.id === found.id);
        if (existing) {
          return cart.map((entry) =>
            entry.id === found.id
              ? { ...entry, quantity: entry.quantity + found.quantity }
              : entry
          );
        }
        return [...cart, { ...found }];
      });
      return current.filter((entry) => entry.id !== id);
    });
  }, [accessToken, savedItems]);

  const removeSavedItem = useCallback(async (id: number | string) => {
    const item = savedItems.find((entry) => entry.id === id);
    if (accessToken && item?.backendCartItemId) {
      try {
        const response = await removeSavedCartItem(accessToken, item.backendCartItemId);
        const nextCartItems = (response.data.items || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.product?.description || entry.name,
          price: entry.price,
          img: entry.product?.imageUrl || "",
          label: entry.product?.category,
          quantity: entry.quantity,
        }));
        const nextSavedItems = (response.data.savedForLater || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.name,
          price: entry.price,
          img: "",
          label: "Saved",
          quantity: entry.quantity,
        }));
        setCartItems(nextCartItems);
        setSavedItems(nextSavedItems);
        return;
      } catch {
        // Fall through to local-only remove
      }
    }

    setSavedItems((current) => current.filter((entry) => entry.id !== id));
  }, [accessToken, savedItems]);

  const clearCart = useCallback(async () => {
    if (accessToken) {
      try {
        const response = await clearBackendCart(accessToken);
        const nextCartItems = (response.data.items || []).map((entry) => ({
          id: entry.id,
          backendCartItemId: entry.id,
          backendProductId: entry.productId,
          name: entry.name,
          description: entry.product?.description || entry.name,
          price: entry.price,
          img: entry.product?.imageUrl || "",
          label: entry.product?.category,
          quantity: entry.quantity,
        }));
        setCartItems(nextCartItems);
        setSavedItems([]);
        return;
      } catch {
        // Fall through to local-only clear
      }
    }

    setCartItems([]);
  }, [accessToken]);

  const value = useMemo(
    () => ({
      cartItems,
      savedItems,
      totalItemCount,
      addToCart,
      updateQuantity,
      removeFromCart,
      saveForLater,
      moveToCart,
      removeSavedItem,
      clearCart,
    }),
    [cartItems, savedItems, totalItemCount, addToCart, updateQuantity, removeFromCart, saveForLater, moveToCart, removeSavedItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}
