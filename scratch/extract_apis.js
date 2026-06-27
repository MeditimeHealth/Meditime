const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'app', 'api');

function getRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.js') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allRoutes = getRouteFiles(apiDir);
const clientRoutes = allRoutes.filter(f => !f.includes(path.sep + 'admin' + path.sep));

const routeInfos = [];

clientRoutes.forEach(routeFile => {
  const relPath = path.relative(apiDir, routeFile);
  const content = fs.readFileSync(routeFile, 'utf-8');

  // Find exported methods
  const methods = [];
  const methodRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    methods.push(match[1]);
  }

  // Look for mongoose model usage
  const modelsUsed = [];
  const modelRegex = /import\s+.*?([A-Z]\w+)\s+from\s+['"].*?\/models\/.*?['"]/g;
  let modelMatch;
  while ((modelMatch = modelRegex.exec(content)) !== null) {
    modelsUsed.push(modelMatch[1]);
  }

  // Also check if any models are used via db connection or directly mentioned
  const directModelRegex = /\b([A-Z]\w+)\.(find|create|findOne|findById|updateOne|updateMany|deleteOne|deleteMany|countDocuments|aggregate)\b/g;
  let directMatch;
  while ((directMatch = directModelRegex.exec(content)) !== null) {
    const m = directMatch[1];
    if (!modelsUsed.includes(m) && m !== 'Schema' && m !== 'mongoose' && m !== 'Response' && m !== 'NextResponse') {
      modelsUsed.push(m);
    }
  }

  routeInfos.push({
    file: relPath.replace(/\\/g, '/'),
    methods,
    modelsUsed: [...new Set(modelsUsed)]
  });
});

fs.writeFileSync(path.join(__dirname, 'apis_summary.json'), JSON.stringify(routeInfos, null, 2));
console.log('Processed', routeInfos.length, 'client API route files.');
