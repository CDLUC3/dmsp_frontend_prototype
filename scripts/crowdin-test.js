/* eslint-disable @typescript-eslint/no-var-requires*/
const crowdin = require('@crowdin/crowdin-api-client');
require('dotenv').config({ path: '.env.local' });

const token = process.env.CROWDIN_PERSONAL_TOKEN;
const { sourceFilesApi } = new crowdin.default({ token });
const { translationsApi } = new crowdin.default({ token });

async function test() {
  const project = process.env.CROWDIN_PROJECT_ID;

  // Add debug logging
  console.log('Debug info:');
  console.log('Project ID:', project);
  console.log('Token exists:', !!token);

  try {
    // List all directories
    const directories = await sourceFilesApi.listProjectFiles(project);
    console.log('Available directories:', JSON.stringify(directories, null, 2));

    const directoryId = directories.data[0].data.directoryId;
    console.log("Directory ID", directoryId);
    const res = await translationsApi.buildProjectDirectoryTranslation(project, directoryId);
    console.log(JSON.stringify(res));
  } catch (e) {
    console.log("ERROR:", e);
    if (e instanceof crowdin.CrowdinValidationError) {
      console.log('Validation error');
    } else if (e instanceof crowdin.CrowdinError) {
      console.log('Generic error');
    }
    console.error(e);
  }
}

test();