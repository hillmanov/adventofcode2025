import { readLines } from "../utils/io";
import { parseInt, each, dropRight, sum, indexOf } from 'lodash';

async function part1(): Promise<number> {
  const banks = await getInput();
  let sum  = 0;

  each(banks, (bank) => {
    const indexOfLeftMost = bank.indexOf(Math.max(...dropRight(bank)));
    const indexOfRightMost = bank.indexOf(Math.max(...bank.slice(indexOfLeftMost + 1)));
    const left = bank[indexOfLeftMost];
    const right = bank[indexOfRightMost];
    sum += left * 10 + right;
  });

  return sum
}

async function part2(): Promise<number> {
  const banks = await getInput();

  const numbers: number[] = [];
  each(banks, bank => {
    const number = Array(12);
    for (let i = 12; i > 0; i--) {
      const biggestNumAvailable = Math.max(...dropRight(bank, i - 1));
      const indexOfBiggesNumAvailable = indexOf(bank, biggestNumAvailable);
      number[12 - i] = biggestNumAvailable;
      bank = bank.slice(indexOfBiggesNumAvailable + 1);
    }
    numbers.push(parseInt(number.join("")));
  });

  return sum(numbers);
}

async function getInput(): Promise<number[][]> {
  const lines = await readLines(__dirname + "/input.txt");
  return lines.map((line) => line.split("").map(parseInt))
}

const part1Answer = 17405;
const part2Answer = 171990312704598;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
