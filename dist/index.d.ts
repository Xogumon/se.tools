/** Retorna `true` se **todos** os valores passarem em `isset`. */
export declare function allSet(...values: unknown[]): boolean;

/**
 * Aplica uma animação do Animate.css a um elemento e retorna uma Promise
 * que resolve com o elemento quando a animação termina.
 *
 * @param element  Elemento DOM ou seletor CSS
 * @param animation  Nome da animação (sem prefixo, ex: `"bounceIn"`)
 * @param prefix  Prefixo das classes (padrão: `"animate__"`)
 */
export declare function animateCSS(element: Element | string, animation: string, prefix?: string): Promise<Element>;

/**
 * Reproduz um áudio e retorna uma Promise com a duração em segundos.
 *
 * @param url     URL do áudio
 * @param opts    Opções de reprodução
 * @param onLoad  Callback chamado com a duração em ms quando começa a tocar
 */
export declare function audioPlay(url: string, opts?: AudioPlayOptions, onLoad?: (durationMs: number) => void): Promise<number>;

export declare interface AudioPlayOptions {
    /** Volume de 0 a 1. @default 1 */
    readonly volume?: number;
    /** Duração máxima em segundos. 0 = sem limite. @default 0 */
    readonly maxDuration?: number;
}

export declare interface Badge {
    readonly type: string;
    readonly version: string;
    readonly url: string;
    readonly description: string;
}

declare interface BaseStreamEvent {
    readonly _id: string;
    readonly name: string;
    readonly sessionTop: boolean;
    readonly type: string;
    readonly originalEventName: string;
}

export declare interface BotCounterEvent {
    readonly counter: string;
    readonly value: number;
}

/** Chama uma função global em `window`, se existir. */
export declare function callFunc(name: string, ...args: unknown[]): void;

/** `camelCase` → `kebab-case`. */
export declare function camelToKebab(str: string): string;

export declare class ChatMessage {
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
    constructor(event: SEMessageEvent);
    private static buildRoles;
    hasRole(role: string): boolean;
    get isBroadcaster(): boolean;
    get isModerator(): boolean;
    get isVIP(): boolean;
    get isSubscriber(): boolean;
    get isStaff(): boolean;
    get hasPrimeBadge(): boolean;
    get hasTurboBadge(): boolean;
    get tierBadge(): number;
    get monthsSubscribed(): number;
    get bitsBadge(): number;
    get giftsBadge(): number;
    private buildStats;
    get isCustomReward(): boolean;
    get isHighlight(): boolean;
    isCommand(cmdName?: string): boolean;
    getCommand(withArgs?: boolean): ParsedCommand | string | null;
    contains(text: string, caseSensitive?: boolean): boolean;
    containsRegex(regex: RegExp): boolean;
    usernameOnList(list: readonly string[]): boolean;
    hasUsername(name: string): boolean;
    hasUserId(id: string | number): boolean;
    usernameContains(text: string, caseSensitive?: boolean): boolean;
    usernameContainsRegex(regex: RegExp): boolean;
    /**
     * Opções para gerar uma mensagem de teste.
     *
     * Apenas `text` é obrigatório — tudo mais tem defaults coerentes.
     */
    static readonly TEST_DEFAULTS: {
        readonly username: "TestUser";
        readonly userId: "12345678";
        readonly color: "#9146FF";
        readonly channel: "testchannel";
    };
    /**
     * Cria uma `ChatMessage` pronta para teste, simulando um evento real do SE.
     *
     * @example
     * ```js
     * // Mensagem normal
     * const msg = ChatMessage.createTest({ text: "Olá mundo!" });
     * onMessage(msg);
     *
     * // Highlighted (aciona TTS em widgets que escutam highlight)
     * const hi = ChatMessage.createTest({ text: "KEKW", highlighted: true });
     * onMessage(hi);
     *
     * // Com badges + action
     * const sub = ChatMessage.createTest({
     *   text: "subscribed!",
     *   username: "BigFan",
     *   isAction: true,
     *   badges: [{ type: "subscriber", version: "12", url: "", description: "12-Month Sub" }],
     * });
     * ```
     */
    static createTest(opts: {
        /** Texto da mensagem. */
        text: string;
        /** Nome de exibição. @default "TestUser" */
        username?: string;
        /** ID do usuário. @default "12345678" */
        userId?: string;
        /** Cor do nome no chat (hex). @default "#9146FF" */
        color?: string;
        /** Canal de origem. @default "testchannel" */
        channel?: string;
        /** Mensagem highlighted. @default false */
        highlighted?: boolean;
        /** Mensagem é /me (ação). @default false */
        isAction?: boolean;
        /** Badges do usuário. @default [] */
        badges?: Array<{
            type: string;
            version: string;
            url: string;
            description: string;
        }>;
        /** Emotes na mensagem. @default [] */
        emotes?: Array<{
            type: string;
            name: string;
            id: string;
            gif: boolean;
            urls: Record<string, string>;
            start: number;
            end: number;
        }>;
        /** Rendered text (HTML). Se omitido, usa `text`. */
        renderedText?: string;
        /** ID da mensagem. @default gerado automaticamente */
        msgId?: string;
        /** Custom reward ID (Channel Points). @default "" */
        customRewardId?: string;
        /** Tags extras do IRC a mesclar. */
        tags?: Record<string, string>;
    }): ChatMessage;
}

