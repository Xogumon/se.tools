import { describe, it, expect } from "vitest";
import {
  isset,
  allSet,
  resolves,
  isString,
  trimSpaces,
  createList,
  containsText,
  matchesRegex,
  matchRegexGroups,
  divisibleBy,
  isWholeNumber,
  nextIterator,
  formatTimerValue,
  getRandomInt,
  getPercentageOf,
  randomHexColor,
  randomRGBColor,
  randomRGBAColor,
  formatCurrency,
  camelToKebab,
  kebabToCamel,
  parseTier,
  sleep,
  parseHexColor,
  relativeLuminance,
  lumeColor,
  splitAnimate,
  cheerGifUrl,
  cheerGif,
  tts,
} from "./utils";

// ─── isset ──────────────────────────────────────────────────────────────────

describe("isset", () => {
  it("returns false for null and undefined", () => {
    expect(isset(null)).toBe(false);
    expect(isset(undefined)).toBe(false);
  });

  it("returns false for empty string by default", () => {
    expect(isset("")).toBe(false);
  });

  it("returns true for empty string when noEmpty=false", () => {
    expect(isset("", false)).toBe(true);
  });

  it("returns true for non-empty values", () => {
    expect(isset("hello")).toBe(true);
    expect(isset(0)).toBe(true);
    expect(isset(false)).toBe(true);
    expect(isset([])).toBe(true);
  });
});

// ─── allSet ─────────────────────────────────────────────────────────────────

describe("allSet", () => {
  it("returns true when all values are set", () => {
    expect(allSet("a", "b", 1)).toBe(true);
  });

  it("returns false when any value is null/undefined", () => {
    expect(allSet("a", null, 1)).toBe(false);
    expect(allSet(undefined)).toBe(false);
  });
});

// ─── resolves ───────────────────────────────────────────────────────────────

describe("resolves", () => {
  it("returns true for existing nested paths", () => {
    expect(resolves("a.b.c", { a: { b: { c: 1 } } })).toBe(true);
  });

  it("returns false for missing paths", () => {
    expect(resolves("a.b.x", { a: { b: { c: 1 } } })).toBe(false);
  });
});

// ─── isString ───────────────────────────────────────────────────────────────

describe("isString", () => {
  it("returns true for strings", () => {
    expect(isString("hello")).toBe(true);
    expect(isString("")).toBe(true);
  });

  it("returns false for non-strings", () => {
    expect(isString(123)).toBe(false);
    expect(isString(null)).toBe(false);
  });
});

// ─── trimSpaces ─────────────────────────────────────────────────────────────

describe("trimSpaces", () => {
  it("collapses multiple spaces", () => {
    expect(trimSpaces("  hello   world  ")).toBe("hello world");
  });

  it("handles null/undefined", () => {
    expect(trimSpaces(null)).toBe("");
    expect(trimSpaces(undefined)).toBe("");
  });

  it("converts non-strings", () => {
    expect(trimSpaces(42)).toBe("42");
  });
});

// ─── createList ─────────────────────────────────────────────────────────────

describe("createList", () => {
  it("splits and trims", () => {
    expect(createList("a, b, c")).toEqual(["a", "b", "c"]);
  });

  it("splits by custom splitter", () => {
    expect(createList("hello world foo", " ")).toEqual(["hello", "world", "foo"]);
  });

  it("removes empty strings when requested", () => {
    expect(createList("a,,b", ",", true)).toEqual(["a", "b"]);
  });
});

// ─── containsText ───────────────────────────────────────────────────────────

describe("containsText", () => {
  it("case insensitive by default", () => {
    expect(containsText("Hello World", "hello")).toBe(true);
  });

  it("case sensitive when requested", () => {
    expect(containsText("Hello World", "hello", true)).toBe(false);
    expect(containsText("Hello World", "Hello", true)).toBe(true);
  });

  it("returns false for non-strings", () => {
    expect(containsText(null as unknown as string, "a")).toBe(false);
  });
});

// ─── matchesRegex ───────────────────────────────────────────────────────────

describe("matchesRegex", () => {
  it("returns true on match", () => {
    expect(matchesRegex("hello123", /\d+/)).toBe(true);
  });

  it("returns false on no match", () => {
    expect(matchesRegex("hello", /\d+/)).toBe(false);
  });
});

// ─── matchRegexGroups ───────────────────────────────────────────────────────

describe("matchRegexGroups", () => {
  it("returns named groups", () => {
    const groups = matchRegexGroups("tier2000", /tier(?<num>\d+)/);
    expect(groups).toEqual({ num: "2000" });
  });

  it("returns null on no match", () => {
    expect(matchRegexGroups("abc", /(?<num>\d+)/)).toBeNull();
  });
});

