import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

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
};

type AddToCartPayload = Omit<CartProduct, "quantity">;

type CartContextValue = {
  cartItems: CartProduct[];
  savedItems: CartProduct[];
  totalItemCount: number;
  addToCart: (product: AddToCartPayload) => void;
  updateQuantity: (id: number | string, amount: number) => void;
  removeFromCart: (id: number | string) => void;
  saveForLater: (id: number | string) => void;
  moveToCart: (id: number | string) => void;
  removeSavedItem: (id: number | string) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [savedItems, setSavedItems] = useState<CartProduct[]>([]);

  const totalItemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const addToCart = useCallback((product: AddToCartPayload) => {
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
  }, []);

  const updateQuantity = useCallback((id: number | string, amount: number) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: number | string) => {
    setCartItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const saveForLater = useCallback((id: number | string) => {
    setCartItems((current) => {
      const item = current.find((product) => product.id === id);
      if (!item) return current;
      setSavedItems((saved) => {
        const alreadySaved = saved.find((product) => product.id === item.id);
        if (alreadySaved) return saved;
        return [...saved, { ...item, quantity: 1 }];
      });
      return current.filter((product) => product.id !== id);
    });
  }, []);

  const moveToCart = useCallback((id: number | string) => {
    setSavedItems((current) => {
      const item = current.find((product) => product.id === id);
      if (!item) return current;
      setCartItems((cart) => {
        const existing = cart.find((product) => product.id === item.id);
        if (existing) {
          return cart.map((product) =>
            product.id === item.id
              ? { ...product, quantity: product.quantity + item.quantity }
              : product
          );
        }
        return [...cart, { ...item }];
      });
      return current.filter((product) => product.id !== id);
    });
  }, []);

  const removeSavedItem = useCallback((id: number | string) => {
    setSavedItems((current) => current.filter((item) => item.id !== id));
  }, []);

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
    }),
    [cartItems, savedItems, totalItemCount, addToCart, updateQuantity, removeFromCart, saveForLater, moveToCart]
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
