(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.seTools = {}));
})(this, (function(exports2) {
  "use strict";
  function isset(value, noEmpty = true) {
    if (value === null || value === void 0) return false;
    if (noEmpty && typeof value === "string") return value !== "";
    return true;
  }
  function allSet(...values) {
    return values.every((v) => isset(v));
  }
  function resolves(path, obj) {
    let current = obj;
    for (const key of path.split(".")) {
      if (current == null || typeof current !== "object") return false;
      current = current[key];
      if (current === void 0) return false;
    }
    return true;
  }
  function isString(value) {
    return typeof value === "string";
  }
  function trimSpaces(text) {
    if (!isString(text)) return text == null ? "" : String(text);
    return text.replace(/\s+/g, " ").trim();
  }
  function createList(text, splitter = ",", removeEmpty = false) {
    if (!isString(text)) return [];
    const list = text.split(splitter).map((s) => trimSpaces(s));
    return removeEmpty ? list.filter((s) => s !== "") : list;
  }
  function containsText(text, snippet, caseSensitive = false) {
    if (!isString(text) || !isString(snippet)) return false;
    if (!allSet(text, snippet)) return false;
    if (caseSensitive) return text.includes(snippet);
    return text.toLowerCase().includes(snippet.toLowerCase());
  }
  function matchesRegex(text, regex) {
    if (!allSet(text, regex)) return false;
    return regex.test(text);
  }
  function matchRegexGroups(text, regex) {
    const match = regex.exec(text);
    return match?.groups ?? null;
  }
  function divisibleBy(dividend, divisor) {
    return divisor !== 0 && dividend % divisor === 0;
  }
  function isWholeNumber(n) {
    return Number.isInteger(n);
  }
  function nextIterator(i, max, step = 1) {
    return Math.abs(i) >= Math.abs(max) ? 0 : i + step;
  }
  function formatTimerValue(n) {
    return String(n).padStart(2, "0");
  }
  function getRandomInt(min, max) {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  }
  function getRandomDecimal(min, max, decimals = 2) {
    const factor = 10 ** decimals;
    return getRandomInt(min * factor, max * factor) / factor;
  }
  function getPercentageOf(value, total) {
    return value > 0 && total > 0 ? value / total * 100 : 0;
  }
  function randomRGB() {
    return {
      r: getRandomInt(0, 255),
      g: getRandomInt(0, 255),
      b: getRandomInt(0, 255)
    };
  }
  function randomHexColor() {
    const { r, g, b } = randomRGB();
    return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  }
  function randomRGBColor() {
    const { r, g, b } = randomRGB();
    return `rgb(${r}, ${g}, ${b})`;
  }
  function randomRGBAColor(alpha) {
    const a = alpha >= 0 && alpha <= 1 ? alpha : 1;
    const { r, g, b } = randomRGB();
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  function formatCurrency(amount, currency, locale) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: isWholeNumber(amount) ? 0 : 2
    }).format(amount);
  }
  function camelToKebab(str) {
    return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  }
  function kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
  }
  function parseTier(value, primeAsTier1 = false) {
    if (value === "prime") return primeAsTier1 ? 1 : "prime";
    const n = typeof value === "string" ? Number(value) : value;
    if (n === 1e3 || n === 1) return 1;
    if (n === 2e3 || n === 2) return 2;
    if (n === 3e3 || n === 3) return 3;
    return 0;
  }
  function isOBSBrowserSource() {
    try {
      return "obsstudio" in window;
    } catch {
      return false;
    }
  }
  function isChrome() {
    try {
      return /chrom(e|ium)/i.test(navigator.userAgent);
    } catch {
      return false;
    }
  }
  function getChromeVersion(full = false) {
    const groups = matchRegexGroups(
      navigator.userAgent,
      /chrom(?:e|ium)\/(?<version>\d+(?:\.\d+){0,3})/i
    );
    const ver = groups?.version ?? "0";
    return full ? ver : parseInt(ver, 10);
  }
  function funcExists(name) {
    try {
      return typeof window[name] === "function";
    } catch {
      return false;
    }
  }
  function callFunc(name, ...args) {
    if (funcExists(name)) {
      window[name](...args);
    }
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function animateCSS(element, animation, prefix = "animate__") {
    if (!element || !animation) {
      throw new Error("Both element and animation must be provided");
    }
    const node = element instanceof Element ? element : document.querySelector(element);
    if (!node) {
      throw new Error(`Element not found: ${String(element)}`);
    }
    const cls = `${prefix}${animation}`;
    node.classList.add(`${prefix}animated`, cls);
    return new Promise((resolve) => {
      node.addEventListener(
        "animationend",
        (e) => {
          e.stopPropagation();
          node.classList.remove(`${prefix}animated`, cls);
          resolve(node);
        },
        { once: true }
      );
    });
  }
  function parseHexColor(hex) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return null;
    const h = m[1];
    if (h.length === 3) {
      return {
        r: parseInt(h[0] + h[0], 16),
        g: parseInt(h[1] + h[1], 16),
        b: parseInt(h[2] + h[2], 16)
      };
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  function relativeLuminance({ r, g, b }) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  function lumeColor(hexColor, invert = false) {
    const rgb = parseHexColor(hexColor);
    const isDark = rgb ? relativeLuminance(rgb) < 0.179 : false;
    if (invert) return isDark ? "light" : "dark";
    return isDark ? "dark" : "light";
  }
  function audioPlay(url, opts = {}, onLoad) {
    return new Promise((resolve) => {
      try {
        if (!isString(url) || url === "") {
          throw new Error("URL não informada");
        }
        const { volume = 1, maxDuration = 0 } = opts;
        let timeout;
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          audio.volume = Math.max(0, Math.min(1, volume));
          audio.play().then(() => {
            const raw = audio.duration;
            const capped = maxDuration > 0 ? Math.min(raw, maxDuration) : raw;
            const ms = capped * 1e3;
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
  function showImage(opts) {
    const {
      url,
      size,
      position = "random",
      duration = 5e3,
      animationIn = "bounceIn",
      animationOut = "bounceOut"
    } = opts;
    return new Promise((resolve, reject) => {
      try {
        const image = new Image();
        image.src = url;
        image.onload = () => {
          const scale = size != null && !isNaN(size) ? size : 0.5;
          const pos = position === "random" ? {
            x: getRandomInt(0, window.innerWidth - Math.floor(image.width * scale)),
            y: getRandomInt(0, window.innerHeight - Math.floor(image.height * scale))
          } : position;
          const el = document.createElement("div");
          Object.assign(el.style, {
            position: "absolute",
            top: `${pos.y}px`,
            left: `${pos.x}px`,
            width: `${image.width * scale}px`,
            height: `${image.height * scale}px`,
            backgroundImage: `url(${url})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          });
          document.body.appendChild(el);
          animateCSS(el, animationIn).then((node) => {
            setTimeout(() => {
              animateCSS(node, animationOut).then((node2) => {
                node2.remove();
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
  function splitAnimate(text, animation = "tada", prefix = "animate__") {
    return String(text).split("").map((char, index) => {
      const span = document.createElement("span");
      span.className = `${prefix}animated ${prefix}${animation} ${prefix}infinite`;
      span.style.animationDelay = `${index * 100}ms`;
      span.innerText = char;
      return span;
    });
  }
  const CHEER_THRESHOLDS = [1, 100, 1e3, 5e3, 1e4, 25e3, 5e4, 1e5];
  function cheerGifUrl(amount, size = 1) {
    const validSizes = [1, 2, 3];
    const s = validSizes.includes(size) ? size : 1;
    const tier = CHEER_THRESHOLDS.reduce(
      (prev, curr) => amount >= curr ? curr : prev,
      1
    );
    return `https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/${tier}/${s}.gif`;
  }
  function cheerGif(amount, size = 1) {
    return Object.assign(document.createElement("img"), {
      className: "cheer-gif",
      src: cheerGifUrl(amount, size)
    });
  }
  async function tts(opts) {
    const { message, voice, voices = [], volume = 1 } = opts;
    const api = globalThis.SE_API;
    if (!api?.sanitize) return 0;
    const voiceList = [...voices];
    let selectedVoice = voice;
    if (!selectedVoice || !voiceList.includes(selectedVoice)) {
      selectedVoice = voiceList.length > 0 ? voiceList[getRandomInt(0, voiceList.length - 1)] : "Brian";
    }
    const { result, skip } = await api.sanitize({ message });
    if (skip || !result?.message) return 0;
    const audioUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${selectedVoice}&text=${encodeURI(result.message)}`;
    return audioPlay(audioUrl, { volume }).catch(() => 0);
  }
  const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    allSet,
    animateCSS,
    audioPlay,
    callFunc,
    camelToKebab,
    cheerGif,
    cheerGifUrl,
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
    isWholeNumber,
    isset,
    kebabToCamel,
    lumeColor,
    matchRegexGroups,
    matchesRegex,
    nextIterator,
    parseHexColor,
    parseTier,
    randomHexColor,
    randomRGB,
    randomRGBAColor,
    randomRGBColor,
    relativeLuminance,
    resolves,
    showImage,
    sleep,
    splitAnimate,
    trimSpaces,
    tts
  }, Symbol.toStringTag, { value: "Module" }));
  class ChatMessage {
    badges;
    badgeInfo;
    channel;
    customRewardId;
    highlighted;
    emotes;
    msgId;
    userId;
    username;
    displayColor;
    renderedText;
    text;
    roles;
    stats;
    time;
    isAction;
    /** Evento bruto original — mantido para acesso a campos não mapeados. */
    raw;
    constructor(event) {
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
      this.roles = ChatMessage.buildRoles(this.badges);
      this.stats = this.buildStats();
    }
    // ─── Roles ──────────────────────────────────────────────────────────────
    static buildRoles(badges) {
      const roles = {
        staff: false,
        broadcaster: false,
        moderator: false,
        vip: false,
        subscriber: false
      };
      const mutable = roles;
      for (const badge of badges) {
        if (badge.type in mutable) {
          mutable[badge.type] = true;
        }
      }
      return roles;
    }
    hasRole(role) {
      const map = {
        broadcaster: "broadcaster",
        streamer: "broadcaster",
        moderator: "moderator",
        mod: "moderator",
        vip: "vip",
        subscriber: "subscriber",
        sub: "subscriber",
        staff: "staff"
      };
      const key = map[role.toLowerCase()];
      return key ? this.roles[key] : false;
    }
    get isBroadcaster() {
      return this.roles.broadcaster;
    }
    get isModerator() {
      return this.roles.moderator;
    }
    get isVIP() {
      return this.roles.vip;
    }
    get isSubscriber() {
      return this.roles.subscriber;
    }
    get isStaff() {
      return this.roles.staff;
    }
    // ─── Badges ─────────────────────────────────────────────────────────────
    get hasPrimeBadge() {
      return this.badges.some((b) => b.type === "premium");
    }
    get hasTurboBadge() {
      return this.badges.some((b) => b.type === "turbo");
    }
    get tierBadge() {
      const groups = matchRegexGroups(
        this.raw.data.tags.badges,
        /subscriber\/(?<tier>[23]0)?\d+/i
      );
      if (!groups?.tier) return 0;
      if (groups.tier === "20") return 2;
      if (groups.tier === "30") return 3;
      return 1;
    }
    get monthsSubscribed() {
      const groups = matchRegexGroups(
        this.badgeInfo,
        /subscriber\/(?<months>[1-9]\d*)/i
      );
      return groups?.months ? parseInt(groups.months, 10) : 0;
    }
    get bitsBadge() {
      const groups = matchRegexGroups(
        this.raw.data.tags.badges,
        /bits\/(?<bits>[1-9]\d*)/i
      );
      return groups?.bits ? parseInt(groups.bits, 10) : 0;
    }
    get giftsBadge() {
      const groups = matchRegexGroups(
        this.raw.data.tags.badges,
        /sub-gifter\/(?<gifts>[1-9]\d*)/i
      );
      return groups?.gifts ? parseInt(groups.gifts, 10) : 0;
    }
    // ─── Stats ──────────────────────────────────────────────────────────────
    buildStats() {
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
        specialCharsPercentage: getPercentageOf(specialCharsCount, textLen)
      };
    }
    // ─── Reward / Highlight ─────────────────────────────────────────────────
    get isCustomReward() {
      return this.customRewardId !== null;
    }
    get isHighlight() {
      return this.highlighted;
    }
    // ─── Comandos ───────────────────────────────────────────────────────────
    isCommand(cmdName = "") {
      const cmd = cmdName.startsWith("!") ? cmdName : `!${cmdName}`;
      return this.text.startsWith(cmd);
    }
    getCommand(withArgs = false) {
      if (!this.text.startsWith("!")) return null;
      const groups = matchRegexGroups(
        this.text,
        /^!(?<cmd>\w+)\s?@?(?<args>[\w\s?]*)/i
      );
      if (!groups) return null;
      return withArgs ? { command: groups.cmd, args: createList(groups.args, " ", true) } : groups.cmd;
    }
    // ─── Conteúdo ───────────────────────────────────────────────────────────
    contains(text, caseSensitive = false) {
      return containsText(this.text, text, caseSensitive);
    }
    containsRegex(regex) {
      return matchesRegex(this.text, regex);
    }
    // ─── Username helpers ─────────────────────────────────────────────────
    usernameOnList(list) {
      const lower = this.username.toLowerCase();
      return list.some((entry) => entry.toLowerCase() === lower);
    }
    hasUsername(name) {
      return this.username.toLowerCase() === name.toLowerCase();
    }
    hasUserId(id) {
      return this.userId === String(id);
    }
    usernameContains(text, caseSensitive = false) {
      return containsText(this.username, text, caseSensitive);
    }
    usernameContainsRegex(regex) {
      return matchesRegex(this.username, regex);
    }
    // ─── Factory: evento de teste ───────────────────────────────────────────
    /**
     * Opções para gerar uma mensagem de teste.
     *
     * Apenas `text` é obrigatório — tudo mais tem defaults coerentes.
     */
    static TEST_DEFAULTS = {
      username: "TestUser",
      userId: "12345678",
      color: "#9146FF",
      channel: "testchannel"
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
    static createTest(opts) {
      const d = ChatMessage.TEST_DEFAULTS;
      const {
        text,
        username = d.username,
        userId = d.userId,
        color = d.color,
        channel = d.channel,
        highlighted = false,
        isAction = false,
        badges = [],
        emotes = [],
        renderedText = text,
        msgId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        customRewardId = "",
        tags = {}
      } = opts;
      const nick = username.toLowerCase();
      const event = {
        service: "twitch",
        renderedText,
        data: {
          time: Date.now(),
          tags: {
            "badge-info": "",
            badges: badges.map((b) => `${b.type}/${b.version}`).join(","),
            "client-nonce": "",
            color,
            "display-name": username,
            emotes: "",
            flags: "",
            id: msgId,
            mod: badges.some((b) => b.type === "moderator") ? "1" : "0",
            "room-id": "000000",
            subscriber: badges.some((b) => b.type === "subscriber") ? "1" : "0",
            "tmi-sent-ts": Date.now(),
            turbo: "0",
            "user-id": userId,
            "user-type": "",
            "msg-id": highlighted ? "highlighted-message" : "",
            "custom-reward-id": customRewardId,
            ...tags
          },
          nick,
          userId,
          displayName: username,
          displayColor: color,
          badges,
          channel,
          text,
          isAction,
          emotes,
          msgId
        }
      };
      return new ChatMessage(event);
    }
  }
  class Queue {
    items = [];
    processing = false;
    // ─── Tamanho & estado ───────────────────────────────────────────────────
    get length() {
      return this.items.length;
    }
    get isEmpty() {
      return this.items.length === 0;
    }
    get isProcessing() {
      return this.processing;
    }
    // ─── Acesso ─────────────────────────────────────────────────────────────
    get first() {
      return this.items[0];
    }
    get last() {
      return this.items.at(-1);
    }
    at(index) {
      return this.items.at(index);
    }
    // ─── Modificação ────────────────────────────────────────────────────────
    add(...elements) {
      this.items.push(...elements);
    }
    removeAt(index, count = 1) {
      const i = index < 0 ? this.items.length + index : index;
      if (i >= 0 && i < this.items.length) {
        this.items.splice(i, count);
      }
    }
    removeFirst() {
      return this.items.shift();
    }
    removeLast() {
      return this.items.pop();
    }
    clear() {
      this.items.length = 0;
    }
    // ─── Iteração ───────────────────────────────────────────────────────────
    [Symbol.iterator]() {
      return this.items[Symbol.iterator]();
    }
    toArray() {
      return [...this.items];
    }
    // ─── Processamento assíncrono ───────────────────────────────────────────
    /** Processa o primeiro item e o remove. */
    async processFirst(fn, delayAfter = 0) {
      const item = this.first;
      if (item === void 0 || this.processing) return;
      this.processing = true;
      try {
        await fn(item);
        if (delayAfter > 0) await this.delay(delayAfter);
        this.removeFirst();
      } finally {
        this.processing = false;
      }
    }
    /** Processa todos os itens sequencialmente, removendo cada um após conclusão. */
    async processAll(fn, delayBetween = 0) {
      if (this.processing) return;
      this.processing = true;
      try {
        while (!this.isEmpty) {
          const item = this.first;
          if (item === void 0) break;
          await fn(item);
          this.removeFirst();
          if (!this.isEmpty && delayBetween > 0) {
            await this.delay(delayBetween);
          }
        }
      } finally {
        this.processing = false;
      }
    }
    // ─── Helpers internos ───────────────────────────────────────────────────
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }
  const SE_EVENTS = [
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
    { name: "ToggleSound", listener: "alertService:toggleSound" }
  ];
  const NON_SKIPPABLE_LISTENERS = /* @__PURE__ */ new Set([
    "bot:counter",
    "event:test",
    "event:skip",
    "message",
    "delete-message",
    "delete-messages",
    "kvstore:update",
    "alertService:toggleSound"
  ]);
  class EventBus {
    target;
    senderCorrection;
    expectedListeners = /* @__PURE__ */ new Set();
    expectedNames = /* @__PURE__ */ new Set();
    giftCollection = /* @__PURE__ */ new Map();
    constructor(options = {}) {
      this.target = options.eventTarget ?? window;
      this.senderCorrection = options.senderCorrection ?? true;
      this.detectExpectedHandlers();
      this.bindAll();
    }
    // ─── Public API ───────────────────────────────────────────────────────
    /** Desabilita correção de sender em alertas de teste. */
    disableSenderCorrection() {
      this.senderCorrection = false;
    }
    /** Checa se um listener é "non-skippable" (não faz parte da fila de alertas). */
    isNonSkippable(listener) {
      return NON_SKIPPABLE_LISTENERS.has(listener);
    }
    /** Remove todos os listeners registrados. */
    destroy() {
      this.target.removeEventListener("onWidgetLoad", this.handleWidgetLoad);
      this.target.removeEventListener("onSessionUpdate", this.handleSessionUpdate);
      this.target.removeEventListener("onEventReceived", this.handleEventReceived);
    }
    // ─── Setup ────────────────────────────────────────────────────────────
    detectExpectedHandlers() {
      for (const entry of SE_EVENTS) {
        if (funcExists(`on${entry.name}`)) {
          this.expectedListeners.add(entry.listener);
          this.expectedNames.add(entry.name);
        }
      }
    }
    bindAll() {
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
    handleWidgetLoad = (e) => {
      callFunc("onWidgetLoad", e);
    };
    handleSessionUpdate = (e) => {
      callFunc("onSessionUpdate", e);
    };
    handleEventReceived = (e) => {
      const detail = e.detail;
      if (!detail) return;
      const { listener: l, event: ev } = detail;
      this.routeEvent(l, ev);
    };
    // ─── Roteamento ───────────────────────────────────────────────────────
    expects(name) {
      return this.expectedNames.has(name);
    }
    routeEvent(listener, e) {
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
          if (this.expects("WidgetButton") && e.listener === "widget-button") {
            callFunc("onWidgetButton", e);
          }
          break;
        case "kvstore:update":
          if (this.expects("KVStoreUpdate")) {
            callFunc("onKVStoreUpdate", e.data);
          }
          break;
        case "alertService:toggleSound":
          if (this.expects("ToggleSound")) callFunc("onToggleSound", e);
          break;
      }
    }
    // ─── Message ──────────────────────────────────────────────────────────
    handleMessage(e) {
      const service = String(e.service ?? "").toLowerCase();
      const payload = service === "twitch" ? new ChatMessage(e) : e;
      callFunc("onMessage", payload);
    }
    // ─── Subscriber routing ───────────────────────────────────────────────
    routeSubscriber(e) {
      if (this.senderCorrection && e.isTest && !(e.gifted && e.isCommunityGift) && !e.bulkGifted) {
        e.sender = void 0;
      }
      if (this.expects("Subscriber") && !e.gifted && e.amount === 1 && e.sender === void 0) {
        callFunc("onSubscriber", e);
        return;
      }
      if (this.expects("SubGift") && e.gifted && !e.isCommunityGift) {
        callFunc("onSubGift", e);
        return;
      }
      if (this.expects("Resub") && e.amount > 1 && e.sender === void 0) {
        callFunc("onResub", e);
        return;
      }
      if (e.bulkGifted) {
        this.handleSubBomb(e);
        return;
      }
      if (e.gifted && e.isCommunityGift) {
        this.handleCommunityGift(e);
      }
    }
    handleSubBomb(e) {
      if (this.expects("SubBombComplete")) {
        const sender = String(e.sender ?? "").toLowerCase();
        if (sender && !this.giftCollection.has(sender)) {
          this.giftCollection.set(sender, {
            amount: e.amount,
            recipients: []
          });
        }
      }
      if (this.expects("SubBomb")) {
        callFunc("onSubBomb", e);
      }
    }
    handleCommunityGift(e) {
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
  class StreamElementsAdapter {
    target;
    nameToListener;
    constructor(eventTarget) {
      this.target = eventTarget ?? window;
      this.nameToListener = new Map(
        SE_EVENTS.map((e) => [e.name.toLowerCase(), e.listener])
      );
    }
    /** Despacha um payload bruto como `onEventReceived` CustomEvent. */
    dispatch(rawEvent) {
      const name = String(rawEvent.type ?? rawEvent.name ?? "").toLowerCase();
      const listener = this.nameToListener.get(name) ?? rawEvent.listener ?? name;
      this.target.dispatchEvent(
        new CustomEvent("onEventReceived", {
          detail: { listener, event: rawEvent }
        })
      );
    }
    /** Escuta mensagens de um WebSocket e despacha automaticamente. */
    attachToSocket(ws) {
      const handler = (msg) => {
        try {
          const data = JSON.parse(String(msg.data));
          this.dispatch(data);
        } catch {
        }
      };
      ws.addEventListener("message", handler);
      return () => ws.removeEventListener("message", handler);
    }
  }
  function createSeTools(options) {
    const tools = {
      ChatMessage,
      event: new EventBus({ eventTarget: options?.eventTarget }),
      Queue,
      utils
    };
    if (options?.attachToWindow !== false) {
      window.seTools = tools;
    }
    return tools;
  }
  createSeTools({ attachToWindow: true });
  exports2.ChatMessage = ChatMessage;
  exports2.EventBus = EventBus;
  exports2.NON_SKIPPABLE_LISTENERS = NON_SKIPPABLE_LISTENERS;
  exports2.Queue = Queue;
  exports2.SE_EVENTS = SE_EVENTS;
  exports2.StreamElementsAdapter = StreamElementsAdapter;
  exports2.allSet = allSet;
  exports2.animateCSS = animateCSS;
  exports2.audioPlay = audioPlay;
  exports2.callFunc = callFunc;
  exports2.camelToKebab = camelToKebab;
  exports2.cheerGif = cheerGif;
  exports2.cheerGifUrl = cheerGifUrl;
  exports2.containsText = containsText;
  exports2.createList = createList;
  exports2.createSeTools = createSeTools;
  exports2.divisibleBy = divisibleBy;
  exports2.formatCurrency = formatCurrency;
  exports2.formatTimerValue = formatTimerValue;
  exports2.funcExists = funcExists;
  exports2.getChromeVersion = getChromeVersion;
  exports2.getPercentageOf = getPercentageOf;
  exports2.getRandomDecimal = getRandomDecimal;
  exports2.getRandomInt = getRandomInt;
  exports2.isChrome = isChrome;
  exports2.isOBSBrowserSource = isOBSBrowserSource;
  exports2.isString = isString;
  exports2.isWholeNumber = isWholeNumber;
  exports2.isset = isset;
  exports2.kebabToCamel = kebabToCamel;
  exports2.lumeColor = lumeColor;
  exports2.matchRegexGroups = matchRegexGroups;
  exports2.matchesRegex = matchesRegex;
  exports2.nextIterator = nextIterator;
  exports2.parseHexColor = parseHexColor;
  exports2.parseTier = parseTier;
  exports2.randomHexColor = randomHexColor;
  exports2.randomRGB = randomRGB;
  exports2.randomRGBAColor = randomRGBAColor;
  exports2.randomRGBColor = randomRGBColor;
  exports2.relativeLuminance = relativeLuminance;
  exports2.resolves = resolves;
  exports2.showImage = showImage;
  exports2.sleep = sleep;
  exports2.splitAnimate = splitAnimate;
  exports2.trimSpaces = trimSpaces;
  exports2.tts = tts;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
//# sourceMappingURL=se-tools.umd.cjs.map
