/*eslint-disable  @typescript-eslint/no-var-requires*/
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: `.env.local` });

//Load environmental variables
const projectId = process.env.CROWDIN_PROJECT_ID;
const apiToken = process.env.CROWDIN_PERSONAL_TOKEN;

if (!projectId || !apiToken) {
  console.error('Error: CROWDIN_PROJECT_ID and CROWDIN_PERSONAL_TOKEN must be set as environment variables')
  process.exit(1);
}

// Read the template
const templatePath = path.resolve(__dirname, '../crowdin.template.yml');
console.log("***TEMPLATE PATH", templatePath);
const outputPath = path.resolve(__dirname, '../crowdin.yml');
const template = fs.readFileSync(templatePath, 'utf8');

// Replace placeholders with environment variables
const config = template
  .replace('${CROWDIN_PROJECT_ID}', projectId)
  .replace('${CROWDIN_PERSONAL_TOKEN}', apiToken);

// Write the final config
fs.writeFileSync(outputPath, config);
console.log(`crowdin.yml generated at ${outputPath}`);
