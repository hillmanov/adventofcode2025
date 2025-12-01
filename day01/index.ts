import { readContents } from "../utils/io";

type Rotation = {
  direction: "L" | "R";
  amount: number;
}

async function part1(): Promise<number> {
  const input = await getInput();

  let dial = 50;
  let zeroCount = 0;

  input.forEach(rotation => {
    if (rotation.direction === "L") {
      dial = (dial - rotation.amount + 100) % 100;
    } else {
      dial = (dial + rotation.amount) % 100;
    }


    if (dial === 0) {
      zeroCount++;
    }
  })
  return zeroCount;
}

async function part2(): Promise<number> {
  const input = await getInput();

  let dial = 50;
  let zeroCount = 0;

  input.forEach(rotation => {
    if (rotation.direction === "L") {
      for (let i = 0; i < rotation.amount; i++) {
        dial = (dial - 1 + 100) % 100;
        if (dial === 0) {
          zeroCount++;
        }
      }
    } else {
      for (let i = 0; i < rotation.amount; i++) {
        dial = (dial + 1) % 100;
        if (dial === 0) {
          zeroCount++;
        }
      }
    }

  });
  return zeroCount
}

async function getInput(): Promise<Rotation[]> {
  const input = await readContents(__dirname + "/input.txt");
  return input.split("\n").map(line => ({
    direction: line[0] as "R" | "L",
    amount: parseInt(line.substring(1)),
  }))
}

const part1Answer = 1066;
const part2Answer = 6223;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
