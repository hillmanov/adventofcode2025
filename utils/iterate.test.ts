import { it, expect } from "bun:test";
import { uniquePermutations } from "./iterate";

it("returns unique permutations of [1,1,2]", () => {
  const input = [1, 1, 2];
  const output = uniquePermutations(input);

  expect(output.length).toBe(3);
  expect(output).toContainEqual([1, 1, 2]);
  expect(output).toContainEqual([1, 2, 1]);
  expect(output).toContainEqual([2, 1, 1]);
  expect(output).toContainEqual([2, 1, 1]);
});





