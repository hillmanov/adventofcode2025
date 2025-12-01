
export function times(n: number, fn: (i: number) => void) {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
}

export function uniquePermutations(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);

  const results: number[][] = [];
  const used = new Array(nums.length).fill(false);

  function backtrack(current: number[]): void {
    if (current.length === nums.length) {
      results.push([...current]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
      current.push(nums[i]);
      used[i] = true;
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return results;
}
