import { readLines } from "../utils/io";
import { each, map, sum } from 'lodash';

type Machine = {
  state: number;
  target: number;
  buttons: number[];
  joltage: number[];
}

async function part1(): Promise<number> {
  const machines = await getInput();
  const minClicks = map(machines, machine => getMinimumClicks(machine.state, machine.target, machine.buttons))
  return sum(minClicks);
}

async function part2(): Promise<number> {
  const input = await getInput();
  return 0;
}


function getMinimumClicks(state: number, target: number, buttons: number[]): number {
  let minPresses = buttons.length;

  const click = (state: number, target: number, buttons: number[], buttonToPress: number, presses: number): void => {
    if (presses >= minPresses || presses >= buttons.length) {
      return;
    }
    state ^= buttonToPress;

    if ((state) === target) {
      minPresses = presses;
      return
    }

    for (const button of buttons) {
      click(state, target, buttons, button, presses + 1);
    }
  }
  
  for (const button of buttons) {
    click(state, target, buttons, button, 1);
  }


  return minPresses;
}

async function getInput(): Promise<Machine[]> {
  const lines = await readLines(__dirname + "/input.txt");

  return map(lines, (line: string) => {
    const parts = line.split(" ");

    const target = parts[0].trim().replace(/\[|\]/g, '').replaceAll('.', '0').replaceAll('#', '1');
    const state = '0'.repeat(target.length);

    const machine: Machine = {
      state: 0,
      target: 0,
      buttons: [],
      joltage: []
    };

    machine.target = parseInt(target, 2);
    machine.state = parseInt(state, 2);

    machine.buttons = map(parts.slice(1, parts.length - 1), (buttonDef) => {
      const buttonToggleIndexes = map(buttonDef.substring(1, buttonDef.length - 1).split(','), n => parseInt(n))

      let button = state;
      each(buttonToggleIndexes, index => {
        button = setCharAt(button, index, '1');
      });
      return parseInt(button, 2);;
    });

    machine.joltage = map(parts[parts.length - 1].replace(/\{|\}/g, '').split(','), n => parseInt(n));

    return machine;
  })
}

function d2b(dec: number) {
  return (dec >>> 0).toString(2);
}

function setCharAt(s: string, i: number, c: string) {
    if (i > s.length-1) {
      return s;
    }
    return s.substring(0,i) + c + s.substring(i+1);
}

const part1Answer = 524;
const part2Answer = null;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
