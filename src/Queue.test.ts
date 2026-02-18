import { describe, it, expect } from "vitest";
import { Queue } from "./Queue";

describe("Queue", () => {
  it("starts empty", () => {
    const q = new Queue<number>();
    expect(q.isEmpty).toBe(true);
    expect(q.length).toBe(0);
    expect(q.first).toBeUndefined();
    expect(q.last).toBeUndefined();
  });

  it("add/remove elements", () => {
    const q = new Queue<string>();
    q.add("a", "b", "c");
    expect(q.length).toBe(3);
    expect(q.first).toBe("a");
    expect(q.last).toBe("c");

    q.removeFirst();
    expect(q.first).toBe("b");
    expect(q.length).toBe(2);

    q.removeLast();
    expect(q.last).toBe("b");
    expect(q.length).toBe(1);
  });

  it("supports negative index with at()", () => {
    const q = new Queue<number>();
    q.add(10, 20, 30);
    expect(q.at(-1)).toBe(30);
    expect(q.at(-2)).toBe(20);
    expect(q.at(0)).toBe(10);
  });

  it("removeAt with negative index", () => {
    const q = new Queue<number>();
    q.add(1, 2, 3);
    q.removeAt(-1);
    expect(q.toArray()).toEqual([1, 2]);
  });

  it("clear empties the queue", () => {
    const q = new Queue<number>();
    q.add(1, 2, 3);
    q.clear();
    expect(q.isEmpty).toBe(true);
  });

  it("is iterable", () => {
    const q = new Queue<number>();
    q.add(1, 2, 3);
    const items = [...q];
    expect(items).toEqual([1, 2, 3]);
  });

  it("processFirst processes and removes first item", async () => {
    const q = new Queue<number>();
    q.add(10, 20);
    const processed: number[] = [];

    await q.processFirst(async (item) => {
      processed.push(item);
    });

    expect(processed).toEqual([10]);
    expect(q.length).toBe(1);
    expect(q.first).toBe(20);
  });

  it("processFirst does nothing on empty queue", async () => {
    const q = new Queue<number>();
    let called = false;
    await q.processFirst(async () => {
      called = true;
    });
    expect(called).toBe(false);
  });

  it("processAll processes all items sequentially", async () => {
    const q = new Queue<string>();
    q.add("a", "b", "c");
    const order: string[] = [];

    await q.processAll(async (item) => {
      order.push(item);
    });

    expect(order).toEqual(["a", "b", "c"]);
    expect(q.isEmpty).toBe(true);
  });

  it("processAll with delay between items", async () => {
    const q = new Queue<number>();
    q.add(1, 2);
    const timestamps: number[] = [];

    await q.processAll(async () => {
      timestamps.push(Date.now());
    }, 50);

    expect(q.isEmpty).toBe(true);
    if (timestamps.length === 2) {
      expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(40);
    }
  });

  it("processAll stops and throws on error", async () => {
    const q = new Queue<number>();
    q.add(1, 2, 3);

    await expect(
      q.processAll(async (item) => {
        if (item === 2) throw new Error("fail");
      }),
    ).rejects.toThrow("fail");

    // Item 2 was not removed (error before removeFirst)
    expect(q.isProcessing).toBe(false);
  });
});
