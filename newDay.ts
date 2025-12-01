import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://adventofcode.com/2024/day';
const SESSION_FILE = '.session';

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: bun newDay.ts <dayNumber>');
  process.exit(1);
}

const dayNumber = parseInt(args[0], 10);
if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 25) {
  console.error('Invalid day number. Must be between 1 and 25.');
  process.exit(1);
}

const dayFolderName = `day${String(dayNumber).padStart(2, '0')}`;
const dayFolderPath = join(process.cwd(), dayFolderName);

if (!existsSync(dayFolderPath)) {
  mkdirSync(dayFolderPath);
  console.log(`Created folder: ${dayFolderName}`);
} else {
  console.log(`Folder already exists: ${dayFolderName}`);
}

const templatePath = join(process.cwd(), 'utils', 'newDayTemplate.ts');
const newDayIndexPath = join(dayFolderPath, 'index.ts');

if (!existsSync(templatePath)) {
  console.error('Template file not found at ./utils/newDayTemplate.ts');
  process.exit(1);
}

const templateContent = readFileSync(templatePath, 'utf-8');
writeFileSync(newDayIndexPath, templateContent);
console.log(`Created file: ${join(dayFolderName, 'index.ts')}`);

const sessionFilePath = join(process.cwd(), SESSION_FILE);
if (!existsSync(sessionFilePath)) {
  console.error(`Session file not found: ${SESSION_FILE}`);
  process.exit(1);
}

const session = readFileSync(sessionFilePath, 'utf-8').trim();
if (!session) {
  console.error('Session token is empty.');
  process.exit(1);
}

const inputUrl = `${BASE_URL}/${dayNumber}/input`;
const inputFilePath = join(dayFolderPath, 'input.txt');

async function downloadInput() {
  try {
    const response = await fetch(inputUrl, {
      headers: {
        'Cookie': `session=${session}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch input: ${response.status} ${response.statusText}`);
    }

    const inputContent = await response.text();
    writeFileSync(inputFilePath, inputContent);
    console.log(`Downloaded input to: ${join(dayFolderName, 'input.txt')}`);
  } catch (error) {
    console.error('Error downloading input:', error);
    process.exit(1);
  }
}

await downloadInput();

