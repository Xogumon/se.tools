/**
 * EventBus — Gerenciador type-safe de eventos StreamElements.
 *
 * Escuta os CustomEvents do SE (`onWidgetLoad`, `onSessionUpdate`, `onEventReceived`)
 * e despacha para handlers globais (`window.onSubscriber`, `window.onMessage`, etc.)
 *
 * Suporta injeção de `EventTarget` para facilitar testes.
 */

import { ChatMessage } from "./ChatMessage";
import { SE_EVENTS, NON_SKIPPABLE_LISTENERS } from "./events";
import type { SEEventName } from "./types";
import { callFunc, funcExists } from "./utils";

// ─── Gift collection (SubBombComplete) ──────────────────────────────────────

interface GiftBucket {
  amount: number;
  recipients: string[];
}

// ─── Options ────────────────────────────────────────────────────────────────

export interface EventBusOptions {
  /** EventTarget para add/removeEventListener (default: `window`). */
  eventTarget?: EventTarget;
  /** Se `true`, corrige `sender` em alertas de teste do SE (default: `true`). */
  senderCorrection?: boolean;
}

// ─── Class ──────────────────────────────────────────────────────────────────

export class EventBus {
  private readonly target: EventTarget;
  private senderCorrection: boolean;

  private readonly expectedListeners = new Set<string>();
  private readonly expectedNames = new Set<SEEventName>();

  private readonly giftCollection = new Map<string, GiftBucket>();

  constructor(options: EventBusOptions = {}) {
    this.target = options.eventTarget ?? window;
    this.senderCorrection = options.senderCorrection ?? true;

    this.detectExpectedHandlers();
    this.bindAll();
  }

  // ─── Public API ───────────────────────────────────────────────────────

  /** Desabilita correção de sender em alertas de teste. */
  disableSenderCorrection(): void {
    this.senderCorrection = false;
  }

  /** Checa se um listener é "non-skippable" (não faz parte da fila de alertas). */
  isNonSkippable(listener: string): boolean {
    return NON_SKIPPABLE_LISTENERS.has(listener);
  }

  /** Remove todos os listeners registrados. */
  destroy(): void {
    this.target.removeEventListener("onWidgetLoad", this.handleWidgetLoad);
    this.target.removeEventListener("onSessionUpdate", this.handleSessionUpdate);
    this.target.removeEventListener("onEventReceived", this.handleEventReceived);
  }

  // ─── Setup ────────────────────────────────────────────────────────────

  private detectExpectedHandlers(): void {
    for (const entry of SE_EVENTS) {
      if (funcExists(`on${entry.name}`)) {
        this.expectedListeners.add(entry.listener);
        this.expectedNames.add(entry.name);
      }
    }
  }

  private bindAll(): void {
    if (funcExists("onWidgetLoad")) {
      this.target.addEventListener("onWidgetLoad", this.handleWidgetLoad);
    }
    if (funcExists("onSessionUpdate")) {
      this.target.addEventListener("onSessionUpdate", this.handleSessionUpdate);
    }
    if (this.expectedNames.size > 0) {
      this.target.addEventListener("onEventReceived", this.handleEventReceived);
    }
  }

  // ─── Core handlers (arrow props → stable reference) ───────────────────

  private handleWidgetLoad = (e: Event): void => {
    callFunc("onWidgetLoad", e);
  };

  private handleSessionUpdate = (e: Event): void => {
    callFunc("onSessionUpdate", e);
  };

  private handleEventReceived = (e: Event): void => {
    const detail = (e as CustomEvent).detail as
      | { listener: string; event: Record<string, unknown> }
      | undefined;
    if (!detail) return;

    const { listener: l, event: ev } = detail;
    this.routeEvent(l, ev);
  };

  // ─── Roteamento ───────────────────────────────────────────────────────

  private expects(name: SEEventName): boolean {
    return this.expectedNames.has(name);
  }

