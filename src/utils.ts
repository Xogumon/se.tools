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

// ─── DOM / Async helpers ────────────────────────────────────────────────────

/** Retorna uma Promise que resolve após `ms` milissegundos. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Aplica uma animação do Animate.css a um elemento e retorna uma Promise
 * que resolve com o elemento quando a animação termina.
 *
 * @param element  Elemento DOM ou seletor CSS
 * @param animation  Nome da animação (sem prefixo, ex: `"bounceIn"`)
 * @param prefix  Prefixo das classes (padrão: `"animate__"`)
 */
export function animateCSS(
  element: Element | string,
  animation: string,
  prefix = "animate__",
): Promise<Element> {
  if (!element || !animation) {
    throw new Error("Both element and animation must be provided");
  }

  const node =
    element instanceof Element
      ? element
      : document.querySelector(element);

  if (!node) {
    throw new Error(`Element not found: ${String(element)}`);
  }

  const cls = `${prefix}${animation}`;
  node.classList.add(`${prefix}animated`, cls);

  return new Promise((resolve) => {
    node.addEventListener(
      "animationend",
      (e: Event) => {
        e.stopPropagation();
        node.classList.remove(`${prefix}animated`, cls);
        resolve(node);
      },
      { once: true },
    );
  });
}

// ─── Cor — luminância ───────────────────────────────────────────────────────

/**
 * Parsa uma cor hex (`#rgb`, `#rrggbb`) em componentes RGB.
 * Retorna `null` se o formato for inválido.
 */
export function parseHexColor(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1];
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Calcula a luminância relativa (0–1) de uma cor RGB.
 * Fórmula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function relativeLuminance({ r, g, b }: RGB): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Retorna `"dark"` ou `"light"` baseado na luminância de uma cor hex.
 * Se `invert` for `true`, retorna o contraste ideal (ex: cor do texto sobre fundo).
 *
 * Não depende de TinyColor2 — cálculo próprio via W3C relative luminance.
 *
 * @param hexColor  Cor no formato `#rgb` ou `#rrggbb`
 * @param invert    Se `true`, retorna o oposto (ideal para texto sobre a cor)
 */
export function lumeColor(hexColor: string, invert = false): "dark" | "light" {
  const rgb = parseHexColor(hexColor);
  const isDark = rgb ? relativeLuminance(rgb) < 0.179 : false;
  if (invert) return isDark ? "light" : "dark";
  return isDark ? "dark" : "light";
}

// ─── Áudio ──────────────────────────────────────────────────────────────────

export interface AudioPlayOptions {
  /** Volume de 0 a 1. @default 1 */
  readonly volume?: number;
  /** Duração máxima em segundos. 0 = sem limite. @default 0 */
  readonly maxDuration?: number;
}

/**
 * Reproduz um áudio e retorna uma Promise com a duração em segundos.
 *
 * @param url     URL do áudio
 * @param opts    Opções de reprodução
 * @param onLoad  Callback chamado com a duração em ms quando começa a tocar
 */
export function audioPlay(
  url: string,
  opts: AudioPlayOptions = {},
  onLoad?: (durationMs: number) => void,
): Promise<number> {
  return new Promise((resolve) => {
    try {
      if (!isString(url) || url === "") {
        throw new Error("URL não informada");
      }

      const { volume = 1, maxDuration = 0 } = opts;
      let timeout: ReturnType<typeof setTimeout> | undefined;

      const audio = new Audio(url);

      audio.onloadedmetadata = () => {
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.play().then(() => {
          const raw = audio.duration;
          const capped = maxDuration > 0 ? Math.min(raw, maxDuration) : raw;
          const ms = capped * 1000;

          onLoad?.(ms);

          if (isFinite(ms)) {
            timeout = setTimeout(() => resolve(raw), ms);
          }
        });
      };

      audio.onended = () => {
        clearTimeout(timeout);
        resolve(audio.duration);
      };

      audio.onerror = () => {
        clearTimeout(timeout);
        resolve(0);
      };
    } catch {
      resolve(0);
    }
  });
}

// ─── Mostrar imagem animada ─────────────────────────────────────────────────

export interface ShowImageOptions {
  /** URL da imagem */
  readonly url: string;
  /** Fator de escala (0–1). @default 0.5 */
  readonly size?: number;
  /** `"random"` ou coordenadas `{ x, y }`. @default "random" */
  readonly position?: "random" | { readonly x: number; readonly y: number };
  /** Tempo em ms antes de animar a saída. @default 5000 */
  readonly duration?: number;
  /** Animação de entrada (Animate.css). @default "bounceIn" */
  readonly animationIn?: string;
  /** Animação de saída (Animate.css). @default "bounceOut" */
  readonly animationOut?: string;
}

/**
 * Exibe uma imagem em posição aleatória (ou fixa) com animação de
 * entrada e saída usando Animate.css. A imagem é removida após a saída.
 */
