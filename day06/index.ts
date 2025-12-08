import { readLines } from "../utils/io";
import { each, map, parseInt, constant, times } from "lodash";

type NumRange = {
  startIndex: number | null
  stopIndex: number | null
}

async function part1(): Promise<number> {
  const { inputRows, operators } = await getInput();

  const answers: number[] = [];
  const operands = rotate(inputRows)

  for (const [index, operator] of operators.entries()) {
    switch (operator) {
    case '+':
      answers.push(sum(operands[index]))
      break;
    case '*':
      answers.push(product(operands[index]))
    }
  }

  return sum(answers);
}

async function part2(): Promise<number> {
  let { ranges, inputRows, operators } = await getInput2();

  let problemColumns: NumRange[] = [];

  for (let col = 0; col < ranges[0].length; col++) {
    let minCol = ranges[0][col].startIndex;
    let maxCol = ranges[0][col].stopIndex;
    for (let row = 0; row < ranges.length; row++) {
      minCol = Math.min(ranges[row][col].startIndex, minCol);
      maxCol = Math.max(ranges[row][col].stopIndex, maxCol);
    }
    problemColumns.push({ startIndex : minCol, stopIndex: maxCol });
  }

  const columnized: string[][] = [];
  for (let row = 0; row < inputRows.length; row++) {
    columnized.push([]);
    for (let col = 0; col < problemColumns.length; col++) {
      const range = problemColumns[col];
      columnized[row].push((inputRows[row].substring(range.startIndex, range.stopIndex + 1).split("")));
    }
  }

  const answers: number[] = [];
  const operands: number[][] = [];

  for (let problemColumnIndex = 0; problemColumnIndex < problemColumns.length; problemColumnIndex++) {
    const o = [];
    for (let col = 0; col < problemColumns[problemColumnIndex].stopIndex - problemColumns[problemColumnIndex].startIndex + 1; col++) {
      let numString = '';
      for (let row = 0; row < columnized.length; row++) {
        numString += columnized[row][problemColumnIndex][col];
      }
      o.push(parseInt(numString))
    }
    operands.push(o)
  }

  for (const [index, operator] of operators.entries()) {
    switch (operator) {
    case '+':
      answers.push(sum(operands[index]))
      break;
    case '*':
      answers.push(product(operands[index]))
    }
  }

  return sum(answers);
}

function rotate(arr: number[][]): number[][] {
  const rotated: number[][] = [];

  for (let col = 0; col < arr[0].length; col++) {
    rotated.push([]);
    for (let row = 0; row < arr.length; row++) {
      rotated[col].push(arr[row][col]);
    }
  }
  return rotated
}

function sum(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0)
}

function product(nums: number[]): number {
  return nums.reduce((product, n) => product * n, 1)
}

async function getInput(): Promise<{ inputRows: number[][], operators: string[]}> {
  const input = await readLines(__dirname + "/input.txt");

  const inputRows: number[][] = [];
  for (let row = 0; row < input.length - 1; row++) {
    inputRows.push(input[row].split(" ").filter(Boolean).map(n => parseInt(n)))
  }

  const operators = input[input.length - 1].split(" ").filter(Boolean).map(n => n.trim());

  return { inputRows, operators }
}


async function getInput2(): Promise<{ inputRows: string[], ranges: NumRange[][], operators: string[]}> {
  const input = await readLines(__dirname + "/input.txt");

  let ranges: NumRange[][] = [];
  let range: (null | NumRange) = null;
  for (let row = 0; row < input.length - 1; row++) {
    ranges.push([]);
    for(let col = 0; col < input[row].length; col++) {
      if (!range) {
        range = {startIndex: null, stopIndex: null};
      }
      if (input[row][col] != ' ') {
        if (range.startIndex === null) {
          range.startIndex = col;
        } 
      } else if (input[row][col] == ' ') {
        if (range.startIndex != null && range.stopIndex === null) {
          range.stopIndex = col - 1;
          ranges[row].push(range);
          range = null;
        }
      }
    }
    if (range) {
      range.stopIndex = input[row].length - 1;
      ranges[row].push(range);
      range = null;
    }
  }

  const operators = input[input.length - 1].split(" ").filter(Boolean).map(n => n.trim());
  return  {
    inputRows: input.slice(0, input.length - 1),
    ranges: ranges,
    operators
  }
}

const part1Answer = 7326876294741;
const part2Answer = 10756006415204;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
