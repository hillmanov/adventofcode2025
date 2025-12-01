export type Point = {
  row: number;
  col: number;
}

export enum DIRECTION {
  U = 0,
  R = 1,
  D = 2,
  L = 3,
  UR = 4,
  DR = 5,
  DL = 6,
  UL = 7
}

export const Delta = {
  [DIRECTION.U]: [-1, 0],
  [DIRECTION.R]: [0, 1],
  [DIRECTION.D]: [1, 0],
  [DIRECTION.L]: [0, -1],

  [DIRECTION.UR]: [-1, 1],
  [DIRECTION.DR]: [1, 1],
  [DIRECTION.DL]: [1, -1],
  [DIRECTION.UL]: [-1, -1],
}

export const DirectionChar = {
  [DIRECTION.U]: "^",
  [DIRECTION.R]: ">",
  [DIRECTION.D]: "v",
  [DIRECTION.L]: "<",

  [DIRECTION.UR]: "/",
  [DIRECTION.DR]: "\\",
  [DIRECTION.DL]: "/",
  [DIRECTION.UL]: "\\",
}

export const ORTHOGONAL_DIRECTIONS = [DIRECTION.U, DIRECTION.R, DIRECTION.D, DIRECTION.L];
export const OMNI_DIRECTIONS = [DIRECTION.U, DIRECTION.R, DIRECTION.D, DIRECTION.L, DIRECTION.UR, DIRECTION.DR, DIRECTION.DL, DIRECTION.UL];
export const DIAGONAL_DIRECTIONS = [DIRECTION.UR, DIRECTION.DR, DIRECTION.DL, DIRECTION.UL];

export const OPPOSITE_DIRECTION = {
  [DIRECTION.U]: DIRECTION.D,
  [DIRECTION.R]: DIRECTION.L,
  [DIRECTION.D]: DIRECTION.U,
  [DIRECTION.L]: DIRECTION.R,

  [DIRECTION.UR]: DIRECTION.DL,
  [DIRECTION.DR]: DIRECTION.UL,
  [DIRECTION.DL]: DIRECTION.UR,
  [DIRECTION.UL]: DIRECTION.DR,
}

export function goAmount(p: Point, d: DIRECTION, rowAmount: number, colAmount: number): Point {
  const delta = Delta[d];
  return { row: p.row + (delta[0] * rowAmount), col: p.col + (delta[1] * colAmount) };
}

// Faster if we don't have to deal with rowAmount and colAmount
export function go(p: Point, d: DIRECTION): Point {
  const delta = Delta[d];
  return { row: p.row + (delta[0]), col: p.col + (delta[1]) };
}

export function moveAmount(p: Point, d: DIRECTION, rowAmount: number, colAmount: number): void {
  const delta = Delta[d];
  p.row += (delta[0] * rowAmount);
  p.col += (delta[1] * colAmount);
}

// Faster if we don't have to deal with rowAmount and colAmount
export function move(p: Point, d: DIRECTION): void {
  const delta = Delta[d];
  p.row += delta[0];
  p.col += delta[1];
}

export function valueAt<T>(grid: T[][], p: Point): (T | null) {
  return grid[p.row]?.[p.col] ?? null;
}

export function walkGrid<T>(grid: T[][], callback: (value: T, point: Point) => void | boolean) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (callback(grid[row][col], { row, col }) === false) {
        return;
      }
    }
  }
}

export function inGridBounds(grid: any[][], p: Point): boolean {
  return p.row >= 0 && p.row < grid.length && p.col >= 0 && p.col < grid[0].length;
}

export function encode(p: Point): number {
  return p.row << 12 | p.col;
}

export function encodeWithDirection(p: Point, d: DIRECTION): number {
  return p.row << 14 | p.col << 2 | d;
}

export function decode(n: number): Point {
  return { row: n >> 12, col: n & 0xFFF };
}

export function pointsAreEqual(p1: Point, p2: Point): boolean {
  return p1.row === p2.row && p1.col === p2.col;
}

export function copyPoint(p: Point): Point {
  return { row: p.row, col: p.col };
}

export function setPointTo(a: Point, b: Point): void {
  a.row = b.row;
  a.col = b.col;
}

export function logGrid(grid: any[][]) {
  for (let row = 0; row < grid.length; row++) {
    console.log(grid[row].join(""));
  }
}

export function manhattanDistance(p1: Point, p2: Point): number {
  return Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col);
}
