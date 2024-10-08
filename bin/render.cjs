
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

function nunjucksRender(templateFile, contextFile) {
  return nunjucks.renderString(readFile(templateFile), parseDataFile(contextFile));
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

// Read and verify params
const [templateFile, contextFile] = process.argv.slice(2);
if (!templateFile || !contextFile) {
  console.error("Usage:\n  node render.cjs <templateFile> <dataFile>");
  process.exit(1);
}

// Render output
output = nunjucksRender(templateFile, contextFile)
console.log(output.trimEnd());
