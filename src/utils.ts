/**
 * Funções utilitárias puras — sem estado, sem side-effects.
 * Cada função pode ser importada individualmente (tree-shake).
 */

import type { RGB } from "./types";

// ─── Checagem de valor ──────────────────────────────────────────────────────

/** Retorna `true` se o valor não for `null`, `undefined`, nem string vazia (quando `noEmpty = true`). */
export function isset(value: unknown, noEmpty = true): boolean {
  if (value === null || value === undefined) return false;
  if (noEmpty && typeof value === "string") return value !== "";
  return true;
}

/** Retorna `true` se **todos** os valores passarem em `isset`. */
export function allSet(...values: unknown[]): boolean {
  return values.every((v) => isset(v));
}

/** Checa se um caminho de propriedades existe em um objeto. */
export function resolves(path: string, obj: Record<string, unknown>): boolean {
  let current: unknown = obj;
  for (const key of path.split(".")) {
    if (current == null || typeof current !== "object") return false;
    current = (current as Record<string, unknown>)[key];
    if (current === undefined) return false;
  }
  return true;
}

// ─── Strings ────────────────────────────────────────────────────────────────

/** Verifica se `value` é uma string. */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/** Remove espaços extras e faz trim. */
export function trimSpaces(text: unknown): string {
  if (!isString(text)) return text == null ? "" : String(text);
  return text.replace(/\s+/g, " ").trim();
}

/** Divide `text` por `splitter` e faz trim em cada item. */
export function createList(
  text: string,
  splitter = ",",
  removeEmpty = false,
): string[] {
  if (!isString(text)) return [];
  const list = text.split(splitter).map((s) => trimSpaces(s));
  return removeEmpty ? list.filter((s) => s !== "") : list;
}

/** Checa se `text` contém `snippet`. */
export function containsText(
  text: string,
  snippet: string,
  caseSensitive = false,
): boolean {
  if (!isString(text) || !isString(snippet)) return false;
  if (!allSet(text, snippet)) return false;
  if (caseSensitive) return text.includes(snippet);
  return text.toLowerCase().includes(snippet.toLowerCase());
}

// ─── Regex ──────────────────────────────────────────────────────────────────

/** Testa se `text` dá match com `regex`. */
export function matchesRegex(text: string, regex: RegExp): boolean {
  if (!allSet(text, regex)) return false;
  return regex.test(text);
}

/** Retorna os named groups de um regex match, ou `null`. */
export function matchRegexGroups(
  text: string,
  regex: RegExp,
): Record<string, string> | null {
  const match = regex.exec(text);
  return (match?.groups as Record<string, string> | undefined) ?? null;
}

// ─── Números ────────────────────────────────────────────────────────────────

/** Checa se `dividend` é divisível por `divisor`. */
export function divisibleBy(dividend: number, divisor: number): boolean {
  return divisor !== 0 && dividend % divisor === 0;
}

/** Checa se o número é inteiro. */
export function isWholeNumber(n: number): boolean {
  return Number.isInteger(n);
}

/** Iterador circular: volta a 0 quando `i >= max`. */
export function nextIterator(i: number, max: number, step = 1): number {
  return Math.abs(i) >= Math.abs(max) ? 0 : i + step;
}

/** Formata número com padding de zeros (ex: "01", "09"). */
export function formatTimerValue(n: number): string {
  return String(n).padStart(2, "0");
}

/** Número inteiro aleatório entre `min` e `max` (inclusivo). */
export function getRandomInt(min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/** Decimal aleatório com precisão. */
export function getRandomDecimal(
  min: number,
  max: number,
  decimals = 2,
): number {
  const factor = 10 ** decimals;
  return getRandomInt(min * factor, max * factor) / factor;
}

/** Porcentagem: `(value / total) * 100`. Retorna 0 se inválido. */
export function getPercentageOf(value: number, total: number): number {
  return value > 0 && total > 0 ? (value / total) * 100 : 0;
}

// ─── Cores ──────────────────────────────────────────────────────────────────

/** Gera RGB aleatório. */
export function randomRGB(): RGB {
  return {
    r: getRandomInt(0, 255),
    g: getRandomInt(0, 255),
    b: getRandomInt(0, 255),
  };
}

/** Cor hex aleatória. Ex: `#0a3fc2`. */
export function randomHexColor(): string {
  const { r, g, b } = randomRGB();
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Cor `rgb(...)` aleatória. */
export function randomRGBColor(): string {
  const { r, g, b } = randomRGB();
  return `rgb(${r}, ${g}, ${b})`;
}

/** Cor `rgba(...)` aleatória. */
export function randomRGBAColor(alpha: number): string {
  const a = alpha >= 0 && alpha <= 1 ? alpha : 1;
  const { r, g, b } = randomRGB();
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ─── Moeda ──────────────────────────────────────────────────────────────────

/** Formata valor monetário usando `Intl.NumberFormat`. */
export function formatCurrency(
  amount: number,
  currency: string,
  locale?: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: isWholeNumber(amount) ? 0 : 2,
  }).format(amount);
}

// ─── Case conversion ────────────────────────────────────────────────────────

/** `camelCase` → `kebab-case`. */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** `kebab-case` → `camelCase`. */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase());
}

// ─── StreamElements / Twitch helpers ────────────────────────────────────────

/**
 * Normaliza o valor de tier do StreamElements.
 *  - `"prime"` → `"prime"` (ou `1` se `primeAsTier1`)
 *  - `1000 | 1` → `1`, `2000 | 2` → `2`, `3000 | 3` → `3`
 */
export function parseTier(
  value: string | number,
  primeAsTier1 = false,
): number | "prime" {
  if (value === "prime") return primeAsTier1 ? 1 : "prime";
  const n = typeof value === "string" ? Number(value) : value;
  if (n === 1000 || n === 1) return 1;
  if (n === 2000 || n === 2) return 2;
  if (n === 3000 || n === 3) return 3;
  return 0;
}

// ─── Ambiente ───────────────────────────────────────────────────────────────

/** Checa se está rodando dentro de um OBS Browser Source. */
export function isOBSBrowserSource(): boolean {
  try {
    return "obsstudio" in window;
  } catch {
    return false;
  }
}

/** Checa se o user agent é Chrome/Chromium. */
export function isChrome(): boolean {
  try {
    return /chrom(e|ium)/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

/** Retorna a versão do Chrome (major ou full string). */
export function getChromeVersion(full = false): number | string {
  const groups = matchRegexGroups(
    navigator.userAgent,
    /chrom(?:e|ium)\/(?<version>\d+(?:\.\d+){0,3})/i,
  );
  const ver = groups?.version ?? "0";
  return full ? ver : parseInt(ver, 10);
}

// ─── Window function helpers (SE widget globals) ────────────────────────────

/** Checa se uma função global existe em `window`. */
export function funcExists(name: string): boolean {
  try {
    return typeof (window as unknown as Record<string, unknown>)[name] === "function";
  } catch {
    return false;
  }
}

/** Chama uma função global em `window`, se existir. */
export function callFunc(name: string, ...args: unknown[]): void {
  if (funcExists(name)) {
    (window as unknown as Record<string, CallableFunction>)[name](...args);
  }
}
