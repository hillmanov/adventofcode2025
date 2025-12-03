import { readContents } from "../utils/io";
import { each, parseInt, sum } from 'lodash';

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
    const [lowerBound, upperBound] = [getHigherEventLength(min), getLowerEvenLength(max)].map(String)

    const [lowerBoundLeft, lowerBoundRight] = [lowerBound.substring(0, lowerBound.length / 2), lowerBound.substring(lowerBound.length / 2)].map(parseInt)
    const [upperBoundLeft, upperBoundRight] = [upperBound.substring(0, upperBound.length / 2), upperBound.substring(upperBound.length / 2)].map(parseInt)

    const [domainMin, domainMax] = [lowerBoundLeft, Math.max(lowerBoundLeft, lowerBoundRight, upperBoundLeft, upperBoundRight)];
    for (let i = domainMin; i <= domainMax; i++) {
      const testNum = parseInt(String(i) + String(i));
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
    if (getDigitCount(min) % 2 !== 0 && getDigitCount(max) % 2 !== 0)  {
      return;
    }
    const [lowerBound, upperBound] = [getHigherEventLength(min), getLowerEvenLength(max)].map(String)

    const [lowerBoundLeft, lowerBoundRight] = [lowerBound.substring(0, lowerBound.length / 2), lowerBound.substring(lowerBound.length / 2)].map(parseInt)
    const [upperBoundLeft, upperBoundRight] = [upperBound.substring(0, upperBound.length / 2), upperBound.substring(upperBound.length / 2)].map(parseInt)

    const [domainMin, domainMax] = [lowerBoundLeft, Math.max(lowerBoundLeft, lowerBoundRight, upperBoundLeft, upperBoundRight)];
    for (let i = domainMin; i <= domainMax; i++) {
      const testNum = parseInt(String(i) + String(i));
      if (testNum >= min && testNum <= max) {
        invalidIDs.push(testNum);
      }
    }

  });
  return sum(invalidIDs)
}

function getRepeats(min: number, max: number): number[] {
  const repeats: number[] = [];

  if (getHigherEventLength(min) < max) {
    for (let i = min; i <= getDigitCount(getHigherEventLength(min)); i++) {
      
    }
  }
  return repeats;
}

function doesRepeat(num: number, min: number, max: number): boolean {
  let repeater = String(num);
  while (repeater.length <= getDigitCount(max)) {
    repeater += repeater;
  }
  const repeated = parseInt(repeater);
  return repeated >= min && repeated <= max;
}

function getDigitCount(num: number): number {
  return num.toString().length;
}

function getHigherEventLength(num: number): number {
  if (getDigitCount(num) % 2 === 0) {
    return num;
  }

  return Math.pow(10, getDigitCount(num));
}

function getLowerEvenLength(num: number): number {
  if (getDigitCount(num) % 2 === 0) {
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
const part2Answer = null;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
