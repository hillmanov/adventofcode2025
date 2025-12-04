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
    const myInvalidIds = [];
    const explodedMin = explode(min);
    const explodedMax = explode(max);
    if (explodedMin.length < explodedMax.length) {
      explodedMin.unshift(0);
    }

    const len = explodedMin.length / 2;
  
    const numbersToCheck: number[] = [];
    for (let i = 0; i <= len; i++) {
      numbersToCheck.push(numberify(take(explodedMin, i+1)))
      numbersToCheck.push(numberify(take(explodedMax, i+1)))
    }
    
    // Handle the case when the first digits are different, like 2000-5000
    if (explodedMin[0] < explodedMax[0]) {
      for (let i = explodedMin[0]; i <= numberify(take(explodedMax, len)); i++) {
        numbersToCheck.push(i);
      }
    }

    for (const n of uniq(numbersToCheck)) {
      const repeater = doesRepeat(n, min, max);
      if (repeater > 0) {
        myInvalidIds.push(repeater);
        invalidIDs.push(repeater);
      }
    }
    console.log(`min, max`, min, max);
    for (const n of myInvalidIds.sort()) {
      console.log(`\t ${n}`)
    }
  });

  return sum(uniq(invalidIDs))
}

function numberify(nums: number[]): number {
  let number = 0;
  for (const [i, n] of nums.entries()) {
    number += n * Math.pow(10, (nums.length - i - 1));
  }
  return number;
}

function getRepeats(min: number, max: number): number[] {
  const repeats = [];

  const minExploded = explode(min);
  const maxExploded = explode(max);

  if (getDigitCount(min) <= getDigitCount(max)) {
    minExploded.unshift(0);
  }

  for (let minI = 0; minI <= getDigitCount(min) / 2; minI++) {
    const start = parseInt(take(minExploded, minI + 1).join(''));
    const end = parseInt(take(maxExploded, minI + 1).join(''));
    for (let p = start; p <= end; p++) {
      const pR = doesRepeat(p, min, max);
      if (pR > 0) {
        repeats.push(pR);
      }
    }
  }

  return repeats;
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
// 31560764177 too low
// 31561404580 too low
// 31561483134 too low
// 31578210022

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
