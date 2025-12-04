import { readLines } from "../utils/io";
import { map, each } from 'lodash';
import {
  walkGrid,
  go,
  valueAt,
  OMNI_DIRECTIONS,
  type Point,
} from '../utils/grid';

async function part1(): Promise<number> {
  const floor = await getInput();
  let accessible = 0;

  walkGrid(floor, (value, point) => {
    let numRolls = 0;
    if (value === '@') {
      map(OMNI_DIRECTIONS, (dir) => {
        if (valueAt(floor, go(point, dir)) === '@') {
          numRolls++
        }
      })  
      if (numRolls <= 3) {
        accessible++;
      }
    }
  });

  return accessible;
}

async function part2(): Promise<number> {
  const floor = await getInput();

  let accessible = 0;
  let toRemove: Point[] = [];

  do {
    each(toRemove, p => {
      floor[p.row][p.col] = '.'
    });

    toRemove = [];

    walkGrid(floor, (value, point) => {
      let numRolls = 0;
      if (value === '@') {
        map(OMNI_DIRECTIONS, (dir) => {
          if (valueAt(floor, go(point, dir)) === '@') {
            if (numRolls++) {
              return false
            }
          }
        })  
        if (numRolls <= 3) {
          accessible++;
          toRemove.push(point);
        }
      }
    });

  } while (toRemove.length > 0)

  return accessible;
}

async function getInput(): Promise<string[][]> {
  const lines = await readLines(__dirname + "/input.txt");
  return map(lines, (row) => row.split(''))
}

const part1Answer = 1346;
const part2Answer = 8493;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
