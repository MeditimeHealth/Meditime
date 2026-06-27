const fs = require('fs');
const path = require('path');

const apis = JSON.parse(fs.readFileSync(path.join(__dirname, 'apis_summary.json'), 'utf-8'));
const models = JSON.parse(fs.readFileSync(path.join(__dirname, 'models_summary.json'), 'utf-8'));

console.log('--- Client API Route Files ---');
apis.forEach(a => {
  console.log(`- ${a.file} [${a.methods.join(', ')}] (Models: ${a.modelsUsed.join(', ')})`);
});
