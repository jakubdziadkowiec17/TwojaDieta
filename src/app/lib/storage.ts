export type StorageKey =
  | "twojadieta.v1.diets"
  | "twojadieta.v1.orders"
  | "twojadieta.v1.reviews"
  | "twojadieta.v1.users"
  | "twojadieta.v1.session"
  | "twojadieta.v1.cart";

export function readJson<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: StorageKey, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key: StorageKey): void {
  localStorage.removeItem(key);
}
