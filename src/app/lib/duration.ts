export const DIET_DURATION_OPTIONS = [5, 10, 14, 21, 28] as const;

export function normalizeDietDuration(days: number): number {
  return DIET_DURATION_OPTIONS.reduce((closest, option) =>
    Math.abs(option - days) < Math.abs(closest - days) ? option : closest,
  );
}
