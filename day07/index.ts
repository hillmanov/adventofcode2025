import { readLines } from "../utils/io";
import {
  valueAt,
  go,
  walkGrid,
  DIRECTION,
} from '../utils/grid';
import { sum } from 'lodash';

async function part1(): Promise<number> {
  const manifold = await getInput();

  let splits = 0;
  walkGrid(manifold, (value, point) => {
    const pointU = go(point, DIRECTION.U)
    if (valueAt(manifold, pointU) === 'S') {
      manifold[point.row][point.col] = '|';
    }
    if (value === '^') {
      const pointL = go(point, DIRECTION.L)
      const pointR = go(point, DIRECTION.R)

      let split = false;
      if (valueAt(manifold, pointU) === '|') {
        if (valueAt(manifold, pointL) === '.') {
          manifold[pointL.row][pointL.col] = '|';
          split = true;
        }

        if (valueAt(manifold, pointR) === '.') {
          manifold[pointR.row][pointR.col] = '|';
          split = true;
        }
        splits += split ? 1 : 0;
      }
    }
    if (value === '.') {
      if (valueAt(manifold, pointU) === '|') {
        manifold[point.row][point.col] = '|';
      }
    }
  });

  return splits;
}

async function part2(): Promise<number> {
  const manifold = await getInput();
  const pathCounts: number[][] = [];
  for (let row = 0; row < manifold.length; row++) {
    pathCounts.push(Array(manifold.length).fill(0));
  }

  walkGrid(manifold, (value, point) => {
    const pointU = go(point, DIRECTION.U)
    if (valueAt(manifold, pointU) === 'S') {
      manifold[point.row][point.col] = '|';
    }

    if (value === '^') {
      const pointL = go(point, DIRECTION.L)
      const pointR = go(point, DIRECTION.R)

      if (valueAt(manifold, pointU) === '|') {
        manifold[pointL.row][pointL.col] = '|';
        manifold[pointR.row][pointR.col] = '|';
      }
    }
    if (value === '.' && valueAt(manifold, pointU) === '|') {
      manifold[point.row][point.col] = '|';
    }
  });
  
  for (let row = 0; row < manifold.length; row++) {
    for (let col = 0; col < manifold[row].length; col++) {
      const point = { row, col }
      const pointU = go(point, DIRECTION.U)

      if (manifold?.[pointU.row]?.[pointU.col] === 'S') {
        pathCounts[row][col] = 1;
      }
      if (manifold?.[pointU.row]?.[pointU.col] === '|') {
        pathCounts[row][col] = pathCounts[pointU.row][pointU.col];
      }
    }
    for (let col = 0; col < manifold[row].length; col++) {
      const point = { row, col }
      const pointU = go(point, DIRECTION.U)

      if (manifold?.[point.row]?.[point.col] === '^') {
        const pointL = go(point, DIRECTION.L)
        const pointR = go(point, DIRECTION.R)
        pathCounts[pointL.row][pointL.col] = pathCounts[pointL.row][pointL.col] + pathCounts[pointU.row][pointU.col];
        pathCounts[pointR.row][pointR.col] = pathCounts[pointR.row][pointR.col] + pathCounts[pointU.row][pointU.col];
      }
    }
  }

  return sum(pathCounts[pathCounts.length -1]);
}

async function getInput(): Promise<string[][]> {
  const manifold = await readLines(__dirname + "/input.txt");
  return manifold.map(line => line.split(''));
}

const part1Answer = 1675;
const part2Answer = 187987920774390;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
