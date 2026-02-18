import { describe, it, expect } from "vitest";
import { ChatMessage } from "./ChatMessage";
import type { SEMessageEvent } from "./types";

function createMockEvent(overrides: Partial<{
  text: string;
  displayName: string;
  badges: Array<{ type: string; version: string; url: string; description: string }>;
  isAction: boolean;
  displayColor: string;
  msgId: string;
  emotes: Array<{ type: string; name: string; id: string; gif: boolean; urls: Record<string, string>; start: number; end: number }>;
  tags: Record<string, string>;
}> = {}): SEMessageEvent {
  return {
    service: "twitch",
    renderedText: overrides.text ?? "Hello world",
    data: {
      time: Date.now(),
      tags: {
        "badge-info": "",
        badges: "",
        "client-nonce": "",
        color: "#FF0000",
        "display-name": overrides.displayName ?? "TestUser",
        emotes: "",
        flags: "",
        id: "msg-1",
        mod: "0",
        "room-id": "12345",
        subscriber: "0",
        "tmi-sent-ts": Date.now(),
        turbo: "0",
        "user-id": "67890",
        "user-type": "",
        "msg-id": "",
        "custom-reward-id": "",
        ...overrides.tags,
      },
      nick: "testuser",
      userId: "67890",
      displayName: overrides.displayName ?? "TestUser",
      displayColor: overrides.displayColor ?? "#FF0000",
      badges: overrides.badges ?? [],
      channel: "testchannel",
      text: overrides.text ?? "Hello world",
      isAction: overrides.isAction ?? false,
      emotes: overrides.emotes ?? [],
      msgId: overrides.msgId ?? "msg-1",
    },
  };
}

