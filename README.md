# se-tools v2

> Toolkit moderno para desenvolvedores de widgets **StreamElements** — tipagem completa, tree-shakeable, zero dependências runtime.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vite.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ O que mudou na v2

| Antes (v1)                          | Agora (v2)                                  |
| ----------------------------------- | ------------------------------------------- |
| Gulp + Browserify + Babel           | **Vite 6** (esbuild, rollup)                |
| TypeScript 4.9, `commonjs`          | **TypeScript 5.7**, `ESNext`, `strict`       |
| Classe `Utils` monolítica           | **Funções puras** tree-shakeable             |
| Sem testes                          | **Vitest** + happy-dom                       |
| Sem lint                            | **ESLint 9** flat config + typescript-eslint  |
| Tipos fracos (`any`)                | **Tipos discriminados** + `readonly`          |
| `Events` acoplado ao `window`       | **`EventBus`** com `EventTarget` injetável   |
| `Queue` com callbacks               | **`Queue`** async/await + `Iterable`          |
| Sem adaptador WebSocket             | **`StreamElementsAdapter`** incluso          |

---

## 📦 Instalação

```bash
npm install    # instala devDependencies
npm run build  # type-check + bundle (dist/)
```

### Arquivos gerados

| Arquivo                    | Formato | Minificado |
| -------------------------- | ------- | ---------- |
| `dist/se-tools.js`         | ES      | ❌         |
| `dist/se-tools.min.js`     | ES      | ✅         |
| `dist/se-tools.umd.cjs`    | UMD     | ❌         |
| `dist/se-tools.umd.min.cjs`| UMD     | ✅         |
| `dist/index.d.ts`          | Types   | —          |

---

## 🚀 Uso rápido

### No widget StreamElements (UMD)

Cole o conteúdo de `dist/se-tools.umd.min.cjs` no JS do widget, ou carregue via CDN no HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/xogumon/se.tools@2.0.0/dist/se-tools.umd.min.cjs"></script>
```

A lib se auto-registra em `window.seTools`:

```js
// Disponível globalmente
const q = new window.seTools.Queue();
q.add("alert1", "alert2");

// Funções utilitárias
const color = window.seTools.utils.randomHexColor();
const tier = window.seTools.utils.parseTier(2000); // 2
```

### Como módulo ES (import)

```ts
import { ChatMessage, Queue, EventBus, randomHexColor, parseTier } from "se-tools";

const bus = new EventBus();
const q = new Queue<string>();
q.add("hello");
```

---

## 📁 Estrutura do projeto

```
src/
├── index.ts                  # Barrel export + auto-attach
├── types.ts                  # Todos os tipos/interfaces
├── events.ts                 # Mapeamento SE event → listener
├── utils.ts                  # Funções puras (tree-shakeable)
├── Queue.ts                  # Fila genérica async/iterable
├── ChatMessage.ts            # Mensagem de chat (readonly)
├── EventBus.ts               # Gerenciador type-safe de eventos SE
├── StreamElementsAdapter.ts  # Ponte WebSocket → EventBus
├── utils.test.ts             # Testes unitários
├── Queue.test.ts
├── ChatMessage.test.ts
└── EventBus.test.ts
```

```
examples/
├── alert-widget/             # Widget de alertas (Sub, Tip, Cheer, Raid, etc.)
│   ├── widget.js             # JavaScript do widget
│   ├── widget.css            # Estilos (Bootstrap + Animate.css)
│   ├── widget.html           # HTML + scripts CDN
│   ├── fields.json           # Configurações do widget (editor SE)
│   └── data.json             # Dados padrão do widget
└── chat-widget/              # Widget de chat completo (TTS, emotes, etc.)
    ├── widget.js             # JavaScript do widget
    ├── widget.css            # Estilos (Bootstrap + Animate.css)
    ├── widget.html           # HTML + scripts CDN
    ├── fields.json           # Configurações do widget (editor SE)
    └── data.json             # Dados padrão do widget
