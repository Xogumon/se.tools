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

Cole o conteúdo de `dist/se-tools.umd.min.cjs` (minificado) ou `dist/se-tools.umd.cjs` no JS do seu widget. A lib se auto-registra em `window.seTools`:

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
  isset, allSet, trimSpaces, createList, containsText,
  matchesRegex, matchRegexGroups,
  getRandomInt, getPercentageOf,
  randomHexColor, randomRGBColor, randomRGBAColor,
  formatCurrency, parseTier,
  camelToKebab, kebabToCamel,
  isChrome, isOBSBrowserSource,
  funcExists, callFunc,
} from "se-tools";
```

---

## 📝 Licença

[MIT](LICENSE) © Ronis Xogum
