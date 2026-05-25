import type { Diet, DietVariant } from "../types";

type LegacyDiet = Omit<Diet, "variants"> & {
  variants?: DietVariant[];
  calorieOptions?: number[];
  pricePerDay?: number;
};

function uniqueSortedVariants(variants: DietVariant[]): DietVariant[] {
  const byCalories = new Map<number, DietVariant>();
  variants.forEach((variant) => {
    if (Number.isFinite(variant.calories) && variant.calories > 0 && Number.isFinite(variant.pricePerDay) && variant.pricePerDay > 0) {
      byCalories.set(variant.calories, variant);
    }
  });
  return [...byCalories.values()].sort((a, b) => a.calories - b.calories);
}

export function createVariantsFromLegacy(calories: number[], pricePerDay: number): DietVariant[] {
  const options = [...new Set(calories.filter((caloriesValue) => Number.isFinite(caloriesValue) && caloriesValue > 0))]
    .sort((a, b) => a - b);
  return (options.length ? options : [1500]).map((caloriesValue, index) => ({
    calories: caloriesValue,
    pricePerDay: pricePerDay + index * 5,
  }));
}

export function normalizeDietVariants(diet: LegacyDiet): Diet {
  const variants = uniqueSortedVariants(diet.variants ?? []);
  const nextVariants = variants.length
    ? variants
    : createVariantsFromLegacy(diet.calorieOptions ?? [1500], diet.pricePerDay ?? 59);
  const { calorieOptions: _calorieOptions, pricePerDay: _pricePerDay, ...nextDiet } = diet;
  return { ...nextDiet, variants: nextVariants };
}

export function getMinPrice(diet: Diet): number {
  return Math.min(...diet.variants.map((variant) => variant.pricePerDay));
}

export function getVariantPrice(diet: Diet, calories: number): number {
  return diet.variants.find((variant) => variant.calories === calories)?.pricePerDay ?? getMinPrice(diet);
}

export function formatVariantsInput(variants: DietVariant[]): string {
  return variants.map((variant) => `${variant.calories}:${variant.pricePerDay}`).join(", ");
}

export function parseVariantsInput(value: string): DietVariant[] {
  return uniqueSortedVariants(
    value.split(",").map((entry) => {
      const [calories, pricePerDay] = entry.split(":").map((part) => Number(part.trim()));
      return { calories, pricePerDay };
    }),
  );
}
