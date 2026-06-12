export function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function randomChoice<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function combination(n: number, k: number) {
  if (k < 0 || k > n) return 0;
  const size = Math.min(k, n - k);
  let result = 1;
  for (let index = 1; index <= size; index += 1) {
    result = (result * (n - size + index)) / index;
  }
  return result;
}

export function gcd(a: number, b: number): number {
  const nextA = Math.abs(a);
  const nextB = Math.abs(b);
  if (nextB === 0) return nextA;
  return gcd(nextB, nextA % nextB);
}

export function formatPercent(value: number, decimals = 2) {
  const formatted = (value * 100).toFixed(decimals);
  return `${decimals === 0 ? formatted : formatted.replace(/\.?0+$/, "")}%`;
}

export function readStoredNumber(key: string) {
  if (typeof window === "undefined") return 0;

  try {
    const value = Number(window.localStorage.getItem(key) ?? 0);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function writeStoredNumber(key: string, value: number) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, String(value));
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function formatNumber(value: number, decimals = 2) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(decimals).replace(/\.?0+$/, "");
}

export function scheduleAutoAdvance(next: () => void, delay = 1200) {
  if (typeof window === "undefined") return;
  window.setTimeout(next, delay);
}
