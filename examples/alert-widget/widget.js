/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  Alert Widget — Exemplo completo para StreamElements Custom Widget       ║
 * ║  Usa: se-tools v2 (UMD), Bootstrap 5.3, Animate.css 4                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Alertas: Follow, Sub, Resub, GiftSub, SubBomb, Raid, Cheer, Tip
 * Inclui TTS (Text-to-Speech) via StreamElements API
 */

// ─── Destructuring do se-tools ──────────────────────────────────────────────

const { Queue, utils } = window.seTools;
const {
  getRandomInt,
  createList,
  formatCurrency,
  animateCSS,
  audioPlay,
  sleep,
  splitAnimate,
  cheerGif,
  tts,
} = utils;

// ─── Estado global ──────────────────────────────────────────────────────────

let options = {};
let channelId = "";
let userCurrency = "";
let muted = false;
let isEditor = false;
let queue;

// ═══════════════════════════════════════════════════════════════════════════
//  Alert Play — Exibe o alerta visual animado
// ═══════════════════════════════════════════════════════════════════════════

async function alertPlay({ title, username, message, type, timeout }) {
  timeout = !isNaN(timeout) && Number(timeout) > 3000 ? Number(timeout) : 3000;

  const widgetContent = document.querySelector(".widget-container");

  // ── Container ───────────────────────────────────────────────────────────

  const alertContainer = document.createElement("div");
  alertContainer.classList.add(
    "d-flex",
    "align-items-center",
    "justify-content-center",
    "position-absolute",
    "alert-container",
    `alert-${type}`,
  );

  // ── Box ─────────────────────────────────────────────────────────────────

  const alertBox = document.createElement("div");
  alertBox.classList.add("alert-box", "position-relative");

  // ── Title ───────────────────────────────────────────────────────────────

  const alertTitle = document.createElement("div");
  alertTitle.classList.add("alert-title", "position-absolute");
  alertTitle.innerHTML = title;

  // ── Username (com efeito letra a letra) ─────────────────────────────────

  const alertUsername = document.createElement("div");
  alertUsername.classList.add(
    "d-flex",
    "justify-content-center",
    "align-items-center",
    "overflow-hidden",
    "alert-name",
    "fw-bold",
  );
  alertUsername.append(...splitAnimate(username));

  // ── Montagem ────────────────────────────────────────────────────────────

  alertBox.append(alertUsername, alertTitle);
  alertContainer.append(alertBox);
  widgetContent?.append(alertContainer);

  // ── Ajusta tamanho do username ──────────────────────────────────────────

  fitty(alertUsername, { minSize: 14, maxSize: 64, multiLine: false });

  // ── Anima entrada (animateCSS vem do se-tools) ──────────────────────────

  animateCSS(alertBox, "jackInTheBox");
  animateCSS(alertTitle, "wobble");
  animateCSS(alertUsername, "wobble");

  // ── Mensagem (balão abaixo do alerta) ───────────────────────────────────

  if (message) {
    await sleep(1000);

    const alertMessageArrow = document.createElement("div");
    Object.assign(alertMessageArrow.style, {
      border: "0.75rem solid transparent",
      borderTop: "none",
      borderBottomColor: "#fff",
      position: "absolute",
      top: "-10px",
      left: "50%",
      transform: "translateX(-50%)",
      filter: "drop-shadow(0 -0.0625rem 0.0625rem rgba(0, 0, 0, 0.25))",
    });

    const alertMessage = document.createElement("div");
    alertMessage.classList.add("alert-message", "position-absolute", "text-center");
    alertMessage.append(alertMessageArrow);
    alertMessage.innerHTML += message;

    alertContainer.append(alertMessage);

    const el = await animateCSS(alertMessage, "fadeInUp");
    await sleep(timeout - 2500);
    await animateCSS(el, "fadeOutDown");
    el.remove();
  }

  // ── Saída ───────────────────────────────────────────────────────────────

  await sleep(timeout);
  await animateCSS(alertBox, "hinge");
  alertContainer.remove();
}

// ═══════════════════════════════════════════════════════════════════════════
//  onAlert — Orquestra áudio + alerta visual + TTS
// ═══════════════════════════════════════════════════════════════════════════

async function onAlert(data) {
  const duration = await audioPlay(data?.audio_url ?? "", {}, (durationMs) => {
    alertPlay({
      title: data?.title,
      username: data?.username,
      message: data?.message,
      timeout: isFinite(durationMs) ? durationMs : null,
      type: data?.type,
    });
  });

  if (data?.tts) {
    const voices = createList(String(options.ttsLanguages), ",", true);
    await tts({
      message: data.tts,
      voices,
      volume: options.ttsVolume / 100,
    });
  }

  return duration;
}

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