// ─── Números ────────────────────────────────────────────────────────────────

describe("divisibleBy", () => {
  it("returns true when divisible", () => {
    expect(divisibleBy(10, 5)).toBe(true);
  });

  it("returns false for zero divisor", () => {
    expect(divisibleBy(10, 0)).toBe(false);
  });
});

describe("isWholeNumber", () => {
  it("returns true for integers", () => {
    expect(isWholeNumber(5)).toBe(true);
  });

  it("returns false for decimals", () => {
    expect(isWholeNumber(5.5)).toBe(false);
  });
});

describe("nextIterator", () => {
  it("increments", () => {
    expect(nextIterator(0, 5)).toBe(1);
    expect(nextIterator(4, 5)).toBe(5);
  });

  it("resets at max", () => {
    expect(nextIterator(5, 5)).toBe(0);
    expect(nextIterator(6, 5)).toBe(0);
  });
});

describe("formatTimerValue", () => {
  it("pads single digits", () => {
    expect(formatTimerValue(5)).toBe("05");
    expect(formatTimerValue(12)).toBe("12");
  });
});

describe("getRandomInt", () => {
  it("returns value within range", () => {
    for (let i = 0; i < 100; i++) {
      const val = getRandomInt(1, 10);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it("handles reversed min/max", () => {
    const val = getRandomInt(10, 1);
    expect(val).toBeGreaterThanOrEqual(1);
    expect(val).toBeLessThanOrEqual(10);
  });
});

describe("getPercentageOf", () => {
  it("calculates correctly", () => {
    expect(getPercentageOf(50, 200)).toBe(25);
  });

  it("returns 0 for zero values", () => {
    expect(getPercentageOf(0, 100)).toBe(0);
    expect(getPercentageOf(50, 0)).toBe(0);
  });
});

// ─── Cores ──────────────────────────────────────────────────────────────────

describe("randomHexColor", () => {
  it("returns valid hex color", () => {
    const color = randomHexColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("randomRGBColor", () => {
  it("returns valid rgb string", () => {
    const color = randomRGBColor();
    expect(color).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
  });
});

describe("randomRGBAColor", () => {
  it("returns valid rgba string", () => {
    const color = randomRGBAColor(0.5);
    expect(color).toMatch(/^rgba\(\d{1,3}, \d{1,3}, \d{1,3}, 0\.5\)$/);
  });

  it("clamps invalid alpha to 1", () => {
    const color = randomRGBAColor(2);
    expect(color).toContain(", 1)");
  });
});

// ─── formatCurrency ─────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("formats USD", () => {
    const result = formatCurrency(10, "USD", "en-US");
    expect(result).toContain("10");
    expect(result).toContain("$");
  });

  it("shows decimals for non-whole numbers", () => {
    const result = formatCurrency(9.99, "USD", "en-US");
    expect(result).toContain("9.99");
  });
});

// ─── Case conversion ────────────────────────────────────────────────────────

describe("camelToKebab", () => {
  it("converts camelCase to kebab-case", () => {
    expect(camelToKebab("myVariableName")).toBe("my-variable-name");
  });
});

describe("kebabToCamel", () => {
  it("converts kebab-case to camelCase", () => {
    expect(kebabToCamel("my-variable-name")).toBe("myVariableName");
  });
});

// ─── parseTier ──────────────────────────────────────────────────────────────

describe("parseTier", () => {
  it("parses tier values", () => {
    expect(parseTier(1000)).toBe(1);
    expect(parseTier(1)).toBe(1);
    expect(parseTier(2000)).toBe(2);
    expect(parseTier(2)).toBe(2);
    expect(parseTier(3000)).toBe(3);
    expect(parseTier("3")).toBe(3);
  });

  it("handles prime", () => {
    expect(parseTier("prime")).toBe("prime");
    expect(parseTier("prime", true)).toBe(1);
  });

  it("returns 0 for unknown", () => {
    expect(parseTier(999)).toBe(0);
  });
});

// ─── sleep ──────────────────────────────────────────────────────────────────

describe("sleep", () => {
  it("resolves after the given delay", async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });

  it("resolves with undefined", async () => {
    const result = await sleep(0);
    expect(result).toBeUndefined();
  });
});

// ─── parseHexColor ──────────────────────────────────────────────────────────

describe("parseHexColor", () => {
  it("parses 6-digit hex", () => {
    expect(parseHexColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHexColor("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
    expect(parseHexColor("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("parses 3-digit hex", () => {
    expect(parseHexColor("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHexColor("#0f0")).toEqual({ r: 0, g: 255, b: 0 });
    expect(parseHexColor("#00f")).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("works without # prefix", () => {
    expect(parseHexColor("ff8800")).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("returns null for invalid input", () => {
    expect(parseHexColor("not-a-color")).toBeNull();
    expect(parseHexColor("#gg0000")).toBeNull();
    expect(parseHexColor("")).toBeNull();
  });
});

// ─── relativeLuminance ──────────────────────────────────────────────────────

describe("relativeLuminance", () => {
  it("returns 0 for black", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it("returns 1 for white", () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2);
  });

  it("returns intermediate value for gray", () => {
    const lum = relativeLuminance({ r: 128, g: 128, b: 128 });
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });
});

// ─── lumeColor ──────────────────────────────────────────────────────────────

describe("lumeColor", () => {
  it("returns 'dark' for dark colors", () => {
    expect(lumeColor("#000000")).toBe("dark");
    expect(lumeColor("#1a1a1a")).toBe("dark");
  });

  it("returns 'light' for light colors", () => {
    expect(lumeColor("#ffffff")).toBe("light");
    expect(lumeColor("#ffff00")).toBe("light");
  });

  it("inverts the result when invert=true", () => {
    expect(lumeColor("#000000", true)).toBe("light");
    expect(lumeColor("#ffffff", true)).toBe("dark");
  });

  it("handles 3-digit hex", () => {
    expect(lumeColor("#000")).toBe("dark");
    expect(lumeColor("#fff")).toBe("light");
  });
});

// ─── splitAnimate ───────────────────────────────────────────────────────────

describe("splitAnimate", () => {
  it("returns an array of spans with one per character", () => {
    const spans = splitAnimate("abc");
    expect(spans).toHaveLength(3);
    expect(spans[0]).toBeInstanceOf(HTMLSpanElement);
    expect(spans[0].innerText).toBe("a");
    expect(spans[1].innerText).toBe("b");
    expect(spans[2].innerText).toBe("c");
  });

  it("applies default animation class (tada)", () => {
    const [span] = splitAnimate("x");
    expect(span.className).toContain("animate__tada");
    expect(span.className).toContain("animate__animated");
    expect(span.className).toContain("animate__infinite");
  });

  it("applies custom animation", () => {
    const [span] = splitAnimate("x", "bounce");
    expect(span.className).toContain("animate__bounce");
  });

  it("applies custom prefix", () => {
    const [span] = splitAnimate("x", "tada", "custom-");
    expect(span.className).toContain("custom-animated");
    expect(span.className).toContain("custom-tada");
  });

  it("sets incremental animation delays", () => {
    const spans = splitAnimate("hi");
    expect(spans[0].style.animationDelay).toBe("0ms");
    expect(spans[1].style.animationDelay).toBe("100ms");
  });

  it("returns empty array for empty string", () => {
    expect(splitAnimate("")).toEqual([]);
  });
});

// ─── cheerGifUrl / cheerGif ─────────────────────────────────────────────────

describe("cheerGifUrl", () => {
  it("returns correct URL for tier thresholds", () => {
    expect(cheerGifUrl(1)).toContain("/cheer/dark/animated/1/1.gif");
    expect(cheerGifUrl(100)).toContain("/animated/100/1.gif");
    expect(cheerGifUrl(150)).toContain("/animated/100/1.gif");
    expect(cheerGifUrl(1000)).toContain("/animated/1000/1.gif");
    expect(cheerGifUrl(100000)).toContain("/animated/100000/1.gif");
  });

  it("supports different sizes", () => {
    expect(cheerGifUrl(100, 2)).toContain("/100/2.gif");
    expect(cheerGifUrl(100, 3)).toContain("/100/3.gif");
  });

  it("falls back to size 1 for invalid sizes", () => {
    expect(cheerGifUrl(100, 5 as any)).toContain("/100/1.gif");
  });
});

describe("cheerGif", () => {
  it("returns an HTMLImageElement", () => {
    const img = cheerGif(500);
    expect(img).toBeInstanceOf(HTMLImageElement);
    expect(img.className).toBe("cheer-gif");
    expect(img.src).toContain("/animated/100/1.gif");
  });
});

// ─── tts ────────────────────────────────────────────────────────────────────

describe("tts", () => {
  it("returns 0 when SE_API is not available", async () => {
    const result = await tts({ message: "hello", voices: ["Brian"] });
    expect(result).toBe(0);
  });
});
