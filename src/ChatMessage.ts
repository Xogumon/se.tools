/**
 * Representação imutável de uma mensagem de chat do StreamElements.
 * Todas as propriedades são readonly — o estado é calculado no construtor.
 */

import type {
  Badge,
  ChatMessageStats,
  Emote,
  ParsedCommand,
  Roles,
  SEMessageEvent,
} from "./types";
import {
  containsText,
  createList,
  getPercentageOf,
  isset,
  matchRegexGroups,
  matchesRegex,
  randomHexColor,
  trimSpaces,
} from "./utils";

export class ChatMessage {
  readonly badges: readonly Badge[];
  readonly badgeInfo: string;
  readonly channel: string;
  readonly customRewardId: string | null;
  readonly highlighted: boolean;
  readonly emotes: readonly Emote[];
  readonly msgId: string;
  readonly userId: string;
  readonly username: string;
  readonly displayColor: string;
  readonly renderedText: string;
  readonly text: string;
  readonly roles: Roles;
  readonly stats: ChatMessageStats;
  readonly time: Date;
  readonly isAction: boolean;

  /** Evento bruto original — mantido para acesso a campos não mapeados. */
  readonly raw: SEMessageEvent;

  constructor(event: SEMessageEvent) {
    const { data } = event;

    this.raw = event;
    this.badges = data.badges ?? [];
    this.badgeInfo = data.tags["badge-info"] ?? "";
    this.channel = data.channel;
    this.customRewardId = data.tags["custom-reward-id"] || null;
    this.highlighted = data.tags["msg-id"] === "highlighted-message";
    this.emotes = data.emotes ?? [];
    this.msgId = data.msgId;
    this.userId = data.userId;
    this.username = data.displayName;
    this.displayColor = isset(data.displayColor) ? data.displayColor : randomHexColor();
    this.renderedText = event.renderedText;
    this.text = trimSpaces(data.text);
    this.isAction = data.isAction === true;
    this.time = new Date(data.time);

    // Calculados uma vez
    this.roles = ChatMessage.buildRoles(this.badges);
    this.stats = this.buildStats();
  }

  // ─── Roles ──────────────────────────────────────────────────────────────

  private static buildRoles(badges: readonly Badge[]): Roles {
    const roles: Roles = {
      staff: false,
      broadcaster: false,
      moderator: false,
      vip: false,
      subscriber: false,
    };

    const mutable = roles as unknown as Record<string, boolean>;

    for (const badge of badges) {
      if (badge.type in mutable) {
        mutable[badge.type] = true;
      }
    }

    return roles;
  }

  hasRole(role: string): boolean {
    const map: Record<string, keyof Roles> = {
      broadcaster: "broadcaster",
      streamer: "broadcaster",
      moderator: "moderator",
      mod: "moderator",
      vip: "vip",
      subscriber: "subscriber",
      sub: "subscriber",
      staff: "staff",
    };
    const key = map[role.toLowerCase()];
    return key ? this.roles[key] : false;
  }

  get isBroadcaster(): boolean { return this.roles.broadcaster; }
  get isModerator(): boolean { return this.roles.moderator; }
  get isVIP(): boolean { return this.roles.vip; }
  get isSubscriber(): boolean { return this.roles.subscriber; }
  get isStaff(): boolean { return this.roles.staff; }

  // ─── Badges ─────────────────────────────────────────────────────────────

  get hasPrimeBadge(): boolean {
    return this.badges.some((b) => b.type === "premium");
  }

  get hasTurboBadge(): boolean {
    return this.badges.some((b) => b.type === "turbo");
  }

  get tierBadge(): number {
    const groups = matchRegexGroups(
      this.raw.data.tags.badges,
      /subscriber\/(?<tier>[23]0)?\d+/i,
    );
    if (!groups?.tier) return 0;
    if (groups.tier === "20") return 2;
    if (groups.tier === "30") return 3;
    return 1;
  }

  get monthsSubscribed(): number {
    const groups = matchRegexGroups(
      this.badgeInfo,
      /subscriber\/(?<months>[1-9]\d*)/i,
    );
    return groups?.months ? parseInt(groups.months, 10) : 0;
  }

  get bitsBadge(): number {
    const groups = matchRegexGroups(
      this.raw.data.tags.badges,
      /bits\/(?<bits>[1-9]\d*)/i,
    );
    return groups?.bits ? parseInt(groups.bits, 10) : 0;
  }

  get giftsBadge(): number {
    const groups = matchRegexGroups(
      this.raw.data.tags.badges,
      /sub-gifter\/(?<gifts>[1-9]\d*)/i,
    );
    return groups?.gifts ? parseInt(groups.gifts, 10) : 0;
  }

  // ─── Stats ──────────────────────────────────────────────────────────────

  private buildStats(): ChatMessageStats {
    const words = createList(this.text, " ");
    const wordCount = words.length;
    const emoteCount = this.emotes.length;
    const textLen = this.text.length;
    const capsCount = (this.text.match(/[A-Z]/g) ?? []).length;
    const specialCharsCount = (this.text.match(/[^a-zA-Z0-9\s]/g) ?? []).length;

    return {
      wordCount,
      emoteCount,
      emotePercentage: getPercentageOf(emoteCount, wordCount),
      capsCount,
      capsPercentage: getPercentageOf(capsCount, textLen),
      specialCharsCount,
      specialCharsPercentage: getPercentageOf(specialCharsCount, textLen),
    };
  }

  // ─── Reward / Highlight ─────────────────────────────────────────────────

  get isCustomReward(): boolean {
    return this.customRewardId !== null;
  }

  get isHighlight(): boolean {
    return this.highlighted;
  }

  // ─── Comandos ───────────────────────────────────────────────────────────

  isCommand(cmdName = ""): boolean {
    const cmd = cmdName.startsWith("!") ? cmdName : `!${cmdName}`;
    return this.text.startsWith(cmd);
  }

  getCommand(withArgs = false): ParsedCommand | string | null {
    if (!this.text.startsWith("!")) return null;
    const groups = matchRegexGroups(
      this.text,
      /^!(?<cmd>\w+)\s?@?(?<args>[\w\s?]*)/i,
    );
    if (!groups) return null;
    return withArgs
      ? { command: groups.cmd, args: createList(groups.args, " ", true) }
      : groups.cmd;
  }

  // ─── Conteúdo ───────────────────────────────────────────────────────────

  contains(text: string, caseSensitive = false): boolean {
    return containsText(this.text, text, caseSensitive);
  }

  containsRegex(regex: RegExp): boolean {
    return matchesRegex(this.text, regex);
  }

  // ─── Username helpers ─────────────────────────────────────────────────

  usernameOnList(list: readonly string[]): boolean {
    const lower = this.username.toLowerCase();
    return list.some((entry) => entry.toLowerCase() === lower);
  }

  hasUsername(name: string): boolean {
    return this.username.toLowerCase() === name.toLowerCase();
  }

  hasUserId(id: string | number): boolean {
    return this.userId === String(id);
  }

  usernameContains(text: string, caseSensitive = false): boolean {
    return containsText(this.username, text, caseSensitive);
  }

  usernameContainsRegex(regex: RegExp): boolean {
    return matchesRegex(this.username, regex);
  }
}
