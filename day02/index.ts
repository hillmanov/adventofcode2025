import { readContents } from "../utils/io";
import { each, parseInt, uniq, map, sum, take, repeat } from 'lodash';

type Range = {
  min: number
  max: number
}

async function part1(): Promise<number> {
  const input = await getInput();
  const invalidIDs : number[] = []

  each(input, ({ min, max }) => {
    if (getDigitCount(min) % 2 !== 0 && getDigitCount(max) % 2 !== 0)  {
      return;
    }
    const [lowerBound, upperBound] = [getUpperBoundMagnitude(min).toString(), getMaxCurrentMagnitude(max).toString()]

    const start = parseInt(lowerBound.substring(0, lowerBound.length / 2));
    const end = parseInt(upperBound.substring(0, upperBound.length / 2));

    for (let i = start; i <= end; i++) {
      const testNum = (i * Math.pow(10, getDigitCount(i))) + i;
      if (testNum >= min && testNum <= max) {
        invalidIDs.push(testNum);
      }
    }

  });
  return sum(invalidIDs)
}

async function part2(): Promise<number> {
  const input = await getInput();
  const invalidIDs : number[] = []

  each(input, ({ min, max }) => {
    const explodedMin = explode(min);
    const explodedMax = explode(max);

    if (explodedMin.length < explodedMax.length) {
      explodedMin.unshift(0);
    }

    const len = Math.floor(explodedMin.length / 2);
  
    const numbersToCheck: Set<number> = new Set();
    const s = arrayToNum(take(explodedMin, len));
    const e = arrayToNum(take(explodedMax, len + (getDigitCount(max) - getDigitCount(min))));

    for (let i = s; i <= e; i++) {
      const exploded = explode(i)
      for (let j = 0; j <= exploded.length; j++) {
        numbersToCheck.add(arrayToNum(take(exploded, j+1)))
      }
    }

    for (const n of numbersToCheck) {
      const repeater = doesRepeat(n, min, max);
      if (repeater > 0) {
        invalidIDs.push(repeater);
      }
    }
  });

  return sum(uniq(invalidIDs))
}

function arrayToNum(nums: number[]): number {
  let number = 0;
  for (const [i, n] of nums.entries()) {
    number += n * Math.pow(10, (nums.length - i - 1));
  }
  return number;
}

function explode(num: number): number[] {
  return map(num.toString().split(""), parseInt);
}

function doesRepeat(num: number, min: number, max: number): number {
  const minRepeats = getDigitCount(min) / getDigitCount(num);
  const maxRepeats = getDigitCount(max) / getDigitCount(num);

  let minRepeater = repeat(String(num), minRepeats);
  let maxRepeater = repeat(String(num), maxRepeats);

  if (~~minRepeats > 1) {
    const minRepeated = parseInt(minRepeater);
    if (minRepeated >= min && minRepeated <= max) {
      return minRepeated;
    }
  }

  const maxRepeated = parseInt(maxRepeater);
  if (~~maxRepeats > 1) {
    if (maxRepeated >= min && maxRepeated <= max) {
      return maxRepeated;
    }
  }

  return -1;
}

function getDigitCount(num: number): number {
  return num.toString().length;
}

function getUpperBoundMagnitude(num: number, skipEvenCheck = true): number {
  if (getDigitCount(num) % 2 === 0 && skipEvenCheck) {
    return num;
  }

  return Math.pow(10, getDigitCount(num));
}

function getMaxCurrentMagnitude(num: number, skipEvenCheck = true): number {
  if (getDigitCount(num) % 2 === 0 && skipEvenCheck) {
    return num;
  }

  return Math.pow(10, getDigitCount(num)) - 1;
}

async function getInput(): Promise<Range[]> {
  const input = await readContents(__dirname + "/input.txt");
  return input.split(",").map((range) => {
    const parts = range.split("-");
    return {
      min: parseInt(parts[0]),
      max: parseInt(parts[1]),
    }
  })
}

const part1Answer = 28846518423;
const part2Answer = 31578210022;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
