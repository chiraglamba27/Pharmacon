import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const files = walk('src').filter((file) => /\.(ts|tsx)$/.test(file));
const checks = [
  ["legacy fetch URL", /fetch\([^\n]*['\"]\/api\//],
  ["legacy API base", /VITE_API_URL/],
  ["demo token", /demo-token/],
  ["SQLite runtime", /better-sqlite3/],
  ["Express runtime", /from ['\"]express['\"]/],
  ["JWT runtime", /jsonwebtoken/],
];
const failures = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const [label, pattern] of checks) {
    if (pattern.test(text)) failures.push(`${file}: ${label}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Checked ${files.length} source files: no legacy backend runtime references found.`);
