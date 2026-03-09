import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(process.cwd());

const SCAN_DIRS = ['src', 'public']
  .map((d) => path.join(projectRoot, d))
  .filter((p) => fs.existsSync(p));

const IGNORE_DIR_NAMES = new Set(['.next', 'node_modules', 'dist', 'build', 'coverage']);
const SCAN_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.html']);

const TOKEN_STORAGE_CALL =
  /\b(localStorage|sessionStorage)\s*\.\s*(setItem|getItem|removeItem)\s*\(\s*['"](accessToken|refreshToken|access_token|refresh_token)['"]/g;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIR_NAMES.has(entry.name)) continue;
      out.push(...walk(full));
      continue;
    }

    if (entry.isFile()) {
      if (!SCAN_EXTS.has(path.extname(entry.name).toLowerCase())) continue;
      out.push(full);
    }
  }

  return out;
}

const offenders = [];
for (const root of SCAN_DIRS) {
  for (const file of walk(root)) {
    const content = fs.readFileSync(file, 'utf8');
    TOKEN_STORAGE_CALL.lastIndex = 0;

    let match;
    while ((match = TOKEN_STORAGE_CALL.exec(content)) !== null) {
      offenders.push({
        file: path.relative(projectRoot, file),
        match: match[0],
      });
    }
  }
}

if (offenders.length) {
  console.error('❌ Found forbidden token storage operations (auth tokens must NOT be persisted in browser storage):');
  for (const o of offenders) {
    console.error(`- ${o.file} :: ${o.match}`);
  }
  process.exit(1);
}

console.log('✅ OK: no auth token storage operations found in src/ or public/.');
