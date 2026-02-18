/**
 * StreamElementsAdapter — Ponte entre payloads externos e o EventBus.
 *
 * Converte eventos recebidos (ex: via WebSocket) para o formato CustomEvent
 * esperado pelo StreamElements (`onEventReceived`).
 */

import { SE_EVENTS } from "./events";

export class StreamElementsAdapter {
  private readonly target: EventTarget;
  private readonly nameToListener: ReadonlyMap<string, string>;

  constructor(eventTarget?: EventTarget) {
    this.target = eventTarget ?? window;
    this.nameToListener = new Map(
      SE_EVENTS.map((e) => [e.name.toLowerCase(), e.listener]),
    );
  }

  /** Despacha um payload bruto como `onEventReceived` CustomEvent. */
  dispatch(rawEvent: Record<string, unknown>): void {
    const name = String(rawEvent.type ?? rawEvent.name ?? "").toLowerCase();
    const listener = this.nameToListener.get(name)
      ?? (rawEvent.listener as string | undefined)
      ?? name;

    this.target.dispatchEvent(
      new CustomEvent("onEventReceived", {
        detail: { listener, event: rawEvent },
      }),
    );
  }

  /** Escuta mensagens de um WebSocket e despacha automaticamente. */
  attachToSocket(ws: WebSocket): () => void {
    const handler = (msg: MessageEvent): void => {
      try {
        const data = JSON.parse(String(msg.data)) as Record<string, unknown>;
        this.dispatch(data);
      } catch {
        // ignore non-JSON messages
      }
    };
    ws.addEventListener("message", handler);

    // Retorna função de cleanup
    return () => ws.removeEventListener("message", handler);
  }
}
