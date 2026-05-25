import React, { createContext, useContext, useMemo, useState } from "react";
import { createId } from "../lib/id";
import { getVariantPrice, normalizeDietVariants } from "../lib/dietVariants";
import { calculateDeliveryCost } from "../lib/pricing";
import { readJson, writeJson } from "../lib/storage";
import { validateCouponCode } from "../lib/validation";
import type {
  DataContextValue,
  Diet,
  DiscountCode,
  DiscountKind,
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
const DISCOUNT_CODES_KEY = "twojadieta.v1.discountCodes" as const;

const DataContext = createContext<DataContextValue | null>(null);

function sortByCreatedDesc<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function applyDeliveryPricing(order: Order): Order {
  const deliveryCost = calculateDeliveryCost(order.subtotal, order.items.length);
  const total = Math.max(0, order.subtotal + deliveryCost - order.discountAmount);
  return { ...order, deliveryCost, total, paymentStatus: order.paymentStatus ?? "Opłacone" };
}

const PREVIOUS_DEFAULT_VARIANTS: Record<string, Array<Array<{ calories: number; pricePerDay: number }>>> = {
  "1": [
    [
      { calories: 1200, pricePerDay: 59 },
      { calories: 1500, pricePerDay: 64 },
      { calories: 1800, pricePerDay: 69 },
      { calories: 2000, pricePerDay: 74 },
      { calories: 2500, pricePerDay: 79 },
    ],
    [
      { calories: 1200, pricePerDay: 59 },
      { calories: 1500, pricePerDay: 64 },
      { calories: 1800, pricePerDay: 69 },
      { calories: 2000, pricePerDay: 74 },
      { calories: 2500, pricePerDay: 84 },
    ],
  ],
  "2": [
    [
      { calories: 1500, pricePerDay: 69 },
      { calories: 1800, pricePerDay: 74 },
      { calories: 2000, pricePerDay: 79 },
      { calories: 2500, pricePerDay: 84 },
      { calories: 3000, pricePerDay: 89 },
    ],
    [
      { calories: 1500, pricePerDay: 69 },
      { calories: 1800, pricePerDay: 74 },
      { calories: 2000, pricePerDay: 79 },
      { calories: 2500, pricePerDay: 89 },
      { calories: 3000, pricePerDay: 99 },
    ],
  ],
  "3": [[
    { calories: 1200, pricePerDay: 67 },
    { calories: 1500, pricePerDay: 72 },
    { calories: 1800, pricePerDay: 77 },
    { calories: 2000, pricePerDay: 82 },
  ]],
  "4": [[
    { calories: 1200, pricePerDay: 74 },
    { calories: 1500, pricePerDay: 79 },
    { calories: 1800, pricePerDay: 84 },
    { calories: 2000, pricePerDay: 89 },
  ]],
  "5": [
    [
      { calories: 2000, pricePerDay: 79 },
      { calories: 2500, pricePerDay: 84 },
      { calories: 3000, pricePerDay: 89 },
      { calories: 3500, pricePerDay: 94 },
    ],
    [
      { calories: 2000, pricePerDay: 79 },
      { calories: 2500, pricePerDay: 89 },
      { calories: 3000, pricePerDay: 99 },
      { calories: 3500, pricePerDay: 109 },
    ],
  ],
};

const PREVIOUS_DEFAULT_CONTENT: Record<string, {
  shortDescription: string;
  description: string;
  tags?: string[];
  allergens?: string[];
}> = {
  "1": {
    shortDescription: "Zrównoważona dieta dla każdego",
    description: "Klasyczna dieta oparta na zrównoważonych proporcjach makroskładników. Idealna dla osób prowadzących aktywny tryb życia i dbających o zdrowe nawyki żywieniowe.",
    allergens: ["Gluten", "Mleko"],
  },
  "2": {
    shortDescription: "Dla aktywnych i sportowców",
    description: "Dieta wysokobiałkowa stworzona z myślą o osobach aktywnych fizycznie i sportowcach. Wspiera budowę masy mięśniowej i regenerację po treningach.",
  },
  "3": {
    shortDescription: "Roślinne smaki bez mięsa",
    description: "Dieta wegetariańska bogata w warzywa, owoce, nasiona i rośliny strączkowe. Dostarcza wszystkich niezbędnych składników odżywczych bez mięsa.",
    tags: ["Wegetariańska", "Wegańska"],
  },
  "4": {
    shortDescription: "Niskowęglowodanowa dla redukcji",
    description: "Dieta ketogeniczna oparta na wysokiej zawartości tłuszczy i niskiej węglowodanów. Skutecznie wspiera proces spalania tkanki tłuszczowej.",
    allergens: ["Mleko", "Jaja"],
  },
  "5": {
    shortDescription: "Maksymalna energia dla sportowców",
    description: "Zaawansowana dieta dla profesjonalnych sportowców i osób intensywnie trenujących. Optymalizuje wydolność i wspiera regenerację.",
    allergens: ["Mleko", "Jaja", "Gluten"],
  },
};

function migrateDefaultDietPricing(diet: Diet): Diet {
  const previous = PREVIOUS_DEFAULT_VARIANTS[diet.id];
  const currentDefault = seedDiets.find((seedDiet) => seedDiet.id === diet.id);
  const isPreviousDefault = previous?.some((variants) => JSON.stringify(diet.variants) === JSON.stringify(variants));
  if (!isPreviousDefault || !currentDefault) return diet;
  return { ...diet, variants: currentDefault.variants };
}

function migrateDefaultDietContent(diet: Diet): Diet {
  const previous = PREVIOUS_DEFAULT_CONTENT[diet.id];
  const currentDefault = seedDiets.find((seedDiet) => seedDiet.id === diet.id);
  if (!previous || !currentDefault) return diet;

  return {
    ...diet,
    shortDescription: diet.shortDescription === previous.shortDescription
      ? currentDefault.shortDescription
      : diet.shortDescription,
    description: diet.description === previous.description
      ? currentDefault.description
      : diet.description,
    tags: previous.tags && JSON.stringify(diet.tags) === JSON.stringify(previous.tags)
      ? currentDefault.tags
      : diet.tags,
    allergens: previous.allergens && JSON.stringify(diet.allergens) === JSON.stringify(previous.allergens)
      ? currentDefault.allergens
      : diet.allergens,
  };
}

function migrateSeedOrderPricing(order: Order, diets: Diet[]): Order {
  if (!order.id.startsWith("ord_seed_")) return applyDeliveryPricing(order);
  const items = order.items.map((item) => {
    const diet = diets.find((dietValue) => dietValue.id === item.dietId);
    return diet ? { ...item, pricePerDay: getVariantPrice(diet, item.calories) } : item;
  });
  const subtotal = items.reduce((sum, item) => sum + item.pricePerDay * item.days, 0);
  return applyDeliveryPricing({ ...order, items, subtotal });
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [diets, setDiets] = useState<Diet[]>(() => {
    const stored = readJson<Diet[] | null>(DIETS_KEY, null);
    const next = (stored ?? seedDiets).map((diet) =>
      migrateDefaultDietContent(migrateDefaultDietPricing(normalizeDietVariants(diet))),
    );
    writeJson<Diet[]>(DIETS_KEY, next);
    return next;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = readJson<Order[] | null>(ORDERS_KEY, null);
    const next = (stored ?? seedOrders).map((order) => migrateSeedOrderPricing(order, diets));
    writeJson<Order[]>(ORDERS_KEY, next);
    return next;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = readJson<Review[] | null>(REVIEWS_KEY, null);
    if (stored !== null) return stored;
    writeJson<Review[]>(REVIEWS_KEY, seedReviews);
    return seedReviews;
  });

  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(() => {
    return readJson<DiscountCode[]>(DISCOUNT_CODES_KEY, []);
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

    function persistDiscountCodes(next: DiscountCode[]) {
      setDiscountCodes(next);
      writeJson<DiscountCode[]>(DISCOUNT_CODES_KEY, next);
    }

    return {
      diets,
      orders: sortByCreatedDesc(orders),
      reviews: sortByCreatedDesc(reviews),
      discountCodes: sortByCreatedDesc(discountCodes),

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
        const order = applyDeliveryPricing({
          id: createId("ord"),
          createdAt: now,
          status: "Nowe",
          paymentStatus: "Opłacone",
          ...input,
        });
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

      addDiscountCode: ({ code, kind, value }) => {
        const normalizedCode = code.trim().toUpperCase();
        const codeError = validateCouponCode(normalizedCode, true);
        if (codeError) return { ok: false, error: codeError };
        if (discountCodes.some((discount) => discount.code === normalizedCode)) {
          return { ok: false, error: "Kod o tej nazwie już istnieje." };
        }
        if (!Number.isFinite(value) || value <= 0) {
          return { ok: false, error: "Podaj dodatnią wartość rabatu." };
        }
        if (kind === "percentage" && value > 100) {
          return { ok: false, error: "Rabat procentowy nie może przekraczać 100%." };
        }

        const discountCode: DiscountCode = {
          id: createId("discount"),
          code: normalizedCode,
          kind: kind as DiscountKind,
          value,
          active: true,
          createdAt: new Date().toISOString(),
        };
        persistDiscountCodes([discountCode, ...discountCodes]);
        return { ok: true };
      },

      setDiscountCodeActive: (discountCodeId, active) => {
        persistDiscountCodes(discountCodes.map((discount) =>
          discount.id === discountCodeId ? { ...discount, active } : discount,
        ));
      },

      deleteDiscountCode: (discountCodeId) => {
        persistDiscountCodes(discountCodes.filter((discount) => discount.id !== discountCodeId));
      },
    };
  }, [diets, orders, reviews, discountCodes]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
