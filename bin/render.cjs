
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

// Custom filters
const filters = {
  // Avoid needing to use {% raw %} around {{ }} delimiters
  "inCurlies": (str) => `\{{ ${str} }}`,
}

function setupFilters(env, filters) {
  for (const f in filters) {
    env.addFilter(f, filters[f]);
  }
}

// Custom globals
function setupGlobals(env, contextFile, extraData) {
  const contextData = { ...parseDataFile(contextFile), ...extraData };

  // We're expecting the _templateFile key to be set to
  // the name of the top level template file
  const matchers = {
    "Jenkins": /Jenkins/,
    "GitHub": /github/,
    "GitLab": /gitlab/,
    "Azure": /azure/,
    "Bash": /\.sh(\..+)?/,
  }

  for (const m in matchers) {
    env.addGlobal(`is${m}`, matchers[m].test(contextData._templateFile));
  }

  // Todo maybe: Add globals for git sha and timestamp
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

// Setup custom stuff
setupFilters(env, filters)
setupGlobals(env, contextFile, paramData)

// Render output
output = nunjucksRender(templateFile, contextFile, paramData)
console.log(output.trimEnd());