export function showImage(opts: ShowImageOptions): Promise<void> {
  const {
    url,
    size,
    position = "random",
    duration = 5000,
    animationIn = "bounceIn",
    animationOut = "bounceOut",
  } = opts;

  return new Promise((resolve, reject) => {
    try {
      const image = new Image();
      image.src = url;

      image.onload = () => {
        const scale = size != null && !isNaN(size) ? size : 0.5;

        const pos =
          position === "random"
            ? {
                x: getRandomInt(0, window.innerWidth - Math.floor(image.width * scale)),
                y: getRandomInt(0, window.innerHeight - Math.floor(image.height * scale)),
              }
            : position;

        const el = document.createElement("div");
        Object.assign(el.style, {
          position:           "absolute",
          top:                `${pos.y}px`,
          left:               `${pos.x}px`,
          width:              `${image.width * scale}px`,
          height:             `${image.height * scale}px`,
          backgroundImage:    `url(${url})`,
          backgroundSize:     "cover",
          backgroundPosition: "center",
        });

        document.body.appendChild(el);

        animateCSS(el, animationIn).then((node) => {
          setTimeout(() => {
            animateCSS(node, animationOut).then((node) => {
              node.remove();
              resolve();
            });
          }, duration);
        });
      };

      image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    } catch (err) {
      reject(err);
    }
  });
}

// ─── Split Animate ──────────────────────────────────────────────────────────

/**
 * Divide um texto em `<span>` individuais, cada um com animação Animate.css
 * escalonada (efeito letra-a-letra).
 *
 * @param text       Texto a ser dividido
 * @param animation  Nome da animação (sem prefixo). @default "tada"
 * @param prefix     Prefixo CSS do Animate.css. @default "animate__"
 * @returns Array de `HTMLSpanElement`
 */
export function splitAnimate(
  text: string,
  animation = "tada",
  prefix = "animate__",
): HTMLSpanElement[] {
  return String(text)
    .split("")
    .map((char, index) => {
      const span = document.createElement("span");
      span.className = `${prefix}animated ${prefix}${animation} ${prefix}infinite`;
      span.style.animationDelay = `${index * 100}ms`;
      span.innerText = char;
      return span;
    });
}

// ─── Cheer GIF ──────────────────────────────────────────────────────────────

/** Tamanhos válidos para o GIF de cheer (1 = pequeno, 2 = médio, 3 = grande). */
export type CheerGifSize = 1 | 2 | 3;

const CHEER_THRESHOLDS = [1, 100, 1000, 5000, 10000, 25000, 50000, 100000] as const;

/**
 * Retorna a URL do GIF animado de cheer (Twitch) para o valor de bits dado.
 *
 * @param amount  Quantidade de bits
 * @param size    Tamanho do GIF (1, 2 ou 3). @default 1
 */
export function cheerGifUrl(amount: number, size: CheerGifSize = 1): string {
  const validSizes: readonly number[] = [1, 2, 3];
  const s = validSizes.includes(size) ? size : 1;
  const tier = CHEER_THRESHOLDS.reduce<number>(
    (prev, curr) => (amount >= curr ? curr : prev),
    1,
  );
  return `https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/${tier}/${s}.gif`;
}

/**
 * Retorna um `<img>` do GIF animado de cheer (Twitch) para o valor de bits dado.
 *
 * @param amount  Quantidade de bits
 * @param size    Tamanho do GIF (1, 2 ou 3). @default 1
 */
export function cheerGif(amount: number, size: CheerGifSize = 1): HTMLImageElement {
  return Object.assign(document.createElement("img"), {
    className: "cheer-gif",
    src: cheerGifUrl(amount, size),
  });
}

// ─── Text-to-Speech (StreamElements) ────────────────────────────────────────

/** Opções para {@link tts}. */
export interface TTSOptions {
  /** Texto a ser falado. */
  readonly message: string;
  /** Nome da voz preferida. Se ausente ou não estiver na lista, uma voz aleatória é escolhida. */
  readonly voice?: string;
  /** Vozes disponíveis para sorteio (ex: `["Ines", "Cristiano"]`). */
  readonly voices?: readonly string[];
  /** Volume de 0 a 1. @default 1 */
  readonly volume?: number;
}

/**
 * Interface mínima do `SE_API` global injetado pelo overlay StreamElements.
 * Declarada aqui para tipagem — a implementação real vem do runtime do SE.
 */
interface SE_API_Sanitize {
  sanitize(opts: { message: string }): Promise<{
    result: { message: string } | null;
    skip: boolean;
  }>;
}

/**
 * Reproduz texto via TTS do StreamElements.
 *
 * Depende de `SE_API.sanitize` — global disponível no overlay do StreamElements.
 * Em ambientes sem `SE_API`, retorna `0` silenciosamente.
 *
 * @param opts  Opções de voz
 * @returns Duração em segundos (via {@link audioPlay})
 */
export async function tts(opts: TTSOptions): Promise<number> {
  const { message, voice, voices = [], volume = 1 } = opts;

  // SE_API é injetado pelo overlay do StreamElements
  const api = (globalThis as Record<string, unknown>).SE_API as
    | SE_API_Sanitize
    | undefined;
  if (!api?.sanitize) return 0;

  const voiceList = [...voices];
  let selectedVoice = voice;

  if (!selectedVoice || !voiceList.includes(selectedVoice)) {
    selectedVoice =
      voiceList.length > 0
        ? voiceList[getRandomInt(0, voiceList.length - 1)]
        : "Brian";
  }

  const { result, skip } = await api.sanitize({ message });
  if (skip || !result?.message) return 0;

  const audioUrl =
    `https://api.streamelements.com/kappa/v2/speech` +
    `?voice=${selectedVoice}&text=${encodeURI(result.message)}`;

  return audioPlay(audioUrl, { volume }).catch(() => 0);
}
