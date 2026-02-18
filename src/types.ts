// ─── Badge ───────────────────────────────────────────────────────────────────

export interface Badge {
  readonly type: string;
  readonly version: string;
  readonly url: string;
  readonly description: string;
}

// ─── Roles ───────────────────────────────────────────────────────────────────

export interface Roles {
  readonly staff: boolean;
  readonly broadcaster: boolean;
  readonly moderator: boolean;
  readonly vip: boolean;
  readonly subscriber: boolean;
}

// ─── Chat Message Stats ─────────────────────────────────────────────────────

export interface ChatMessageStats {
  readonly wordCount: number;
  readonly emoteCount: number;
  readonly emotePercentage: number;
  readonly capsCount: number;
  readonly capsPercentage: number;
  readonly specialCharsCount: number;
  readonly specialCharsPercentage: number;
}

// ─── Emote ───────────────────────────────────────────────────────────────────

export interface Emote {
  readonly type: string;
  readonly name: string;
  readonly id: string;
  readonly gif: boolean;
  readonly urls: Record<string, string>;
  readonly start: number;
  readonly end: number;
}

// ─── SE Message Event (onEventReceived → message) ───────────────────────────

export interface SEMessageEvent {
  readonly service: string;
  readonly renderedText: string;
  readonly data: {
    readonly time: number;
    readonly tags: {
      readonly "badge-info": string;
      readonly badges: string;
      readonly "client-nonce": string;
      readonly color: string;
      readonly "display-name": string;
      readonly emotes: string;
      readonly flags: string;
      readonly id: string;
      readonly mod: string;
      readonly "room-id": string;
      readonly subscriber: string;
      readonly "tmi-sent-ts": number;
      readonly turbo: string;
      readonly "user-id": string;
      readonly "user-type": string;
      readonly "msg-id": string;
      readonly "custom-reward-id": string;
    };
    readonly nick: string;
    readonly userId: string;
    readonly displayName: string;
    readonly displayColor: string;
    readonly badges: readonly Badge[];
    readonly channel: string;
    readonly text: string;
    readonly isAction: boolean;
    readonly emotes: readonly Emote[];
    readonly msgId: string;
  };
}

// ─── Stream Events ──────────────────────────────────────────────────────────

interface BaseStreamEvent {
  readonly _id: string;
  readonly name: string;
  readonly sessionTop: boolean;
  readonly type: string;
  readonly originalEventName: string;
}

export interface SubscriberEvent extends BaseStreamEvent {
  readonly amount: number;
  readonly tier: string;
}

export interface ResubEvent extends BaseStreamEvent {
  readonly amount: number;
  readonly tier: string;
  readonly message: string;
}

export interface SubGiftEvent extends BaseStreamEvent {
  readonly amount: number;
  readonly tier: string;
  readonly message: string;
  readonly sender: string;
  readonly gifted: boolean;
}

export interface SubBombEvent extends BaseStreamEvent {
  readonly amount: number;
  readonly count: number;
  readonly tier: string;
  readonly message: string;
  readonly sender: string;
  readonly bulkGifted: boolean;
}

export interface CommunityGiftEvent extends BaseStreamEvent {
  readonly amount: number;
  readonly count: number;
  readonly tier: string;
  readonly message: string;
  readonly sender: string;
  readonly gifted: boolean;
  readonly isCommunityGift: boolean;
  readonly playedAsCommunityGift: boolean;
}

export interface FollowEvent extends BaseStreamEvent {}

export interface TipEvent extends BaseStreamEvent {
  readonly amount: number;
  readonly message: string;
}

export interface CheerEvent extends BaseStreamEvent {
  readonly amount: number;
  readonly message: string;
}

export interface RaidEvent extends BaseStreamEvent {
  readonly amount: number;
}

export interface HostEvent extends BaseStreamEvent {
  readonly amount: number;
}

export interface DeleteMessageEvent {
  readonly msgId: string;
}

export interface DeleteMessagesEvent {
  readonly userId: string;
}

export interface BotCounterEvent {
  readonly counter: string;
  readonly value: number;
}

export interface KVStoreUpdateEvent {
  readonly key: string;
  readonly value: unknown;
}

export interface WidgetButtonEvent {
  readonly listener: string;
  readonly field: string;
  readonly value: string;
}

export interface ToggleSoundEvent {
  readonly muted: boolean;
}

// ─── Listener Map (type-safe event → handler) ──────────────────────────────

export interface SEEventMap {
  Subscriber: SubscriberEvent;
  Resub: ResubEvent;
  SubGift: SubGiftEvent;
  CommunityGift: CommunityGiftEvent;
  SubBomb: SubBombEvent;
  SubBombComplete: SubBombEvent;
  Tip: TipEvent;
  Cheer: CheerEvent;
  Host: HostEvent;
  Raid: RaidEvent;
  Follow: FollowEvent;
  Message: SEMessageEvent;
  DeleteMessage: DeleteMessageEvent;
  DeleteMessages: DeleteMessagesEvent;
  EventSkip: undefined;
  BotCounter: BotCounterEvent;
  WidgetButton: WidgetButtonEvent;
  KVStoreUpdate: KVStoreUpdateEvent;
  ToggleSound: ToggleSoundEvent;
}

export type SEEventName = keyof SEEventMap;

// ─── SE Listener → Event name mapping ───────────────────────────────────────

export interface EventListEntry {
  readonly name: SEEventName;
  readonly listener: string;
}

// ─── Parsed command ─────────────────────────────────────────────────────────

export interface ParsedCommand {
  readonly command: string;
  readonly args: readonly string[];
}

// ─── RGB color ──────────────────────────────────────────────────────────────

export interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}
