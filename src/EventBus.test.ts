import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventBus } from "./EventBus";

describe("EventBus", () => {
  let target: EventTarget;

  beforeEach(() => {
    target = new EventTarget();
    // Limpa globals
    for (const key of Object.keys(window)) {
      if (key.startsWith("on") && key !== "onload") {
        delete (window as unknown as Record<string, unknown>)[key];
      }
    }
  });

  afterEach(() => {
    for (const key of Object.keys(window)) {
      if (key.startsWith("on") && key !== "onload") {
        delete (window as unknown as Record<string, unknown>)[key];
      }
    }
  });

  it("calls onWidgetLoad when handler exists", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onWidgetLoad = handler;

    const _bus = new EventBus({ eventTarget: target });
    const event = new CustomEvent("onWidgetLoad", { detail: { data: "test" } });
    target.dispatchEvent(event);

    expect(handler).toHaveBeenCalledOnce();
  });

  it("calls onSessionUpdate when handler exists", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onSessionUpdate = handler;

    const _bus = new EventBus({ eventTarget: target });
    target.dispatchEvent(new CustomEvent("onSessionUpdate", { detail: {} }));

    expect(handler).toHaveBeenCalledOnce();
  });

  it("routes tip event to onTip", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onTip = handler;

    const _bus = new EventBus({ eventTarget: target });
    target.dispatchEvent(
      new CustomEvent("onEventReceived", {
        detail: {
          listener: "tip-latest",
          event: { name: "TestUser", amount: 5 },
        },
      }),
    );

    expect(handler).toHaveBeenCalledWith({ name: "TestUser", amount: 5 });
  });

  it("routes cheer event to onCheer", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onCheer = handler;

    const _bus = new EventBus({ eventTarget: target });
    target.dispatchEvent(
      new CustomEvent("onEventReceived", {
        detail: {
          listener: "cheer-latest",
          event: { name: "Cheerer", amount: 100 },
        },
      }),
    );

    expect(handler).toHaveBeenCalledWith({ name: "Cheerer", amount: 100 });
  });

  it("routes follow to onFollow", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onFollow = handler;

    const _bus = new EventBus({ eventTarget: target });
    target.dispatchEvent(
      new CustomEvent("onEventReceived", {
        detail: {
          listener: "follower-latest",
          event: { name: "Follower" },
        },
      }),
    );

    expect(handler).toHaveBeenCalledWith({ name: "Follower" });
  });

  it("routes new subscriber", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onSubscriber = handler;

    const _bus = new EventBus({ eventTarget: target });
    target.dispatchEvent(
      new CustomEvent("onEventReceived", {
        detail: {
          listener: "subscriber-latest",
          event: { name: "Sub", amount: 1, gifted: false, sender: undefined },
        },
      }),
    );

    expect(handler).toHaveBeenCalledOnce();
  });

  it("routes resub", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onResub = handler;

    const _bus = new EventBus({ eventTarget: target });
    target.dispatchEvent(
      new CustomEvent("onEventReceived", {
        detail: {
          listener: "subscriber-latest",
          event: { name: "Resub", amount: 12, sender: undefined },
        },
      }),
    );

    expect(handler).toHaveBeenCalledOnce();
  });

  it("routes gift sub", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onSubGift = handler;

    const _bus = new EventBus({ eventTarget: target });
    target.dispatchEvent(
      new CustomEvent("onEventReceived", {
        detail: {
          listener: "subscriber-latest",
          event: {
            name: "Receiver",
            gifted: true,
            isCommunityGift: false,
            sender: "Gifter",
          },
        },
      }),
    );

    expect(handler).toHaveBeenCalledOnce();
  });

  it("routes event:skip to onEventSkip", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onEventSkip = handler;

    const _bus = new EventBus({ eventTarget: target });
    target.dispatchEvent(
      new CustomEvent("onEventReceived", {
        detail: { listener: "event:skip", event: {} },
      }),
    );

    expect(handler).toHaveBeenCalledOnce();
  });

  it("destroy removes all listeners", () => {
    const handler = vi.fn();
    (window as unknown as Record<string, unknown>).onTip = handler;

    const bus = new EventBus({ eventTarget: target });
    bus.destroy();

    target.dispatchEvent(
      new CustomEvent("onEventReceived", {
        detail: {
          listener: "tip-latest",
          event: { name: "TestUser", amount: 5 },
        },
      }),
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it("isNonSkippable returns correct values", () => {
    const bus = new EventBus({ eventTarget: target });
    expect(bus.isNonSkippable("message")).toBe(true);
    expect(bus.isNonSkippable("bot:counter")).toBe(true);
    expect(bus.isNonSkippable("subscriber-latest")).toBe(false);
    expect(bus.isNonSkippable("tip-latest")).toBe(false);
  });
});
