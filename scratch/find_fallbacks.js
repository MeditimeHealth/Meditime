const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components', 'contexts'];
const rootDir = 'e:\\Web Dev\\Freelance\\Meditime';

function scanDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(scanDir(fullPath));
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = [];
targetDirs.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  if (fs.existsSync(fullPath)) {
    files.push(...scanDir(fullPath));
  }
});

console.log(`Scanning ${files.length} files...`);

const patterns = [
  // Matches nameBn || name, name || nameBn, etc.
  /\b(\w+Bn)\s*\|\|\s*(\w+)\b/i,
  /\b(\w+)\s*\|\|\s*(\w+Bn)\b/i,
  // Matches checking if a value ends with Bn or is English and has fallback in ternary
  /\?\s*\(?([^?:|]+Bn[^?:|]+)\|\|\s*([^?:|]+)\)?\s*:/i,
  /\?\s*\(?([^?:|]+)\|\|\s*([^?:|]+Bn[^?:|]+)\)?\s*:/i,
];

let outputLines = [];
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    let matched = false;
    patterns.forEach(pat => {
      if (pat.test(line)) {
        if (line.includes('//') || line.includes('import') || line.includes('*')) {
          // Keep it but mark it
        }
        outputLines.push(`${path.relative(rootDir, file)}:${index + 1}: ${line.trim()}`);
        matched = true;
      }
    });
  });
});

fs.writeFileSync(path.join(rootDir, 'scratch', 'fallbacks_results.txt'), outputLines.join('\n'), 'utf8');
console.log(`Saved ${outputLines.length} potential matches to scratch/fallbacks_results.txt`);
