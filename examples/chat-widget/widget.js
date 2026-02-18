/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  Chat Widget — Exemplo completo para StreamElements Custom Widget        ║
 * ║  Usa: se-tools v2 (UMD), Bootstrap 5.3, Animate.css 4                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Como usar no editor do widget StreamElements:
 *  1. Cole widget.html  → aba "HTML"
 *  2. Cole widget.css   → aba "CSS"
 *  3. Cole fields.json  → aba "Fields"
 *  4. Cole data.json    → aba "Data"
 *  5. Cole este arquivo → aba "JS"
 *
 * A lib se-tools v2 é carregada via CDN no HTML:
 *   <script src="https://cdn.jsdelivr.net/gh/xogumon/se.tools@2.0.0/dist/se-tools.umd.min.cjs"></script>
 *
 * Nota: TinyColor2 NÃO é mais necessário — lumeColor agora está no se-tools.
 */

// ─── Destructuring do se-tools ──────────────────────────────────────────────

const { ChatMessage, Queue, utils } = window.seTools;
const {
  getRandomInt,
  createList,
  isString,
  animateCSS,
  audioPlay,
  lumeColor,
  showImage,
  sleep,
  tts,
} = utils;

// ─── DOM refs ───────────────────────────────────────────────────────────────

const toastsContainer = document.querySelector("#toasts");
const emotesContainer = document.querySelector("#emotes");

// ─── Estado global ──────────────────────────────────────────────────────────

let options = {};
let channelId = "";
let userCurrency = "";
let muted = false;
let isEditor = false;
let queue;

// ═══════════════════════════════════════════════════════════════════════════
//  Handlers do StreamElements
// ═══════════════════════════════════════════════════════════════════════════

function onWidgetLoad(obj) {
  const { fieldData, channel, currency, overlay } = obj.detail;

  options = fieldData;
  channelId = channel.providerId;
  userCurrency = currency;
  isEditor = overlay.isEditorMode;
  queue = new Queue();
}

function onBotCounter(data) {
  console.log(`Counter "${data.counter}" updated to: ${data.value}`);
}

function onEventSkip() {
  console.log("Event skipped!");
}

function onMessage(message) {
  if (!options.activeChat) return;

  try {
    const ignoreList = createList(String(options.ignore), ",", true);
    if (message.usernameOnList(ignoreList)) return;
    if (message.isCommand() && options.hideCommands) return;

    const {
      userId,
      username,
      msgId,
      badges,
      renderedText,
      text,
      highlighted,
      time,
      displayColor,
      isAction,
    } = message;

    // ── Toast ─────────────────────────────────────────────────────────────

    const toast = document.createElement("div");
    toast.id = msgId;
    toast.ariaLive = "assertive";
    toast.ariaAtomic = true;
    toast.classList.add("toast", `user-${userId}`);

    // ── Highlight → TTS ───────────────────────────────────────────────────

    if (highlighted) {
      toast.classList.add("bg-dark", "text-light");
      const voices = createList(String(options.ttsLanguages), ",", true);
      queue.add({
        message: `${username} disse: ${text}`,
        voices,
        volume: options.ttsVolume ? options.ttsVolume / 100 : 0.6,
      });
      queue.processAll(tts, 1000);
    }

    // ── Badges ────────────────────────────────────────────────────────────

    const badgeEls = badges.map((b) => {
      const img = document.createElement("img");
      img.classList.add("img-fluid", "me-1");
      img.title = b.description;
      img.alt = `${b.type}/${b.version}`;
      img.src = b.url;
      img.style.maxHeight = `${options.badgeSize}px`;
      return img;
    });

    // ── Username ──────────────────────────────────────────────────────────

    const nameEl = document.createElement("div");
    nameEl.classList.add("fw-bold");
    nameEl.innerText = username;

    // ── Timestamp ─────────────────────────────────────────────────────────

    const timeEl = document.createElement("small");
    timeEl.classList.add("ms-auto", "text-muted", "ps-2");
    timeEl.innerText = time.toLocaleTimeString("pt-BR", {
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    });

    // ── Message content ───────────────────────────────────────────────────

    const contentEl = document.createElement("span");
    contentEl.className = isAction ? "fst-italic fw-bolder" : "fw-bolder";
    contentEl.innerHTML = renderedText;

    // ── Header (lumeColor agora vem do se-tools, sem TinyColor2) ──────────

    const header = document.createElement("div");
    header.classList.add("toast-header", `text-${lumeColor(displayColor, true)}`);
    header.style.backgroundColor = displayColor;
    header.append(...badgeEls, nameEl, timeEl);

    // ── Body ──────────────────────────────────────────────────────────────

    const body = document.createElement("div");
    body.classList.add("toast-body", "d-flex", "align-items-start");
    body.append(contentEl);

    // ── Mount & animate (animateCSS agora vem do se-tools) ────────────────

    toast.append(header, body);
    toastsContainer?.append(toast);

    animateCSS(toast, options.animationIn).then(() => {
      if (options.hideAfter) {
        setTimeout(
          () => animateCSS(toast, options.animationOut).then(() => toast.remove()),
          options.hideAfter,
        );
      }
    });

    new bootstrap.Toast(toast, { animation: false, autohide: false }).show();
  } catch (err) {
    console.error("[ChatWidget]", err);
  }
}

