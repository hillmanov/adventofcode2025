import { describe, it, expect } from "bun:test";
import  PriorityQueue  from "./priorityQueue";

describe("MinHeap", () => {
  it("should extract elements in ascending order based on comparator", () => {
    const minHeap = new PriorityQueue<number>((a, b) => a - b);
    const elements = [5, 3, 8, 1, 2, 7, 4, 6];

    elements.forEach((el) => minHeap.push(el));

    const sortedElements = [...elements].sort((a, b) => a - b);

    sortedElements.forEach((expected) => {
      const extracted = minHeap.pop();
      expect(extracted).toBe(expected);
    });

    expect(minHeap.pop()).toBeUndefined(); 
  });

  it("should maintain heap property after multiple push and pop operations", () => {
    const minHeap = new PriorityQueue<number>((a, b) => a - b);
    minHeap.push(10);
    minHeap.push(4);
    minHeap.push(15);
    minHeap.push(20);
    minHeap.push(0);
    minHeap.push(8);

    expect(minHeap.pop()).toBe(0);
    expect(minHeap.pop()).toBe(4);
    minHeap.push(2);
    expect(minHeap.pop()).toBe(2);
    expect(minHeap.pop()).toBe(8);
    expect(minHeap.pop()).toBe(10);
    expect(minHeap.pop()).toBe(15);
    expect(minHeap.pop()).toBe(20);
    expect(minHeap.pop()).toBeUndefined();
  });

  it("should handle duplicate elements correctly", () => {
    const minHeap = new PriorityQueue<number>((a, b) => a - b);
    const elements = [5, 3, 8, 3, 2, 5, 1, 2];

    elements.forEach((el) => minHeap.push(el));

    const sortedElements = [...elements].sort((a, b) => a - b);

    sortedElements.forEach((expected) => {
      const extracted = minHeap.pop();
      expect(extracted).toBe(expected);
    });

    expect(minHeap.pop()).toBeUndefined();
  });

  it("should return undefined when popping from an empty heap", () => {
    const minHeap = new PriorityQueue<number>((a, b) => a - b);
    expect(minHeap.pop()).toBeUndefined();
  });

  it("should handle single element heap correctly", () => {
    const minHeap = new PriorityQueue<number>((a, b) => a - b);
    minHeap.push(42);
    expect(minHeap.size()).toBe(1);
    expect(minHeap.pop()).toBe(42);
    expect(minHeap.size()).toBe(0);
    expect(minHeap.pop()).toBeUndefined();
  });

  it("should work correctly with a custom comparator (Max Heap)", () => {
    const maxHeap = new PriorityQueue<number>((a, b) => b - a);
    const elements = [5, 3, 8, 1, 2, 7, 4, 6];

    elements.forEach((el) => maxHeap.push(el));

    const sortedDescending = [...elements].sort((a, b) => b - a);

    sortedDescending.forEach((expected) => {
      const extracted = maxHeap.pop();
      expect(extracted).toBe(expected);
    });

    expect(maxHeap.pop()).toBeUndefined();
  });

  it("should handle complex objects with a comparator", () => {
    type Task = { name: string; priority: number };
    const tasks: Task[] = [
      { name: "Task 1", priority: 3 },
      { name: "Task 2", priority: 1 },
      { name: "Task 3", priority: 4 },
      { name: "Task 4", priority: 2 },
    ];

    const taskComparator = (a: Task, b: Task) => a.priority - b.priority;
    const taskHeap = new PriorityQueue<Task>(taskComparator);

    tasks.forEach((task) => taskHeap.push(task));

    const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority);

    sortedTasks.forEach((expected) => {
      const extracted = taskHeap.pop();
      expect(extracted).toEqual(expected);
    });

    expect(taskHeap.pop()).toBeUndefined();
  });

  it("should correctly report isEmpty and size", () => {
    const minHeap = new PriorityQueue<number>((a, b) => a - b);
    expect(minHeap.isEmpty()).toBe(true);
    expect(minHeap.size()).toBe(0);

    minHeap.push(10);
    expect(minHeap.isEmpty()).toBe(false);
    expect(minHeap.size()).toBe(1);

    minHeap.push(5);
    expect(minHeap.size()).toBe(2);

    minHeap.pop();
    expect(minHeap.size()).toBe(1);

    minHeap.pop();
    expect(minHeap.isEmpty()).toBe(true);
    expect(minHeap.size()).toBe(0);
  });
});

