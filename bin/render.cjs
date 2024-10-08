
const fs = require('fs');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');

function readFile(fileName) {
  return fs.readFileSync(fileName, 'utf-8');
}

function parseDataFile(fileName) {
  const fileContent = readFile(fileName);
  if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
    return yaml.load(fileContent);
  }
  return JSON.parse(fileContent);
}

function nunjucksRender(templateFile, contextFile, extraData) {
  const contextData = { ...parseDataFile(contextFile), ...extraData };
  return nunjucks.renderString(readFile(templateFile), contextData);
}

// Configure templates path
const env = nunjucks.configure('templates/partials', {
  autoescape: true,
});

// Add some custom filters
const filters = {
  // Avoid needing to use {% raw %} around {{ }} delimiters
  "inCurlies": (str) => `\{{ ${str} }}`,
}

for (const filter in filters) {
  env.addFilter(filter, filters[filter]);
}

// Read and verify required params
const [templateFile, contextFile] = process.argv.slice(2);
if (!templateFile || !contextFile) {
  console.error("Usage:\n  node render.cjs <templateFile> <dataFile> [<key1>=<val1>] [<key2>=<val2>] ...");
  process.exit(1);
}

// Read optional key=value params
// Todo maybe: Use json for this
const paramData = {}
const keyValArgs = process.argv.slice(4)
for (const i in keyValArgs) {
  const [key, val] = keyValArgs[i].split('=');
  paramData[key] = val;
}

// Render output
output = nunjucksRender(templateFile, contextFile, paramData)
console.log(output.trimEnd());