function onDeleteMessage(data) {
  toastsContainer?.querySelector(`#${data.msgId}`)?.remove();
}

function onDeleteMessages(data) {
  toastsContainer
    ?.querySelectorAll(`.user-${data.userId}`)
    .forEach((el) => el.remove());
}

// ═══════════════════════════════════════════════════════════════════════════
//  Emote Explosion (Keepo)
// ═══════════════════════════════════════════════════════════════════════════

const Keepo = {
  ANIMATIONS: ["bounce", "bounceUp", "fadeUp", "fadeZoom", "rotate", "special"],

  ANIMATION_MAP: {
    bounce:   ["bounceIn",     "bounceOut"],
    bounceUp: ["bounceInUp",   "bounceOutUp"],
    rotate:   ["rotateIn",     "rotateOut"],
    special:  ["jackInTheBox", "hinge"],
    fadeZoom: ["zoomIn",       "zoomOut"],
    fadeUp:   ["fadeInUp",     "fadeOutUp"],
  },

  show(emoteUrl, animation = "fadeUp") {
    if (!isString(emoteUrl) || !emotesContainer) return;

    const img = document.createElement("img");
    img.src = emoteUrl;
    Object.assign(img.style, {
      position:       "absolute",
      top:            `${getRandomInt(100, window.innerHeight - 200)}px`,
      left:           `${getRandomInt(100, window.innerWidth - 200)}px`,
      height:         `${getRandomInt(options.minEmoteSize, options.maxEmoteSize)}rem`,
      animationDelay: `${getRandomInt(0, 1000)}ms`,
      transform:      `rotate(${getRandomInt(0, 360)}deg)`,
    });

    emotesContainer.append(img);

    if (animation.toLowerCase() === "random") {
      animation = this.ANIMATIONS[getRandomInt(0, this.ANIMATIONS.length - 1)];
    }

    const [animIn, animOut] = this.ANIMATION_MAP[animation] ?? ["fadeIn", "fadeOut"];

    // animateCSS agora vem do se-tools
    animateCSS(img, animIn).then(() => {
      setTimeout(() => {
        img.style.animationDuration = `${options.animationTime}ms`;
        img.style.animationDelay = `${getRandomInt(0, 1000)}ms`;
        animateCSS(img, animOut).then(() => img.remove());
      }, getRandomInt(0, 1000));
    });
  },

  explode(emoteUrls) {
    if (!Array.isArray(emoteUrls) || emoteUrls.length === 0) return;

    for (let i = 0; i < options.maxOnExplosion; i++) {
      this.show(emoteUrls[i % emoteUrls.length], "random");
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════
//  Testes via botões do editor (onWidgetButton)
// ═══════════════════════════════════════════════════════════════════════════

const TEST_BADGES = [
  { type: "subscriber", version: "12", url: "https://static-cdn.jtvnps.com/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1", description: "12-Month Subscriber" },
  { type: "moderator", version: "1", url: "https://static-cdn.jtvnps.com/badges/v1/3267646d-33f0-4b17-b163-e62ace2336f2/1", description: "Moderator" },
];

const TEST_MESSAGES = [
  "Olha que legal esse widget! PogChamp",
  "Alguém mais assistindo? LUL",
  "KEKW essa live tá demais",
  "Bora lá! Hoje tem maratona",
  "GG WP! Esse jogo é insano",
  "Primeiro dia aqui, adorei o canal!",
];

function onWidgetButton(data) {
  const randomText = TEST_MESSAGES[getRandomInt(0, TEST_MESSAGES.length - 1)];

  const presets = {
    testChat: { text: randomText },
    testHighlight: { text: randomText, highlighted: true },
    testAction: { text: randomText, isAction: true },
    testHighlightAction: { text: randomText, highlighted: true, isAction: true },
    testBadges: { text: randomText, badges: TEST_BADGES },
  };

  const preset = presets[data.field];
  if (!preset) return;

  const msg = ChatMessage.createTest({
    username: "TestUser",
    color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
    ...preset,
  });

  onMessage(msg);
}