function onEventSkip() {
  console.log("Event skipped!");
}

async function onSubscriber(data) {
  if (!options.activeSub) return;
  queue.add({
    audio_url: "{{subAudioUrl}}",
    title: "New sub!",
    username: data.name,
    type: data.type,
  });
  queue.processAll(onAlert, 1000);
}

async function onResub(data) {
  if (!options.activeSub) return;
  queue.add({
    audio_url: "{{resubAudioUrl}}",
    title: `Resub (x${data.amount})`,
    username: data.name,
    message: data.message,
    type: data.type,
    tts: `${data.name} disse: ${data.message}`,
  });
  queue.processAll(onAlert, 1000);
}

async function onSubGift(data) {
  if (!options.activeSub) return;
  queue.add({
    audio_url: "{{giftAudioUrl}}",
    title: `GiftSub para ${data.name}`,
    username: data.sender,
    type: data.type,
  });
  queue.processAll(onAlert, 1000);
}

async function onSubBomb(data) {
  if (!options.activeSub) return;
  queue.add({
    audio_url: "{{giftAudioUrl}}",
    title: `${data.amount} GiftSubs!`,
    username: data.sender,
    type: data.type,
  });
  queue.processAll(onAlert, 1000);
}

async function onRaid(data) {
  if (!options.activeRaid) return;
  const formattedAmount = data.amount.toLocaleString();
  const typeName = data.type.replace(/^\w/, (c) => c.toUpperCase());
  queue.add({
    audio_url: "{{raidAudioUrl}}",
    title: `${typeName} (${formattedAmount} 👀)`,
    username: data.name,
    type: data.type,
  });
  queue.processAll(onAlert, 1000);
}

async function onCheer(data) {
  if (!options.activeCheer) return;
  const filteredMessage = await SE_API.cheerFilter(data.message);
  queue.add({
    audio_url: "{{cheerAudioUrl}}",
    title: `${cheerGif(data.amount).outerHTML} ${data.amount} bits`,
    username: data.name,
    message: filteredMessage,
    type: data.type,
    tts: `${data.name} enviou ${data.amount} bits: "${filteredMessage}"`,
  });
  queue.processAll(onAlert, 1000);
}

async function onTip(data) {
  if (!options.activeTip) return;
  const formattedAmount = formatCurrency(data.amount, userCurrency.code, "pt-BR");
  const tipAudios = options?.tipAudioUrl ?? [];
  const tipAudio = tipAudios[getRandomInt(0, Math.max(0, tipAudios.length - 1))];
  queue.add({
    audio_url: tipAudio,
    title: formattedAmount,
    username: data.name,
    message: data.message,
    type: data.type,
    tts: `${data.name} enviou ${formattedAmount}: "${data.message}"`,
  });
  queue.processAll(onAlert, 1000);
}

async function onFollow(data) {
  if (!options.activeFollow) return;
  queue.add({
    audio_url: "{{followAudioUrl}}",
    title: "New follower",
    username: data.name,
    type: data.type,
  });
  queue.processAll(onAlert, 1000);
}

// ═══════════════════════════════════════════════════════════════════════════
//  Testes via botões do editor (onWidgetButton)
// ═══════════════════════════════════════════════════════════════════════════

function onWidgetButton(data) {
  const testHandlers = {
    testFollow() {
      onFollow({ name: "TestViewer", type: "follower" });
    },
    testSub() {
      onSubscriber({ name: "TestViewer", type: "subscriber" });
    },
    testResub() {
      onResub({
        name: "TestViewer",
        type: "subscriber",
        amount: 12,
        message: "Adoro esse canal! Já são 12 meses!",
      });
    },
    testGiftSub() {
      onSubGift({
        name: "LuckyViewer",
        sender: "GenerousUser",
        type: "subscriber",
      });
    },
    testRaid() {
      onRaid({ name: "BigStreamer", amount: 150, type: "raid" });
    },
    testCheer() {
      onCheer({
        name: "CheerLord",
        amount: 1000,
        message: "Toma esses bits! Cheer1000",
        type: "cheer",
      });
    },
    testTip() {
      onTip({
        name: "GenerosoViewer",
        amount: 25,
        message: "Para o café da manhã!",
        type: "tip",
      });
    },
  };

  const handler = testHandlers[data.field];
  if (handler) handler();
}
