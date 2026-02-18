import type { EventListEntry } from "./types";

/**
 * Mapeamento completo de nomes de evento SE → listeners do StreamElements.
 * Usado pelo EventBus para identificar qual handler disparar.
 */
export const SE_EVENTS: readonly EventListEntry[] = [
  { name: "Subscriber", listener: "subscriber-latest" },
  { name: "Resub", listener: "subscriber-latest" },
  { name: "SubGift", listener: "subscriber-latest" },
  { name: "CommunityGift", listener: "subscriber-latest" },
  { name: "SubBomb", listener: "subscriber-latest" },
  { name: "SubBombComplete", listener: "subscriber-latest" },
  { name: "Tip", listener: "tip-latest" },
  { name: "Cheer", listener: "cheer-latest" },
  { name: "Host", listener: "host-latest" },
  { name: "Raid", listener: "raid-latest" },
  { name: "Follow", listener: "follower-latest" },
  { name: "Message", listener: "message" },
  { name: "DeleteMessage", listener: "delete-message" },
  { name: "DeleteMessages", listener: "delete-messages" },
  { name: "EventSkip", listener: "event:skip" },
  { name: "BotCounter", listener: "bot:counter" },
  { name: "WidgetButton", listener: "event:test" },
  { name: "KVStoreUpdate", listener: "kvstore:update" },
  { name: "ToggleSound", listener: "alertService:toggleSound" },
] as const;

/** Listeners que não podem ser pulados (não são alertas de fila). */
export const NON_SKIPPABLE_LISTENERS = new Set([
  "bot:counter",
  "event:test",
  "event:skip",
  "message",
  "delete-message",
  "delete-messages",
  "kvstore:update",
  "alertService:toggleSound",
]);