export declare interface ChatMessageStats {
    readonly wordCount: number;
    readonly emoteCount: number;
    readonly emotePercentage: number;
    readonly capsCount: number;
    readonly capsPercentage: number;
    readonly specialCharsCount: number;
    readonly specialCharsPercentage: number;
}

export declare interface CheerEvent extends BaseStreamEvent {
    readonly amount: number;
    readonly message: string;
}

/**
 * Retorna um `<img>` do GIF animado de cheer (Twitch) para o valor de bits dado.
 *
 * @param amount  Quantidade de bits
 * @param size    Tamanho do GIF (1, 2 ou 3). @default 1
 */
export declare function cheerGif(amount: number, size?: CheerGifSize): HTMLImageElement;

/** Tamanhos válidos para o GIF de cheer (1 = pequeno, 2 = médio, 3 = grande). */
export declare type CheerGifSize = 1 | 2 | 3;

/**
 * Retorna a URL do GIF animado de cheer (Twitch) para o valor de bits dado.
 *
 * @param amount  Quantidade de bits
 * @param size    Tamanho do GIF (1, 2 ou 3). @default 1
 */
export declare function cheerGifUrl(amount: number, size?: CheerGifSize): string;

export declare interface CommunityGiftEvent extends BaseStreamEvent {
    readonly amount: number;
    readonly count: number;
    readonly tier: string;
    readonly message: string;
    readonly sender: string;
    readonly gifted: boolean;
    readonly isCommunityGift: boolean;
    readonly playedAsCommunityGift: boolean;
}

/** Checa se `text` contém `snippet`. */
export declare function containsText(text: string, snippet: string, caseSensitive?: boolean): boolean;

/** Divide `text` por `splitter` e faz trim em cada item. */
export declare function createList(text: string, splitter?: string, removeEmpty?: boolean): string[];

/** Cria uma instância completa e opcionalmente anexa em `window.seTools`. */
export declare function createSeTools(options?: {
    attachToWindow?: boolean;
    eventTarget?: EventTarget;
}): SeTools;

export declare interface DeleteMessageEvent {
    readonly msgId: string;
}

export declare interface DeleteMessagesEvent {
    readonly userId: string;
}

/** Checa se `dividend` é divisível por `divisor`. */
export declare function divisibleBy(dividend: number, divisor: number): boolean;

export declare interface Emote {
    readonly type: string;
    readonly name: string;
    readonly id: string;
    readonly gif: boolean;
    readonly urls: Record<string, string>;
    readonly start: number;
    readonly end: number;
}

