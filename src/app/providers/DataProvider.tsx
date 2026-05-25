import React, { createContext, useContext, useMemo, useState } from "react";
import { createId } from "../lib/id";
import { readJson, writeJson } from "../lib/storage";
import type {
  DataContextValue,
  Diet,
  Order,
  OrderCreateInput,
  OrderStatus,
  Review,
  ReviewUpsertInput,
} from "../types";
import { seedDiets, seedOrders, seedReviews } from "../data/mockData";

const DIETS_KEY = "twojadieta.v1.diets" as const;
const ORDERS_KEY = "twojadieta.v1.orders" as const;
const REVIEWS_KEY = "twojadieta.v1.reviews" as const;

const DataContext = createContext<DataContextValue | null>(null);

function sortByCreatedDesc<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [diets, setDiets] = useState<Diet[]>(() => {
    const stored = readJson<Diet[]>(DIETS_KEY, []);
    if (stored.length > 0) return stored;
    writeJson<Diet[]>(DIETS_KEY, seedDiets);
    return seedDiets;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = readJson<Order[]>(ORDERS_KEY, []);
    if (stored.length > 0) return stored;
    writeJson<Order[]>(ORDERS_KEY, seedOrders);
    return seedOrders;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = readJson<Review[]>(REVIEWS_KEY, []);
    if (stored.length > 0) return stored;
    writeJson<Review[]>(REVIEWS_KEY, seedReviews);
    return seedReviews;
  });

  const value: DataContextValue = useMemo(() => {
    function persistDiets(next: Diet[]) {
      setDiets(next);
      writeJson<Diet[]>(DIETS_KEY, next);
    }

    function persistOrders(next: Order[]) {
      setOrders(next);
      writeJson<Order[]>(ORDERS_KEY, next);
    }

    function persistReviews(next: Review[]) {
      setReviews(next);
      writeJson<Review[]>(REVIEWS_KEY, next);
    }

    return {
      diets,
      orders: sortByCreatedDesc(orders),
      reviews: sortByCreatedDesc(reviews),

      getDietById: (dietId) => diets.find((d) => d.id === dietId) ?? null,

      addDiet: (diet) => {
        const now = new Date().toISOString();
        const next: Diet = {
          ...diet,
          id: createId("diet"),
          createdAt: now,
          updatedAt: now,
        };
        persistDiets([next, ...diets]);
        return next;
      },

      updateDiet: (dietId, patch) => {
        const now = new Date().toISOString();
        const next = diets.map((d) => (d.id === dietId ? { ...d, ...patch, updatedAt: now } : d));
        persistDiets(next);
      },

      deleteDiet: (dietId) => {
        persistDiets(diets.filter((d) => d.id !== dietId));
      },

      createOrder: (input: OrderCreateInput): Order => {
        const now = new Date().toISOString();
        const order: Order = {
          id: createId("ord"),
          createdAt: now,
          status: "Nowe",
          ...input,
        };
        persistOrders([order, ...orders]);
        return order;
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        const next = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
        persistOrders(next);
      },

      upsertReview: (input: ReviewUpsertInput) => {
        const now = new Date().toISOString();
        const existing = reviews.find((r) => r.dietId === input.dietId && r.userId === input.userId);
        if (existing) {
          const next = reviews.map((r) =>
            r.id === existing.id
              ? {
                  ...r,
                  rating: input.rating,
                  comment: input.comment,
                }
              : r,
          );
          persistReviews(next);
          return;
        }

        const nextReview: Review = {
          id: createId("rev"),
          dietId: input.dietId,
          userId: input.userId,
          authorName: input.authorName,
          rating: input.rating,
          comment: input.comment,
          createdAt: now,
        };
        persistReviews([nextReview, ...reviews]);
      },

      getReviewsForDiet: (dietId: string) => reviews.filter((r) => r.dietId === dietId),
    };
  }, [diets, orders, reviews]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
