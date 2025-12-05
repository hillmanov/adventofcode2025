import path from "path";
import { performance } from "perf_hooks";
import { readdir, stat } from "node:fs/promises";
import { parseArgs } from "util";
import { table } from 'table';
import { $ } from "bun";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    day: {
      type: 'string',
    },
    part: {
      type: 'string',
    },
    iterations: {
      type: 'string',
    },
    timing: {
      type: 'string',
    }
  },
  strict: true,
  allowPositionals: true,
});

type DayResult = {
  day: number;
  part1: any;
  part1Time: number;
  part1Answer: any;
  part1Correct: boolean | null;
  part2: any;
  part2Time: number;
  part2Answer: any;
  part2Correct: boolean | null;
  // Zig results
  zigPart1: any;
  zigPart1Time: number;
  zigPart1Correct: boolean | null;
  zigPart2: any;
  zigPart2Time: number;
  zigPart2Correct: boolean | null;
  hasZig: boolean;
}

const requestedDay = values.day ? Number(values.day) : null;
const requestedPart = values.part ? Number(values.part) : null;
const iterations = values.iterations ? Number(values.iterations) : 1;
const timingStrategy = values.timing ?? "min";

const directory = import.meta.dir;
const entries = await readdir(directory, { withFileTypes: true });
const dayFolders = entries.filter((entry) => entry.isDirectory() && entry.name.startsWith("day"));

dayFolders.sort((a, b) => {
  const dayA = Number(a.name.replace("day", ""));
  const dayB = Number(b.name.replace("day", ""));
  return dayA - dayB;
});

// Build all Zig solutions once at the start
try {
  await $`zig build -Doptimize=ReleaseFast`.cwd(directory).quiet();
} catch (err) {
  console.error("Warning: Could not build Zig solutions:", err);
}

const results: DayResult[] = [];

for (const dayFolder of dayFolders) {
    const dayNumber = Number(dayFolder.name.replace("day", ""));

    if (requestedDay && requestedDay !== dayNumber) continue;

    const dayPath = path.join(directory, dayFolder.name);
    const buildFilePath = path.join(dayPath, 'build.js');
    const zigSolutionPath = path.join(dayPath, 'solution.zig');

    try {
      await $`
        if test -f "${buildFilePath}"; then
          echo "Building native module: ${buildFilePath}";
          bun ${buildFilePath}
        fi;`.cwd(dayPath);
    } catch (err) {
      console.error(`Error building native module for: ${dayFolder.name}:`, err);
      process.exit(1);
    }

    // Check if Zig solution exists
    let hasZig = false;
    try {
      await stat(zigSolutionPath);
      hasZig = true;
    } catch {
      hasZig = false;
    }

    try {
      const module = await import(dayPath);
      const { part1, part2, part1Answer, part2Answer } = module;

      const dayResult: DayResult = {
        day: dayNumber,
        part1: null as any,
        part1Time: 0,
        part1Answer: null as any,
        part1Correct: null as any,
        part2: null as any,
        part2Answer: null as any,
        part2Time: 0,
        part2Correct: null as any,
        zigPart1: null as any,
        zigPart1Time: 0,
        zigPart1Correct: null as any,
        zigPart2: null as any,
        zigPart2Time: 0,
        zigPart2Correct: null as any,
        hasZig,
      };

      // Run Bun solution
      if ((!requestedPart || requestedPart === 1) && typeof part1 === "function") {
        const runtimes = [];
        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          dayResult.part1 = await part1();
          runtimes.push(performance.now() - start);
        }

        dayResult.part1Time = getTiming(runtimes, timingStrategy);
        dayResult.part1Correct = part1Answer ? dayResult.part1 === part1Answer : null;
        dayResult.part1Answer = part1Answer;
      }

      if ((!requestedPart || requestedPart === 2) && typeof part2 === "function") {
        const runtimes = [];
        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          dayResult.part2 = await part2();
          runtimes.push(performance.now() - start);
        }

        dayResult.part2Time = getTiming(runtimes, timingStrategy);
        dayResult.part2Correct = part2Answer ? dayResult.part2 === part2Answer : null;
        dayResult.part2Answer = part2Answer;
      }

      // Run Zig solution if it exists
      if (hasZig) {
        try {
          const zigRuntimes: { part1Time: number, part2Time: number }[] = [];
          const zigBinaryPath = path.join(directory, 'zig-out', 'bin', dayFolder.name);

          for (let i = 0; i < iterations; i++) {
            // Run from the day's directory so it can find input.txt
            const zigOutput = await $`${zigBinaryPath}`.cwd(dayPath).text();
            const lines = zigOutput.trim().split('\n');

            // Parse Zig output: part1, part2, time1, time2
            if (lines.length >= 4) {
              dayResult.zigPart1 = parseZigOutput(lines[0]);
              dayResult.zigPart2 = parseZigOutput(lines[1]);
              zigRuntimes.push({
                part1Time: parseFloat(lines[2]),
                part2Time: parseFloat(lines[3]),
              });
            }
          }

          if (zigRuntimes.length > 0) {
            dayResult.zigPart1Time = getTiming(zigRuntimes.map(r => r.part1Time), timingStrategy);
            dayResult.zigPart2Time = getTiming(zigRuntimes.map(r => r.part2Time), timingStrategy);
            dayResult.zigPart1Correct = part1Answer != null ? dayResult.zigPart1 === part1Answer : null;
            dayResult.zigPart2Correct = part2Answer != null ? dayResult.zigPart2 === part2Answer : null;
          }
        } catch (err) {
          console.error(`Error running Zig solution for ${dayFolder.name}:`, err);
        }
      }

      results.push(dayResult);
      if (!requestedDay && !requestedPart) {
        printTimingsTable(results);
      }
    } catch (err) {
      console.error(`Error loading or running ${dayFolder.name}:`, err);
    }
}

