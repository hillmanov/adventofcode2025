


class PriorityQueue<T> {
  private heap: T[];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.heap = [];
    this.comparator = comparator;
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.size() === 0;
  }

  public push(item: T): void {
    this.heap.push(item);
    this.bubbleUp();
  }

  public pop(): T | undefined {
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0 && bottom !== undefined) {
      this.heap[0] = bottom;
      this.bubbleDown();
    }
    return top;
  }

  private bubbleUp(): void {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.comparator(this.heap[index], this.heap[parent]) >= 0) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  private bubbleDown(): void {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];

    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let swap = -1;

      if (left < length && this.comparator(this.heap[left], element) < 0) {
        swap = left;
      }

      if (right < length) {
        if (
          (swap === -1 && this.comparator(this.heap[right], element) < 0) ||
          (swap !== -1 && this.comparator(this.heap[right], this.heap[left]) < 0)
        ) {
          swap = right;
        }
      }

      if (swap === -1) break;

      [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
      index = swap;
    }
  }
}


export default PriorityQueue;
