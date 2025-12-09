import { readLines } from "../utils/io";
import { map, parseInt, orderBy, sum } from "lodash";

let id = 1;
const ids = {};

class Box {
  public id: number;
  public coords: string;
  constructor(public x: number, public y: number, public z: number){
    this.coords = [x, y, z].join(',');
    this.id = ids[this.coords] || id++;
  }

  distance(other: Box): number {
    return Math.hypot(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.id
  }
}

async function part1(): Promise<number> {
  const boxes = await getInput();
  const distances: {distance: number, boxes: [Box, Box]}[] = []
  const boxCircuitMembership: Map<number, Set<Box>> = new Map();
  const circuits = [];

  for (const [index, boxA] of boxes.entries()) {
    for (const boxB of boxes.slice(index + 1)) {
      distances.push({
        distance: boxA.distance(boxB),
        boxes: [boxA, boxB]
      });
    }
  }

  distances.sort((a, b) => a.distance - b.distance);

  for (const { boxes } of distances.slice(0, 1000)) {
    const [boxA, boxB] = boxes;
    const [circuitA, circuitB] = [boxCircuitMembership.get(boxA.id), boxCircuitMembership.get(boxB.id)];
    let circuit: Set<Box>;

    if (!circuitA && !circuitB) {
      circuit = new Set()
      circuits.push(circuit);
    } else if (circuitA && !circuitB) {
      circuit = circuitA;
    } else if (!circuitA && circuitB) {
      circuit = circuitB;
    } else if (circuitA != circuitB) {
      circuit = circuitA!?.union(circuitB!);
    }  else if (circuitA === circuitB) {
      continue;
    }

    circuit!.add(boxA);
    circuit!.add(boxB);

    for (const box of circuit!) {
      boxCircuitMembership.set(box.id, circuit!);      
    }
  }

  let circuitSizes: number[] = [];
  for (const circuit of new Set(boxCircuitMembership.values())) {
    circuitSizes.push(circuit.size);
  }

  circuitSizes.sort((a, b) => b - a);
  return product(circuitSizes.slice(0, 3));
}


async function part2(): Promise<number> {
  const junctionBoxes = await getInput();
  const distances: {distance: number, boxes: [Box, Box]}[] = []
  const boxCircuitMembership: Map<number, Set<Box>> = new Map();
  const circuits = [];

  for (const [index, boxA] of junctionBoxes.entries()) {
    for (const boxB of junctionBoxes.slice(index + 1)) {
      distances.push({
        distance: boxA.distance(boxB),
        boxes: [boxA, boxB]
      });
    }
  }

  distances.sort((a, b) => a.distance - b.distance);

  for (const { boxes } of distances) {
    const [boxA, boxB] = boxes;
    const [circuitA, circuitB] = [boxCircuitMembership.get(boxA.id), boxCircuitMembership.get(boxB.id)];
    let circuit: Set<Box>;

    if (!circuitA && !circuitB) {
      circuit = new Set()
      circuits.push(circuit);
    } else if (circuitA && !circuitB) {
      circuit = circuitA;
    } else if (!circuitA && circuitB) {
      circuit = circuitB;
    } else if (circuitA != circuitB) {
      circuit = circuitA!?.union(circuitB!);
    }  else if (circuitA === circuitB) {
      continue;
    }

    circuit!.add(boxA);
    circuit!.add(boxB);

    for (const box of circuit!) {
      boxCircuitMembership.set(box.id, circuit!);      
    }

    if (circuit!.size === junctionBoxes.length) {
      return boxA.x * boxB.x
    }
  }

  return 0;
}

function product(nums: number[]): number {
  return nums.reduce((product, n) => product * n, 1)
}

async function getInput(): Promise<Box[]> {
  const input = await readLines(__dirname + "/input.txt");
  const boxes: Box[] = [];
  for (const line of input) {
    const [x, y, z] = map(line.split(","), parseInt);
    boxes.push(new Box(x, y, z))
  }
  return boxes;
}

const part1Answer = 24360;
const part2Answer = 2185817796

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