  private routeEvent(listener: string, e: Record<string, unknown>): void {
    switch (listener) {
      case "message":
        if (this.expects("Message")) this.handleMessage(e);
        break;

      case "delete-message":
        if (this.expects("DeleteMessage")) callFunc("onDeleteMessage", e);
        break;

      case "delete-messages":
        if (this.expects("DeleteMessages")) callFunc("onDeleteMessages", e);
        break;

      case "subscriber-latest":
        this.routeSubscriber(e);
        break;

      case "tip-latest":
        if (this.expects("Tip")) callFunc("onTip", e);
        break;

      case "cheer-latest":
        if (this.expects("Cheer")) callFunc("onCheer", e);
        break;

      case "host-latest":
        if (this.expects("Host")) callFunc("onHost", e);
        break;

      case "raid-latest":
        if (this.expects("Raid")) callFunc("onRaid", e);
        break;

      case "follower-latest":
        if (this.expects("Follow")) callFunc("onFollow", e);
        break;

      case "bot:counter":
        if (this.expects("BotCounter")) callFunc("onBotCounter", e);
        break;

      case "event:skip":
        if (this.expects("EventSkip")) callFunc("onEventSkip");
        break;

      case "event:test":
        if (
          this.expects("WidgetButton") &&
          (e as Record<string, unknown>).listener === "widget-button"
        ) {
          callFunc("onWidgetButton", e);
        }
        break;

      case "kvstore:update":
        if (this.expects("KVStoreUpdate")) {
          callFunc("onKVStoreUpdate", (e as Record<string, unknown>).data);
        }
        break;

      case "alertService:toggleSound":
        if (this.expects("ToggleSound")) callFunc("onToggleSound", e);
        break;
    }
  }

  // ─── Message ──────────────────────────────────────────────────────────

  private handleMessage(e: Record<string, unknown>): void {
    const service = String(e.service ?? "").toLowerCase();
    const payload = service === "twitch" ? new ChatMessage(e as never) : e;
    callFunc("onMessage", payload);
  }

  // ─── Subscriber routing ───────────────────────────────────────────────

  private routeSubscriber(e: Record<string, unknown>): void {
    // Correção de sender em alertas de teste
    if (
      this.senderCorrection &&
      e.isTest &&
      !(e.gifted && e.isCommunityGift) &&
      !e.bulkGifted
    ) {
      e.sender = undefined;
    }

    // New Sub
    if (
      this.expects("Subscriber") &&
      !e.gifted &&
      e.amount === 1 &&
      e.sender === undefined
    ) {
      callFunc("onSubscriber", e);
      return;
    }

    // Gift (não community)
    if (this.expects("SubGift") && e.gifted && !e.isCommunityGift) {
      callFunc("onSubGift", e);
      return;
    }

    // Resub
    if (
      this.expects("Resub") &&
      (e.amount as number) > 1 &&
      e.sender === undefined
    ) {
      callFunc("onResub", e);
      return;
    }

    // SubBomb (bulk)
    if (e.bulkGifted) {
      this.handleSubBomb(e);
      return;
    }

    // Community Gift (parte do bomb)
    if (e.gifted && e.isCommunityGift) {
      this.handleCommunityGift(e);
    }
  }

  private handleSubBomb(e: Record<string, unknown>): void {
    if (this.expects("SubBombComplete")) {
      const sender = String(e.sender ?? "").toLowerCase();
      if (sender && !this.giftCollection.has(sender)) {
        this.giftCollection.set(sender, {
          amount: e.amount as number,
          recipients: [],
        });
      }
    }
    if (this.expects("SubBomb")) {
      callFunc("onSubBomb", e);
    }
  }

  private handleCommunityGift(e: Record<string, unknown>): void {
    if (this.expects("CommunityGift")) {
      callFunc("onCommunityGift", e);
    }

    if (this.expects("SubBombComplete")) {
      const sender = String(e.sender ?? "").toLowerCase();
      const bucket = this.giftCollection.get(sender);

      if (bucket) {
        bucket.recipients.push(String(e.name));

        if (bucket.recipients.length >= bucket.amount) {
          e.amount = bucket.amount;
          callFunc("onSubBombComplete", e, bucket.recipients);
          this.giftCollection.delete(sender);
        }
      }
    }
  }
}