function parseZigOutput(value: string): number {
  // Handle large numbers that might be strings
  const num = Number(value);
  return num;
}

function getTiming(results: number[], timingStrategy: string = "min") {
  switch (timingStrategy) {
    case "min":
      return Math.min(...results);
    case "max":
      return Math.max(...results);
    case "average":
      return results.reduce((a: number, b: number) => a + b, 0) / results.length;
    case "median":
      const sorted = results.sort();
      const middle = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];
    default: return Math.min(...results);
  }
}

function getTimingsTable(results: DayResult[]) {
  const hasAnyZig = results.some(r => r.hasZig);

  const data = [{
    row: hasAnyZig
      ? ["Day", "Part", "Answer", "Bun (ms)", "Zig (ms)", "Total (ms)"]
      : ["Day", "Part", "Answer", "Time (ms)", "Total Time (ms)"],
    type: 'header',
  }];

  data.push(...results.flatMap(({ day, part1, part1Time, part2, part2Time, part1Correct, part2Correct, part1Answer, part2Answer, zigPart1Time, zigPart2Time, zigPart1Correct, zigPart2Correct, hasZig }) => {
    const bunTotal = (!isNaN(part1Time) && !isNaN(part2Time)) ? (part1Time + part2Time) : NaN;
    const zigTotal = hasZig && (!isNaN(zigPart1Time) && !isNaN(zigPart2Time)) ? (zigPart1Time + zigPart2Time) : NaN;

    // Determine winner for each part (green up arrow for faster, red down for slower)
    const part1BunWins = hasZig && !isNaN(part1Time) && !isNaN(zigPart1Time) && part1Time < zigPart1Time;
    const part1ZigWins = hasZig && !isNaN(part1Time) && !isNaN(zigPart1Time) && zigPart1Time < part1Time;
    const part2BunWins = hasZig && !isNaN(part2Time) && !isNaN(zigPart2Time) && part2Time < zigPart2Time;
    const part2ZigWins = hasZig && !isNaN(part2Time) && !isNaN(zigPart2Time) && zigPart2Time < part2Time;

    const getArrow = (isWinner: boolean, isLoser: boolean) => {
      if (isWinner) return "🟢⬆";
      if (isLoser) return "🔴⬇";
      return "";
    };

    if (hasAnyZig) {
      return [
        {
          row: [
            `Day ${day}`,
            "Part 1",
            `${part1Correct !== null ? part1Correct ? "✅" : "❌" : "❓"} ${part1}${part1Correct === false ? " (expected: " + part1Answer + ")" : ""}`,
            `${getArrow(part1BunWins, part1ZigWins)} ${!isNaN(part1Time) ? `${part1Time.toFixed(3)}` : "N/A"}`,
            hasZig ? `${zigPart1Correct !== null ? zigPart1Correct ? "✅" : "❌" : "❓"} ${getArrow(part1ZigWins, part1BunWins)} ${!isNaN(zigPart1Time) ? `${zigPart1Time.toFixed(3)}` : "N/A"}` : "—",
            formatTotals(bunTotal, zigTotal, hasZig),
          ],
          type: 'day',
        },
        {
          row: [
            "",
            "Part 2",
            `${part2Correct !== null ? part2Correct ? "✅" : "❌" : "❓"} ${part2}${part2Correct === false ? " (expected: " + part2Answer + ")" : ""}`,
            `${getArrow(part2BunWins, part2ZigWins)} ${!isNaN(part2Time) ? `${part2Time.toFixed(3)}` : "N/A"}`,
            hasZig ? `${zigPart2Correct !== null ? zigPart2Correct ? "✅" : "❌" : "❓"} ${getArrow(part2ZigWins, part2BunWins)} ${!isNaN(zigPart2Time) ? `${zigPart2Time.toFixed(3)}` : "N/A"}` : "—",
            "",
          ],
          type: ''
        }
      ];
    } else {
      return [
        {
          row: [
            `Day ${day}`,
            "Part 1",
            `${part1Correct !== null ? part1Correct ? "✅" : "❌" : "❓"} ${part1}${part1Correct === false ? " (expected: " + part1Answer + ")" : ""}`,
            `${!isNaN(part1Time) ? `${part1Time.toFixed(3)} ms` : "N/A"}`,
            (!isNaN(part1Time) && !isNaN(part2Time)) ? `${(part1Time + part2Time).toFixed(3)} ms` : "N/A",
          ],
          type: 'day',
        },
        {
          row: [
            "",
            "Part 2",
            `${part2Correct !== null ? part2Correct ? "✅" : "❌" : "❓"} ${part2}${part2Correct === false ? " (expected: " + part2Answer + ")" : ""}`,
            `${!isNaN(part2Time) ? `${part2Time.toFixed(3)} ms` : "N/A"}`,
            ""
          ],
          type: ''
        }
      ];
    }
  }));

  // Calculate totals
  const bunTotal = results.reduce((acc, { part1Time, part2Time }) => acc + part1Time + part2Time, 0);
  const zigTotal = results.reduce((acc, { zigPart1Time, zigPart2Time, hasZig }) =>
    acc + (hasZig ? zigPart1Time + zigPart2Time : 0), 0);

  if (hasAnyZig) {
    data.push({
      row: ["Total", "", "", `${bunTotal.toFixed(3)}`, `${zigTotal.toFixed(3)}`, `Bun: ${bunTotal.toFixed(3)} / Zig: ${zigTotal.toFixed(3)}`],
      type: 'total'
    });
  } else {
    data.push({
      row: ["Total", "", "", "", `${bunTotal.toFixed(3)} ms`],
      type: 'total'
    });
  }

  const config = {
    columns: hasAnyZig ? [
      { alignment: 'center', width: 6 },
      { alignment: 'left' },
      { alignment: 'right' },
      { alignment: 'right' },
      { alignment: 'right' },
      { alignment: 'center', width: 34 },
    ] : [
      { alignment: 'center', width: 6 },
      { alignment: 'left' },
      { alignment: 'right' },
      { alignment: 'right' },
      { alignment: 'center' },
    ],
    spanningCells: data.reduce((acc, row, index) => {
      if (row.type === 'day') {
        acc.push({
          col: 0,
          row: index,
          rowSpan: 2,
          verticalAlignment: 'middle'
        });
        acc.push({
          col: hasAnyZig ? 5 : 4,
          row: index,
          rowSpan: 2,
          verticalAlignment: 'middle'
        });
      }
      if (row.type === 'total') {
        acc.push({
          col: 0,
          row: index,
          colSpan: 3,
          alignment: 'right'
        });
      }
      return acc;
    }, [] as any[])
  };
  const tableOutput = table(data.map(d => d.row), config);
  return tableOutput;
}

