import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createId } from "../lib/id";
import { readJson, removeKey, writeJson } from "../lib/storage";
import { normalizeDietDuration } from "../lib/duration";
import type { CartContextValue, CartItem, CartState } from "../types";
import { useAuth } from "./AuthProvider";

const LEGACY_CART_KEY = "twojadieta.v1.cart" as const;
const CARTS_KEY = "twojadieta.v1.carts" as const;

const CartContext = createContext<CartContextValue | null>(null);

const initialState: CartState = {
  items: [],
  couponCode: "",
};

type CartStore = {
  guest: CartState;
  users: Record<string, CartState>;
};

function normalizeCart(cart: CartState): CartState {
  return {
    ...cart,
    items: cart.items.map((item) => ({ ...item, days: normalizeDietDuration(item.days) })),
  };
}

function mergeCarts(existing: CartState, incoming: CartState): CartState {
  const items = [...existing.items];
  for (const item of incoming.items) {
    const matchingIndex = items.findIndex(
      (existingItem) =>
        existingItem.dietId === item.dietId &&
        existingItem.calories === item.calories &&
        existingItem.startDate === item.startDate,
    );
    if (matchingIndex >= 0) {
      items[matchingIndex] = item;
    } else {
      items.unshift(item);
    }
  }
  return {
    items,
    couponCode: incoming.couponCode || existing.couponCode,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const ownerId = user?.id ?? null;
  const [carts, setCarts] = useState<CartStore>(() => {
    const stored = readJson<CartStore | null>(CARTS_KEY, null);
    if (stored !== null) {
      const normalized = {
        guest: normalizeCart(stored.guest),
        users: Object.fromEntries(
          Object.entries(stored.users).map(([userId, cart]) => [userId, normalizeCart(cart)]),
        ),
      };
      writeJson<CartStore>(CARTS_KEY, normalized);
      return normalized;
    }

    const legacyCart = normalizeCart(readJson<CartState>(LEGACY_CART_KEY, initialState));
    const migrated: CartStore = {
      guest: ownerId ? initialState : legacyCart,
      users: ownerId ? { [ownerId]: legacyCart } : {},
    };
    writeJson<CartStore>(CARTS_KEY, migrated);
    removeKey(LEGACY_CART_KEY);
    return migrated;
  });

  const previousOwnerId = useRef<string | null>(ownerId);

  useEffect(() => {
    const previousOwner = previousOwnerId.current;
    if (previousOwner === null && ownerId !== null) {
      setCarts((current) => {
        if (current.guest.items.length === 0 && !current.guest.couponCode) {
          return current;
        }
        const next: CartStore = {
          guest: initialState,
          users: {
            ...current.users,
            [ownerId]: mergeCarts(current.users[ownerId] ?? initialState, current.guest),
          },
        };
        writeJson<CartStore>(CARTS_KEY, next);
        return next;
      });
    }
    previousOwnerId.current = ownerId;
  }, [ownerId]);

  const cart = ownerId ? carts.users[ownerId] ?? initialState : carts.guest;

  const value: CartContextValue = useMemo(() => {
    function persist(next: CartState) {
      setCarts((current) => {
        const nextCarts: CartStore = ownerId
          ? { ...current, users: { ...current.users, [ownerId]: next } }
          : { ...current, guest: next };
        writeJson<CartStore>(CARTS_KEY, nextCarts);
        return nextCarts;
      });
    }

    return {
      cart,
      items: cart.items,
      couponCode: cart.couponCode,

      addItem: ({ dietId, calories, days, startDate }) => {
        const normalizedDays = normalizeDietDuration(days);
        const existing = cart.items.find(
          (i) => i.dietId === dietId && i.calories === calories && i.startDate === startDate,
        );
        if (existing) {
          const nextItems = cart.items.map((i) => (i.id === existing.id ? { ...i, days: normalizedDays } : i));
          persist({ ...cart, items: nextItems });
          return existing.id;
        }

        const item: CartItem = {
          id: createId("cart"),
          dietId,
          calories,
          days: normalizedDays,
          startDate,
        };
        persist({ ...cart, items: [item, ...cart.items] });
        return item.id;
      },

      updateItem: (cartItemId, patch) => {
        const normalizedPatch = patch.days === undefined ? patch : { ...patch, days: normalizeDietDuration(patch.days) };
        const nextItems = cart.items.map((i) => (i.id === cartItemId ? { ...i, ...normalizedPatch } : i));
        persist({ ...cart, items: nextItems });
      },

      removeItem: (cartItemId) => {
        persist({ ...cart, items: cart.items.filter((i) => i.id !== cartItemId) });
      },

      clearCart: () => {
        persist(initialState);
      },

      setCouponCode: (code) => {
        persist({ ...cart, couponCode: code });
      },
    };
  }, [cart, ownerId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
