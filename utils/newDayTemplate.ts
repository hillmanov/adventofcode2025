import { readContents } from "../utils/io";

async function part1(): Promise<number> {
  const input = await getInput();
  return 0;
}

async function part2(): Promise<number> {
  const input = await getInput();
  return 0;
}

async function getInput(): Promise<number[]> {
  const input = await readContents(__dirname + "/input.txt");
  return input.split("\n").map((line) => parseInt(line));
}

const part1Answer = null;
const part2Answer = null;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