describe("ChatMessage", () => {
  it("parses basic message properties", () => {
    const msg = new ChatMessage(createMockEvent({ text: "Hello  world!" }));
    expect(msg.text).toBe("Hello world!");
    expect(msg.username).toBe("TestUser");
    expect(msg.channel).toBe("testchannel");
    expect(msg.userId).toBe("67890");
  });

  it("detects broadcaster role", () => {
    const msg = new ChatMessage(
      createMockEvent({
        badges: [{ type: "broadcaster", version: "1", url: "", description: "" }],
      }),
    );
    expect(msg.isBroadcaster).toBe(true);
    expect(msg.isModerator).toBe(false);
    expect(msg.hasRole("broadcaster")).toBe(true);
    expect(msg.hasRole("streamer")).toBe(true);
  });

  it("detects moderator role", () => {
    const msg = new ChatMessage(
      createMockEvent({
        badges: [{ type: "moderator", version: "1", url: "", description: "" }],
      }),
    );
    expect(msg.isModerator).toBe(true);
    expect(msg.hasRole("mod")).toBe(true);
  });

  it("detects VIP role", () => {
    const msg = new ChatMessage(
      createMockEvent({
        badges: [{ type: "vip", version: "1", url: "", description: "" }],
      }),
    );
    expect(msg.isVIP).toBe(true);
    expect(msg.hasRole("vip")).toBe(true);
  });

  it("detects subscriber role", () => {
    const msg = new ChatMessage(
      createMockEvent({
        badges: [{ type: "subscriber", version: "1", url: "", description: "" }],
      }),
    );
    expect(msg.isSubscriber).toBe(true);
    expect(msg.hasRole("sub")).toBe(true);
  });

  it("hasRole returns false for unknown role", () => {
    const msg = new ChatMessage(createMockEvent());
    expect(msg.hasRole("admin")).toBe(false);
  });

  it("detects highlighted message", () => {
    const msg = new ChatMessage(
      createMockEvent({ tags: { "msg-id": "highlighted-message" } }),
    );
    expect(msg.isHighlight).toBe(true);
  });

  it("detects custom reward", () => {
    const msg = new ChatMessage(
      createMockEvent({ tags: { "custom-reward-id": "reward-123" } }),
    );
    expect(msg.isCustomReward).toBe(true);
  });

  it("detects action message", () => {
    const msg = new ChatMessage(createMockEvent({ isAction: true }));
    expect(msg.isAction).toBe(true);
  });

  it("detects prime badge", () => {
    const msg = new ChatMessage(
      createMockEvent({
        badges: [{ type: "premium", version: "1", url: "", description: "" }],
      }),
    );
    expect(msg.hasPrimeBadge).toBe(true);
  });

  it("detects turbo badge", () => {
    const msg = new ChatMessage(
      createMockEvent({
        badges: [{ type: "turbo", version: "1", url: "", description: "" }],
      }),
    );
    expect(msg.hasTurboBadge).toBe(true);
  });

  it("calculates stats", () => {
    const msg = new ChatMessage(createMockEvent({ text: "Hello WORLD" }));
    expect(msg.stats.wordCount).toBe(2);
    expect(msg.stats.emoteCount).toBe(0);
    expect(msg.stats.capsCount).toBe(6); // H, W, O, R, L, D
  });

  it("isCommand detects commands", () => {
    const msg = new ChatMessage(createMockEvent({ text: "!play song" }));
    expect(msg.isCommand()).toBe(true);
    expect(msg.isCommand("play")).toBe(true);
    expect(msg.isCommand("!play")).toBe(true);
    expect(msg.isCommand("stop")).toBe(false);
  });

  it("getCommand parses command without args", () => {
    const msg = new ChatMessage(createMockEvent({ text: "!play mysong" }));
    const cmd = msg.getCommand();
    expect(cmd).toBe("play");
  });

  it("getCommand parses command with args", () => {
    const msg = new ChatMessage(createMockEvent({ text: "!play mysong cool" }));
    const cmd = msg.getCommand(true);
    expect(cmd).toEqual({ command: "play", args: ["mysong", "cool"] });
  });

  it("getCommand returns null for non-commands", () => {
    const msg = new ChatMessage(createMockEvent({ text: "hello world" }));
    expect(msg.getCommand()).toBeNull();
  });

  it("contains checks text content", () => {
    const msg = new ChatMessage(createMockEvent({ text: "Hello World" }));
    expect(msg.contains("hello")).toBe(true);
    expect(msg.contains("xyz")).toBe(false);
  });

  it("containsRegex matches regex", () => {
    const msg = new ChatMessage(createMockEvent({ text: "test123" }));
    expect(msg.containsRegex(/\d+/)).toBe(true);
    expect(msg.containsRegex(/^[a-z]+$/)).toBe(false);
  });

  it("usernameOnList checks list", () => {
    const msg = new ChatMessage(createMockEvent({ displayName: "TestUser" }));
    expect(msg.usernameOnList(["testuser", "other"])).toBe(true);
    expect(msg.usernameOnList(["other"])).toBe(false);
  });

  it("hasUsername checks case insensitive", () => {
    const msg = new ChatMessage(createMockEvent({ displayName: "TestUser" }));
    expect(msg.hasUsername("testuser")).toBe(true);
    expect(msg.hasUsername("TESTUSER")).toBe(true);
    expect(msg.hasUsername("other")).toBe(false);
  });

  it("hasUserId checks id", () => {
    const msg = new ChatMessage(createMockEvent());
    expect(msg.hasUserId("67890")).toBe(true);
    expect(msg.hasUserId(67890)).toBe(true);
    expect(msg.hasUserId("99999")).toBe(false);
  });

  it("uses random hex color when displayColor is empty", () => {
    const msg = new ChatMessage(createMockEvent({ displayColor: "" }));
    expect(msg.displayColor).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("preserves display color when provided", () => {
    const msg = new ChatMessage(createMockEvent({ displayColor: "#ABCDEF" }));
    expect(msg.displayColor).toBe("#ABCDEF");
  });
});

// ─── ChatMessage.createTest ─────────────────────────────────────────────────

describe("ChatMessage.createTest", () => {
  it("creates a valid ChatMessage with minimal options", () => {
    const msg = ChatMessage.createTest({ text: "Hello!" });
    expect(msg).toBeInstanceOf(ChatMessage);
    expect(msg.text).toBe("Hello!");
    expect(msg.username).toBe("TestUser");
    expect(msg.displayColor).toBe("#9146FF");
    expect(msg.highlighted).toBe(false);
    expect(msg.isAction).toBe(false);
  });

  it("creates a highlighted message", () => {
    const msg = ChatMessage.createTest({ text: "KEKW", highlighted: true });
    expect(msg.highlighted).toBe(true);
    expect(msg.isHighlight).toBe(true);
    expect(msg.raw.data.tags["msg-id"]).toBe("highlighted-message");
  });

  it("creates a non-highlighted message", () => {
    const msg = ChatMessage.createTest({ text: "normal" });
    expect(msg.highlighted).toBe(false);
    expect(msg.raw.data.tags["msg-id"]).toBe("");
  });

  it("creates an action message (/me)", () => {
    const msg = ChatMessage.createTest({ text: "is testing", isAction: true });
    expect(msg.isAction).toBe(true);
  });

  it("accepts custom username and color", () => {
    const msg = ChatMessage.createTest({
      text: "oi",
      username: "Ronis",
      color: "#FF00FF",
    });
    expect(msg.username).toBe("Ronis");
    expect(msg.displayColor).toBe("#FF00FF");
  });

  it("generates unique msgId by default", () => {
    const a = ChatMessage.createTest({ text: "a" });
    const b = ChatMessage.createTest({ text: "b" });
    expect(a.msgId).not.toBe(b.msgId);
    expect(a.msgId).toMatch(/^test-/);
  });

  it("accepts custom msgId", () => {
    const msg = ChatMessage.createTest({ text: "x", msgId: "custom-123" });
    expect(msg.msgId).toBe("custom-123");
  });

  it("creates message with badges", () => {
    const msg = ChatMessage.createTest({
      text: "hi",
      badges: [
        { type: "subscriber", version: "12", url: "", description: "12-Month Sub" },
        { type: "moderator", version: "1", url: "", description: "Mod" },
      ],
    });
    expect(msg.isSubscriber).toBe(true);
    expect(msg.isModerator).toBe(true);
    expect(msg.badges).toHaveLength(2);
  });

  it("sets subscriber and mod tags from badges", () => {
    const msg = ChatMessage.createTest({
      text: "hi",
      badges: [{ type: "moderator", version: "1", url: "", description: "" }],
    });
    expect(msg.raw.data.tags.mod).toBe("1");
    expect(msg.raw.data.tags.subscriber).toBe("0");
  });

  it("creates highlighted + action combined", () => {
    const msg = ChatMessage.createTest({
      text: "combo test",
      highlighted: true,
      isAction: true,
    });
    expect(msg.highlighted).toBe(true);
    expect(msg.isAction).toBe(true);
  });

  it("uses text as renderedText by default", () => {
    const msg = ChatMessage.createTest({ text: "raw text" });
    expect(msg.renderedText).toBe("raw text");
  });

  it("accepts custom renderedText", () => {
    const msg = ChatMessage.createTest({
      text: "Kappa",
      renderedText: '<img class="emote" src="kappa.png" /> Kappa',
    });
    expect(msg.renderedText).toContain("<img");
    expect(msg.text).toBe("Kappa");
  });

  it("accepts custom reward ID", () => {
    const msg = ChatMessage.createTest({
      text: "reward",
      customRewardId: "abc-123",
    });
    expect(msg.isCustomReward).toBe(true);
    expect(msg.customRewardId).toBe("abc-123");
  });
});
