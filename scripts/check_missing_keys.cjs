const fs = require('fs');
const path = require('path');
const en = require('../public/locales/en/translation.json');
const enKeys = new Set(Object.keys(en));

// No filter — extract ALL missing keys
const HIGH_PRIORITY = null;

function walk(dir) {
  let results = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) results = results.concat(walk(full));
    else if (/\.(tsx?|jsx?)$/.test(f.name)) results.push(full);
  }
  return results;
}

const missing = new Map(); // key -> file
const files = walk(path.join(__dirname, '..', 'src'));
const re = /\bt\(\s*(['"`])((?:(?!\1).)*)\1/g;
const root = path.join(__dirname, '..');

for (const file of files) {
  const rel = path.relative(root, file);

  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = re.exec(content)) !== null) {
    const key = m[2];
    if (key.length >= 3 && /^[A-Za-z]/.test(key) && !enKeys.has(key)) {
      if (/^(https?:|BEGIN |rgba)/.test(key)) continue;
      if (!missing.has(key)) missing.set(key, rel);
    }
  }
}

// Output as JSON for easy consumption
const keyList = [...missing.keys()].sort();
console.log(JSON.stringify(keyList, null, 2));