function formatTotals(bunTotal: number, zigTotal: number, hasZig: boolean): string {
  if (isNaN(bunTotal) && isNaN(zigTotal)) return "N/A";

  const bunWins = hasZig && !isNaN(bunTotal) && !isNaN(zigTotal) && bunTotal < zigTotal;
  const zigWins = hasZig && !isNaN(bunTotal) && !isNaN(zigTotal) && zigTotal < bunTotal;

  const bunArrow = bunWins ? "🟢⬆" : (zigWins ? "🔴⬇" : "");
  const zigArrow = zigWins ? "🟢⬆" : (bunWins ? "🔴⬇" : "");

  const parts: string[] = [];
  if (!isNaN(bunTotal)) parts.push(`${bunArrow} B: ${bunTotal.toFixed(3)}`);
  if (!isNaN(zigTotal)) parts.push(`${zigArrow} Z: ${zigTotal.toFixed(3)}`);
  return parts.join(" / ");
}

function printTimingsTable(results: DayResult[]) {
  if (!values.day) {
    console.clear();
  }
  console.log(getTimingsTable(results));
}

if (!requestedDay && !requestedPart) {
  const timingsTable = getTimingsTable(results);
  const readmePath = path.join(directory, "README.md");
  try {
    const readmeContent = await Bun.file(readmePath).text();
    const updatedReadme = readmeContent.replace(
      /## Timings[\s\S]*$/,
      `## Timings\n\n\`\`\`\n${timingsTable}\n\`\`\``
    );
    await Bun.write(readmePath, updatedReadme);
  } catch (err) {
    console.error("Error updating README.md:", err);
  }
}

printTimingsTable(results);
