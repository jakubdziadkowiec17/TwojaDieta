import type { DiscountCode } from "../types";

export function calculateDiscount(
  discountCodes: DiscountCode[],
  couponCode: string,
  subtotal: number,
): { appliedCode: DiscountCode | null; amount: number } {
  const normalizedCode = couponCode.trim().toUpperCase();
  const appliedCode = discountCodes.find((discount) => discount.active && discount.code === normalizedCode) ?? null;

  if (!appliedCode) {
    return { appliedCode: null, amount: 0 };
  }

  if (appliedCode.kind === "percentage") {
    return { appliedCode, amount: Math.min(subtotal, Math.round(subtotal * appliedCode.value / 100)) };
  }

  return { appliedCode, amount: Math.min(subtotal, appliedCode.value) };
}
