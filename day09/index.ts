import { readLines } from "../utils/io";
import { map, parseInt } from "lodash";

type Point = {
  x: number;
  y: number;
}

async function part1(): Promise<number> {
  const points = await getInput();
  let maxArea = 0;
  for (const [index, aPoint] of points.entries()) {
    for (const bPoint of points.slice(index + 1)) {
      maxArea = Math.max(area(aPoint, bPoint), maxArea)
    }
  }

  return maxArea;
}

async function part2(): Promise<number> {
  const input = await getInput();
  return 0;
}

function area(a: Point, b: Point): number {
  const dx = Math.abs(a.x - b.x) + 1;
  const dy = Math.abs(a.y - b.y) + 1;
  return dx * dy;
}

async function getInput(): Promise<Point[]> {
  const input = await readLines(__dirname + "/input.txt");
  return map(input, line => {
    const [x, y] = map(line.split(","), parseInt);
    return { x, y }
  })
}

const part1Answer = 4756718172;
const part2Answer = null;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
