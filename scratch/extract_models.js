const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '..', 'models');
const files = fs.readdirSync(modelsDir);

const result = [];

files.forEach(file => {
  if (!file.endsWith('.ts')) return;
  const filePath = path.join(modelsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract interface
  const interfaceRegex = /export interface (\w+)(?: extends [\w.,<> ]+)? \{([\s\S]*?)\n\}/;
  const interfaceMatch = content.match(interfaceRegex);
  
  // Extract schema definition
  const schemaRegex = /const \w+Schema: Schema = new Schema\([\s\S]*?\}\n\s*\)/;
  const schemaMatch = content.match(schemaRegex) || content.match(/new Schema\(\{([\s\S]*?)\}\s*,\s*\{/);

  result.push({
    modelName: file.replace('.ts', ''),
    interface: interfaceMatch ? interfaceMatch[0] : 'Not Found',
    schemaSnippet: schemaMatch ? schemaMatch[0] : 'Not Found'
  });
});

fs.writeFileSync(path.join(__dirname, 'models_summary.json'), JSON.stringify(result, null, 2));
console.log('Processed', files.length, 'models.');
