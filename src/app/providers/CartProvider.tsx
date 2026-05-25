import React, { createContext, useContext, useMemo, useState } from "react";
import { createId } from "../lib/id";
import { readJson, writeJson } from "../lib/storage";
import type { CartContextValue, CartItem, CartState } from "../types";

const CART_KEY = "twojadieta.v1.cart" as const;

const CartContext = createContext<CartContextValue | null>(null);

const initialState: CartState = {
  items: [],
  couponCode: "",
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(() => readJson<CartState>(CART_KEY, initialState));

  const value: CartContextValue = useMemo(() => {
    function persist(next: CartState) {
      setCart(next);
      writeJson<CartState>(CART_KEY, next);
    }

    return {
      cart,
      items: cart.items,
      couponCode: cart.couponCode,

      addItem: ({ dietId, calories, days, startDate }) => {
        const existing = cart.items.find(
          (i) => i.dietId === dietId && i.calories === calories && i.startDate === startDate,
        );
        if (existing) {
          const nextItems = cart.items.map((i) => (i.id === existing.id ? { ...i, days } : i));
          persist({ ...cart, items: nextItems });
          return existing.id;
        }

        const item: CartItem = {
          id: createId("cart"),
          dietId,
          calories,
          days,
          startDate,
        };
        persist({ ...cart, items: [item, ...cart.items] });
        return item.id;
      },

      updateItem: (cartItemId, patch) => {
        const nextItems = cart.items.map((i) => (i.id === cartItemId ? { ...i, ...patch } : i));
        persist({ ...cart, items: nextItems });
      },

      removeItem: (cartItemId) => {
        persist({ ...cart, items: cart.items.filter((i) => i.id !== cartItemId) });
      },

      clearCart: () => {
        persist({ ...cart, items: [] });
      },

      setCouponCode: (code) => {
        persist({ ...cart, couponCode: code });
      },
    };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
