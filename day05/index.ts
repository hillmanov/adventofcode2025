import { readContents } from "../utils/io";
import { each, map, parseInt, orderBy, last } from "lodash";

type Range = {
  start: number
  end: number
}

async function part1(): Promise<number> {
  const { ranges, ids } = await getInput();

  const consolidatedRanges = consolidateRanges(ranges);

  let freshCount = 0;
  each(ids, id => {
    each(consolidatedRanges, range => {
      if (id >= range.start && id <= range.end) {
        freshCount++
        return false
      }
    })
  });

  return freshCount;
}

async function part2(): Promise<number> {
  const { ranges } = await getInput();

  const consolidatedRanges = consolidateRanges(ranges);

  let totalFresh = 0;
  each(consolidatedRanges, (range) => {
    totalFresh += (range.end - range.start) + 1;
  });

  return totalFresh;
}

function consolidateRanges(ranges: Range[]): Range[] {
  const sortedRanges = orderBy(ranges, ['start'], ['asc']);
  const consolidatedRanges: Range[] = [sortedRanges[0]];
  
  each(sortedRanges, range => {
    const previousRange = last(consolidatedRanges) as Range;
    if (range.start <= previousRange.end) {
      previousRange.end = Math.max(range.end, previousRange.end) 
    } else {
      consolidatedRanges.push(range);
    }
  });

  return consolidatedRanges;
}

async function getInput(): Promise<{ ranges: Range[], ids: number[]}> {
  const [rangesLines, idsLines] = (await readContents(__dirname + "/input.txt")).split("\n\n")

  const ranges = map(rangesLines.split("\n"), line => {
    const parts = line.split("-");
    return {
      start: parseInt(parts[0]),
      end: parseInt(parts[1])
    }
  });

  const ids = map(idsLines.split("\n"), parseInt);
  return { ranges, ids };

}

const part1Answer = 694;
const part2Answer = 352716206375547;

export {
  part1,
  part2,
  part1Answer,
  part2Answer,
}
