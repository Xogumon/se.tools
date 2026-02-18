/**
 * Fila genérica assíncrona com processamento sequencial.
 * Implementa `Iterable` para uso com `for...of`.
 */
export class Queue<T> implements Iterable<T> {
  private readonly items: T[] = [];
  private processing = false;

  // ─── Tamanho & estado ───────────────────────────────────────────────────

  get length(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }

  get isProcessing(): boolean {
    return this.processing;
  }

  // ─── Acesso ─────────────────────────────────────────────────────────────

  get first(): T | undefined {
    return this.items[0];
  }

  get last(): T | undefined {
    return this.items.at(-1);
  }

  at(index: number): T | undefined {
    return this.items.at(index);
  }

  // ─── Modificação ────────────────────────────────────────────────────────

  add(...elements: T[]): void {
    this.items.push(...elements);
  }

  removeAt(index: number, count = 1): void {
    const i = index < 0 ? this.items.length + index : index;
    if (i >= 0 && i < this.items.length) {
      this.items.splice(i, count);
    }
  }

  removeFirst(): T | undefined {
    return this.items.shift();
  }

  removeLast(): T | undefined {
    return this.items.pop();
  }

  clear(): void {
    this.items.length = 0;
  }

  // ─── Iteração ───────────────────────────────────────────────────────────

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  toArray(): readonly T[] {
    return [...this.items];
  }

  // ─── Processamento assíncrono ───────────────────────────────────────────

  /** Processa o primeiro item e o remove. */
  async processFirst(
    fn: (item: T) => Promise<void>,
    delayAfter = 0,
  ): Promise<void> {
    const item = this.first;
    if (item === undefined || this.processing) return;

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
  async processAll(
    fn: (item: T) => Promise<void>,
    delayBetween = 0,
  ): Promise<void> {
    if (this.processing) return;

    this.processing = true;
    try {
      while (!this.isEmpty) {
        const item = this.first;
        if (item === undefined) break;

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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
