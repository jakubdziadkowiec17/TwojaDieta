export const FREE_DELIVERY_THRESHOLD = 250;
export const STANDARD_DELIVERY_COST = 15;

export function calculateDeliveryCost(subtotal: number, itemCount: number): number {
  if (itemCount === 0) {
    return 0;
  }

  return subtotal > FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_COST;
}
