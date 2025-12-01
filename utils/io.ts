async function readLines(path: string): Promise<string[]> {
  return (await readContents(path)).split("\n");
}

async function readContents(path: string): Promise<string> {
  return (await Bun.file(path).text()).trim();
}

export {
  readLines,
  readContents,
}
