export function createId(prefix: string): string {
  // Good-enough for frontend-only mock IDs.
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