export declare class EventBus {
    private readonly target;
    private senderCorrection;
    private readonly expectedListeners;
    private readonly expectedNames;
    private readonly giftCollection;
    constructor(options?: EventBusOptions);
    /** Desabilita correção de sender em alertas de teste. */
    disableSenderCorrection(): void;
    /** Checa se um listener é "non-skippable" (não faz parte da fila de alertas). */
    isNonSkippable(listener: string): boolean;
    /** Remove todos os listeners registrados. */
    destroy(): void;
    private detectExpectedHandlers;
    private bindAll;
    private handleWidgetLoad;
    private handleSessionUpdate;
    private handleEventReceived;
    private expects;
    private routeEvent;
    private handleMessage;
    private routeSubscriber;
    private handleSubBomb;
    private handleCommunityGift;
}

/**
 * EventBus — Gerenciador type-safe de eventos StreamElements.
 *
 * Escuta os CustomEvents do SE (`onWidgetLoad`, `onSessionUpdate`, `onEventReceived`)
 * e despacha para handlers globais (`window.onSubscriber`, `window.onMessage`, etc.)
 *
 * Suporta injeção de `EventTarget` para facilitar testes.
 */
export declare interface EventBusOptions {
    /** EventTarget para add/removeEventListener (default: `window`). */
    eventTarget?: EventTarget;
    /** Se `true`, corrige `sender` em alertas de teste do SE (default: `true`). */
    senderCorrection?: boolean;
}

export declare interface EventListEntry {
    readonly name: SEEventName;
    readonly listener: string;
}

export declare interface FollowEvent extends BaseStreamEvent {
}

/** Formata valor monetário usando `Intl.NumberFormat`. */
export declare function formatCurrency(amount: number, currency: string, locale?: string): string;

/** Formata número com padding de zeros (ex: "01", "09"). */
export declare function formatTimerValue(n: number): string;

/** Checa se uma função global existe em `window`. */
export declare function funcExists(name: string): boolean;

/** Retorna a versão do Chrome (major ou full string). */
export declare function getChromeVersion(full?: boolean): number | string;

/** Porcentagem: `(value / total) * 100`. Retorna 0 se inválido. */
export declare function getPercentageOf(value: number, total: number): number;

/** Decimal aleatório com precisão. */
export declare function getRandomDecimal(min: number, max: number, decimals?: number): number;

/** Número inteiro aleatório entre `min` e `max` (inclusivo). */
export declare function getRandomInt(min: number, max: number): number;

export declare interface HostEvent extends BaseStreamEvent {
    readonly amount: number;
}

/** Checa se o user agent é Chrome/Chromium. */
export declare function isChrome(): boolean;

/** Checa se está rodando dentro de um OBS Browser Source. */
export declare function isOBSBrowserSource(): boolean;

/** Retorna `true` se o valor não for `null`, `undefined`, nem string vazia (quando `noEmpty = true`). */
export declare function isset(value: unknown, noEmpty?: boolean): boolean;

/** Verifica se `value` é uma string. */
export declare function isString(value: unknown): value is string;

/** Checa se o número é inteiro. */
export declare function isWholeNumber(n: number): boolean;

/** `kebab-case` → `camelCase`. */
export declare function kebabToCamel(str: string): string;