```

---

## 🧪 Testes

```bash
npm test              # roda todos os testes
npm run test:watch    # watch mode
npm run test:coverage # cobertura de código
```

---

## 🛠 Scripts disponíveis

| Script              | Descrição                                  |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Build em watch mode                        |
| `npm run build`     | Type-check + build de produção             |
| `npm run lint`      | ESLint nos fontes                          |
| `npm run lint:fix`  | ESLint com auto-fix                        |
| `npm test`          | Roda os testes (Vitest)                    |
| `npm run typecheck` | Apenas type-check (sem emitir)             |
| `npm run clean`     | Limpa a pasta `dist/`                      |

---

## 📚 API Resumida

### `Queue<T>`

```ts
const q = new Queue<string>();
q.add("a", "b", "c");
q.first;         // "a"
q.last;          // "c"
q.at(-1);        // "c"
q.length;        // 3
q.isEmpty;       // false
[...q];          // ["a", "b", "c"]

await q.processFirst(async (item) => { /* ... */ });
await q.processAll(async (item) => { /* ... */ }, 100);
```

### `ChatMessage`

```ts
// Criado automaticamente pelo EventBus quando service === "twitch"
function onMessage(msg: ChatMessage) {
  msg.text;            // texto limpo
  msg.username;        // display name
  msg.isBroadcaster;   // boolean
  msg.isSubscriber;     // boolean
  msg.hasRole("mod");   // boolean
  msg.isCommand("play"); // boolean
  msg.getCommand(true);  // { command: "play", args: ["song"] }
  msg.contains("hello"); // boolean
  msg.stats;            // { wordCount, emoteCount, capsPercentage, ... }
  msg.hasPrimeBadge;    // boolean
  msg.tierBadge;        // 0 | 1 | 2 | 3
  msg.monthsSubscribed; // number
}
```

### `EventBus`

```ts
const bus = new EventBus({
  eventTarget: window,       // default
  senderCorrection: true,    // corrige sender em alertas de teste
});

bus.isNonSkippable("message"); // true
bus.disableSenderCorrection();
bus.destroy(); // remove todos os listeners
```

### `StreamElementsAdapter`

```ts
const adapter = new StreamElementsAdapter();
adapter.dispatch({ type: "tip", name: "User", amount: 5 });

const ws = new WebSocket("wss://...");
const cleanup = adapter.attachToSocket(ws);
// cleanup() para parar de ouvir
```

### Funções utilitárias (import individual)

```ts
import {
  // Checagem
  isset, allSet, isString,
  // Strings
  trimSpaces, createList, containsText,
  matchesRegex, matchRegexGroups,
  // Números
  getRandomInt, getPercentageOf,
  // Cores
  randomHexColor, randomRGBColor, randomRGBAColor,
  parseHexColor, relativeLuminance, lumeColor,
  // Formatação
  formatCurrency, parseTier,
  // Case
  camelToKebab, kebabToCamel,
  // Ambiente
  isChrome, isOBSBrowserSource,
  // Funções
  funcExists, callFunc,
  // DOM / Animação
  sleep, animateCSS, audioPlay, showImage,
} from "se-tools";
```

#### `sleep(ms)` — Pausa assíncrona

```ts
await sleep(1000); // espera 1 segundo
```

#### `animateCSS(element, animation, prefix?)` — Helper Animate.css

```ts
// Aplica animação e retorna Promise que resolve quando termina
await animateCSS("#myDiv", "bounceIn");
await animateCSS(document.querySelector(".card"), "fadeOut", "animate__");
```

#### `audioPlay(url, opts?, onLoad?)` — Reprodução de áudio

```ts
// Retorna a duração em segundos
const duration = await audioPlay("https://example.com/sound.mp3", {
  volume: 0.5,
  maxDuration: 10,
});
```

#### `showImage(opts)` — Exibir imagem animada

```ts
await showImage({
  url: "https://example.com/img.png",
  size: "200px",
  position: "center",       // "center" | "random"
  duration: 3000,
  animationIn: "zoomIn",
  animationOut: "zoomOut",
});
```

#### `lumeColor(hexColor, invert?)` — Contraste por luminância

```ts
lumeColor("#ffffff");        // "light"
lumeColor("#000000");        // "dark"
lumeColor("#ff0000", true);  // inverte: retorna a cor oposta para contraste
```

#### `parseHexColor(hex)` / `relativeLuminance(rgb)`

```ts
const rgb = parseHexColor("#ff8800"); // { r: 255, g: 136, b: 0 }
const lum = relativeLuminance(rgb);   // 0.0 – 1.0 (WCAG 2.0)
```

---

## 📝 Licença

[MIT](LICENSE) © Ronis Xogum
