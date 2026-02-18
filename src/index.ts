/**
 * se-tools v2 — Barrel export
 *
 * Tudo é tree-shakeable: importe só o que precisar.
 *
 * ```ts
 * import { ChatMessage, Queue, EventBus } from "se-tools";
 * import { randomHexColor, parseTier } from "se-tools";
 * ```
 */

// ─── Tipos ──────────────────────────────────────────────────────────────────
export type {
  Badge,
  BotCounterEvent,
  ChatMessageStats,
  CheerEvent,
  CommunityGiftEvent,
  DeleteMessageEvent,
  DeleteMessagesEvent,
  Emote,
  EventListEntry,
  FollowEvent,
  HostEvent,
  KVStoreUpdateEvent,
  ParsedCommand,
  RaidEvent,
  ResubEvent,
  RGB,
  Roles,
  SEEventMap,
  SEEventName,
  SEMessageEvent,
  SubBombEvent,
  SubGiftEvent,
  SubscriberEvent,
  TipEvent,
  ToggleSoundEvent,
  WidgetButtonEvent,
} from "./types";

// ─── Classes ────────────────────────────────────────────────────────────────
export { ChatMessage } from "./ChatMessage";
export { Queue } from "./Queue";
export { EventBus } from "./EventBus";
export type { EventBusOptions } from "./EventBus";
export { StreamElementsAdapter } from "./StreamElementsAdapter";

// ─── Constantes ─────────────────────────────────────────────────────────────
export { SE_EVENTS, NON_SKIPPABLE_LISTENERS } from "./events";

// ─── Utils (funções puras, tree-shakeable) ──────────────────────────────────
export {
  allSet,
  callFunc,
  camelToKebab,
  containsText,
  createList,
  divisibleBy,
  formatCurrency,
  formatTimerValue,
  funcExists,
  getChromeVersion,
  getPercentageOf,
  getRandomDecimal,
  getRandomInt,
  isChrome,
  isOBSBrowserSource,
  isString,
  isset,
  isWholeNumber,
  kebabToCamel,
  matchRegexGroups,
  matchesRegex,
  nextIterator,
  parseTier,
  randomHexColor,
  randomRGB,
  randomRGBAColor,
  randomRGBColor,
  resolves,
  trimSpaces,
} from "./utils";

// ─── Compatibilidade: auto-attach ao window ────────────────────────────────
import { EventBus } from "./EventBus";
import { Queue } from "./Queue";
import * as utils from "./utils";

export interface SeTools {
  event: EventBus;
  Queue: typeof Queue;
  utils: typeof utils;
}

declare global {
  interface Window {
    seTools?: SeTools;
  }
}

/** Cria uma instância completa e opcionalmente anexa em `window.seTools`. */
export function createSeTools(options?: {
  attachToWindow?: boolean;
  eventTarget?: EventTarget;
}): SeTools {
  const tools: SeTools = {
    event: new EventBus({ eventTarget: options?.eventTarget }),
    Queue,
    utils,
  };

  if (options?.attachToWindow !== false) {
    window.seTools = tools;
  }

  return tools;
}

// Auto-inicializa ao importar o bundle (UMD)
createSeTools({ attachToWindow: true });