export declare interface KVStoreUpdateEvent {
    readonly key: string;
    readonly value: unknown;
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
export declare function lumeColor(hexColor: string, invert?: boolean): "dark" | "light";

/** Testa se `text` dá match com `regex`. */
export declare function matchesRegex(text: string, regex: RegExp): boolean;

/** Retorna os named groups de um regex match, ou `null`. */
export declare function matchRegexGroups(text: string, regex: RegExp): Record<string, string> | null;

/** Iterador circular: volta a 0 quando `i >= max`. */
export declare function nextIterator(i: number, max: number, step?: number): number;

/** Listeners que não podem ser pulados (não são alertas de fila). */
export declare const NON_SKIPPABLE_LISTENERS: Set<string>;

export declare interface ParsedCommand {
    readonly command: string;
    readonly args: readonly string[];
}

/**
 * Parsa uma cor hex (`#rgb`, `#rrggbb`) em componentes RGB.
 * Retorna `null` se o formato for inválido.
 */
export declare function parseHexColor(hex: string): RGB | null;

/**
 * Normaliza o valor de tier do StreamElements.
 *  - `"prime"` → `"prime"` (ou `1` se `primeAsTier1`)
 *  - `1000 | 1` → `1`, `2000 | 2` → `2`, `3000 | 3` → `3`
 */
export declare function parseTier(value: string | number, primeAsTier1?: boolean): number | "prime";

/**
 * Fila genérica assíncrona com processamento sequencial.
 * Implementa `Iterable` para uso com `for...of`.
 */
export declare class Queue<T> implements Iterable<T> {
    private readonly items;
    private processing;
    get length(): number;
    get isEmpty(): boolean;
    get isProcessing(): boolean;
    get first(): T | undefined;
    get last(): T | undefined;
    at(index: number): T | undefined;
    add(...elements: T[]): void;
    removeAt(index: number, count?: number): void;
    removeFirst(): T | undefined;
    removeLast(): T | undefined;
    clear(): void;
    [Symbol.iterator](): Iterator<T>;
    toArray(): readonly T[];
    /** Processa o primeiro item e o remove. */
    processFirst(fn: (item: T) => Promise<void>, delayAfter?: number): Promise<void>;
    /** Processa todos os itens sequencialmente, removendo cada um após conclusão. */
    processAll(fn: (item: T) => Promise<void>, delayBetween?: number): Promise<void>;
    private delay;
}

export declare interface RaidEvent extends BaseStreamEvent {
    readonly amount: number;
}

/** Cor hex aleatória. Ex: `#0a3fc2`. */
export declare function randomHexColor(): string;

/** Gera RGB aleatório. */
export declare function randomRGB(): RGB;

/** Cor `rgba(...)` aleatória. */
export declare function randomRGBAColor(alpha: number): string;

/** Cor `rgb(...)` aleatória. */
export declare function randomRGBColor(): string;

/**
 * Calcula a luminância relativa (0–1) de uma cor RGB.
 * Fórmula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export declare function relativeLuminance({ r, g, b }: RGB): number;

/** Checa se um caminho de propriedades existe em um objeto. */
export declare function resolves(path: string, obj: Record<string, unknown>): boolean;

export declare interface ResubEvent extends BaseStreamEvent {
    readonly amount: number;
    readonly tier: string;
    readonly message: string;
}

export declare interface RGB {
    readonly r: number;
    readonly g: number;
    readonly b: number;
}

export declare interface Roles {
    readonly staff: boolean;
    readonly broadcaster: boolean;
    readonly moderator: boolean;
    readonly vip: boolean;
    readonly subscriber: boolean;
}

/**
 * Mapeamento completo de nomes de evento SE → listeners do StreamElements.
 * Usado pelo EventBus para identificar qual handler disparar.
 */
export declare const SE_EVENTS: readonly EventListEntry[];

export declare interface SEEventMap {
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

export declare type SEEventName = keyof SEEventMap;

export declare interface SEMessageEvent {
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

export declare interface SeTools {
    ChatMessage: typeof ChatMessage;
    event: EventBus;
    Queue: typeof Queue;
    utils: typeof utils;
}

/**
 * Exibe uma imagem em posição aleatória (ou fixa) com animação de
 * entrada e saída usando Animate.css. A imagem é removida após a saída.
 */
export declare function showImage(opts: ShowImageOptions): Promise<void>;

export declare interface ShowImageOptions {
    /** URL da imagem */
    readonly url: string;
    /** Fator de escala (0–1). @default 0.5 */
    readonly size?: number;
    /** `"random"` ou coordenadas `{ x, y }`. @default "random" */
    readonly position?: "random" | {
        readonly x: number;
        readonly y: number;
    };
    /** Tempo em ms antes de animar a saída. @default 5000 */
    readonly duration?: number;
    /** Animação de entrada (Animate.css). @default "bounceIn" */
    readonly animationIn?: string;
    /** Animação de saída (Animate.css). @default "bounceOut" */
    readonly animationOut?: string;
}

/** Retorna uma Promise que resolve após `ms` milissegundos. */
export declare function sleep(ms: number): Promise<void>;

/**
 * Divide um texto em `<span>` individuais, cada um com animação Animate.css
 * escalonada (efeito letra-a-letra).
 *
 * @param text       Texto a ser dividido
 * @param animation  Nome da animação (sem prefixo). @default "tada"
 * @param prefix     Prefixo CSS do Animate.css. @default "animate__"
 * @returns Array de `HTMLSpanElement`
 */
export declare function splitAnimate(text: string, animation?: string, prefix?: string): HTMLSpanElement[];

/**
 * StreamElementsAdapter — Ponte entre payloads externos e o EventBus.
 *
 * Converte eventos recebidos (ex: via WebSocket) para o formato CustomEvent
 * esperado pelo StreamElements (`onEventReceived`).
 */
export declare class StreamElementsAdapter {
    private readonly target;
    private readonly nameToListener;
    constructor(eventTarget?: EventTarget);
    /** Despacha um payload bruto como `onEventReceived` CustomEvent. */
    dispatch(rawEvent: Record<string, unknown>): void;
    /** Escuta mensagens de um WebSocket e despacha automaticamente. */
    attachToSocket(ws: WebSocket): () => void;
}

export declare interface SubBombEvent extends BaseStreamEvent {
    readonly amount: number;
    readonly count: number;
    readonly tier: string;
    readonly message: string;
    readonly sender: string;
    readonly bulkGifted: boolean;
}

export declare interface SubGiftEvent extends BaseStreamEvent {
    readonly amount: number;
    readonly tier: string;
    readonly message: string;
    readonly sender: string;
    readonly gifted: boolean;
}

export declare interface SubscriberEvent extends BaseStreamEvent {
    readonly amount: number;
    readonly tier: string;
}

export declare interface TipEvent extends BaseStreamEvent {
    readonly amount: number;
    readonly message: string;
}

export declare interface ToggleSoundEvent {
    readonly muted: boolean;
}

/** Remove espaços extras e faz trim. */
export declare function trimSpaces(text: unknown): string;

/**
 * Reproduz texto via TTS do StreamElements.
 *
 * Depende de `SE_API.sanitize` — global disponível no overlay do StreamElements.
 * Em ambientes sem `SE_API`, retorna `0` silenciosamente.
 *
 * @param opts  Opções de voz
 * @returns Duração em segundos (via {@link audioPlay})
 */
export declare function tts(opts: TTSOptions): Promise<number>;

/** Opções para {@link tts}. */
export declare interface TTSOptions {
    /** Texto a ser falado. */
    readonly message: string;
    /** Nome da voz preferida. Se ausente ou não estiver na lista, uma voz aleatória é escolhida. */
    readonly voice?: string;
    /** Vozes disponíveis para sorteio (ex: `["Ines", "Cristiano"]`). */
    readonly voices?: readonly string[];
    /** Volume de 0 a 1. @default 1 */
    readonly volume?: number;
}

declare namespace utils {
    export {
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
        getRandomDecimal,
        getPercentageOf,
        randomRGB,
        randomHexColor,
        randomRGBColor,
        randomRGBAColor,
        formatCurrency,
        camelToKebab,
        kebabToCamel,
        parseTier,
        isOBSBrowserSource,
        isChrome,
        getChromeVersion,
        funcExists,
        callFunc,
        sleep,
        animateCSS,
        parseHexColor,
        relativeLuminance,
        lumeColor,
        audioPlay,
        showImage,
        splitAnimate,
        cheerGifUrl,
        cheerGif,
        tts,
        AudioPlayOptions,
        ShowImageOptions,
        CheerGifSize,
        TTSOptions
    }
}

export declare interface WidgetButtonEvent {
    readonly listener: string;
    readonly field: string;
    readonly value: string;
}

export { }
