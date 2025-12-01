import path from "path";
import { performance } from "perf_hooks";
import { readdir } from "node:fs/promises";
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

const results = [];

for (const dayFolder of dayFolders) {
    const dayNumber = Number(dayFolder.name.replace("day", ""));

    if (requestedDay && requestedDay !== dayNumber) continue;

    const dayPath = path.join(directory, dayFolder.name);
    const buildFilePath = path.join(dayPath, 'build.js');

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
      };

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

      results.push(dayResult);
      if (!requestedDay && !requestedPart) {
        printTimingsTable(results);
      }
    } catch (err) {
      console.error(`Error loading or running ${dayFolder.name}:`, err);
    }
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
  const data = [{
    row: ["Day", "Part", "Answer", "Time (ms)", "Total Time (ms)"],
    type: 'header',
  }]
  
  data.push(...results.flatMap(({ day, part1, part1Time, part2, part2Time, part1Correct, part2Correct, part1Answer, part2Answer }) => {
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
        row:
        [
          "", 
          "Part 2",
          `${part2Correct !== null ? part2Correct ? "✅" : "❌" : "❓"} ${part2}${part2Correct === false ? " (expected: " + part2Answer + ")" : ""}`, 
          `${!isNaN(part2Time) ? `${part2Time.toFixed(3)} ms` : "N/A"}`,
          ""
        ],
        type: ''
      }
    ];
  }));
  data.push({
    row: ["Total", "", "", "", `${results.reduce((acc, { part1Time, part2Time }) => acc + part1Time + part2Time, 0).toFixed(3)} ms`],
    type: 'total'  
  });

  const config = {
    columns: [
      { alignment: 'center', width: 6},
      { alignment: 'left', },
      { alignment: 'right'},
      { alignment: 'right'},
      { alignment: 'center'},
    ],
    spanningCells: data.reduce((acc, row, index) => {
      if (row.type === 'day') {
        acc.push(...[{
          col: 0,
          row: index,
          rowSpan: 2,
          verticalAlignment: 'middle'
        }, {
          col: 4,
          row: index,
          rowSpan: 2,
          verticalAlignment: 'middle'
        }
        ]);
      }
      if (row.type === 'total') {
        acc.push({
          col: 0,
          row: index,
          colSpan: 4,
          alignment: 'right'
        });
      }
      return acc;
    }, [] as any[])
  };
  const tableOutput = table(data.map(d => d.row), config);
  return tableOutput;
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
