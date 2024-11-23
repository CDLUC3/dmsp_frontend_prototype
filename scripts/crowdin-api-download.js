/* eslint-disable @typescript-eslint/no-var-requires*/
const crowdin = require('@crowdin/crowdin-api-client');
const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const CROWDIN_API_TOKEN = process.env.CROWDIN_PERSONAL_TOKEN;
const CROWDIN_PROJECT_ID = process.env.CROWDIN_PROJECT_ID;

// initialization of crowdin client
const { translationsApi } = new crowdin.default({
  token: CROWDIN_API_TOKEN,
});

async function downloadTranslations(projectId) {
  const result = await translationsApi.buildProject(projectId);

  let status = result.data.status;
  console.log('Building translations...');
  while (status !== 'finished') {
    const progress = await translationsApi.checkBuildStatus(projectId, result.data.id);
    status = progress.data.status;
    console.log(`Build status: ${status}`);
  }

  const translations = await translationsApi.downloadTranslations(projectId, result.data.id);
  console.log("Translations URL:", translations.data.url);
  return translations.data.url;
}

async function saveTranslationsToDirectory(downloadUrl, targetDirectory) {
  console.log('Preparing to save translations...');
  const targetLocaleDir = path.join(targetDirectory, 'pt-BR');

  // Step 1: Clean up the target directory
  if (fs.existsSync(targetLocaleDir)) {
    console.log('Cleaning up existing translations in pt-BR...', targetLocaleDir);
    // Remove all files under "messages/pt-BR" first, so that any old, unused translated files are removed
    await fs.promises.rm(targetLocaleDir, { recursive: true, force: true });
  }

  console.log('Downloading translation file...');
  const response = await axios({
    url: downloadUrl,
    method: 'GET',
    responseType: 'arraybuffer', // Ensure the file is downloaded as binary
  });

  console.log('Saving translation zip...');
  const zipPath = path.join(targetDirectory, 'translations.zip');
  fs.writeFileSync(zipPath, response.data);

  console.log('Extracting zip...');
  const zip = new AdmZip(zipPath);
  const extractedPath = path.join(targetDirectory, 'extracted');
  zip.extractAllTo(extractedPath, true);

  console.log('Cleaning up zipe file...');
  fs.unlinkSync(zipPath); // Remove the zip file after extraction

  console.log('Reorganizing files...');
  reorganizeFiles(extractedPath, targetDirectory);

  console.log(`Translations saved to: ${targetDirectory}`);
  fs.rmdirSync(extractedPath, { recursive: true }); // Clean up extracted directory
}

function reorganizeFiles(sourceDir, targetDir) {
  const processDirectory = (currentPath, currentLocale) => {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      if (fs.lstatSync(fullPath).isDirectory()) {
        const newLocale = item === 'messages' ? currentLocale : item; // Update locale if found
        processDirectory(fullPath, newLocale);
      } else if (path.extname(item) === '.json') {
        const newLocale = currentLocale.replace('en-US', 'pt-BR'); // Map `en-US` to `pt-BR`
        const newPath = path.join(targetDir, newLocale);
        if (!fs.existsSync(newPath)) {
          fs.mkdirSync(newPath, { recursive: true });
        }
        fs.renameSync(fullPath, path.join(newPath, item)); // Move file to new path
      }
    }
  };

  processDirectory(sourceDir, '');
}

(async () => {
  try {
    const targetDirectory = path.resolve(__dirname, '../messages');
    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory, { recursive: true });
    }

    const downloadUrl = await downloadTranslations(CROWDIN_PROJECT_ID);
    await saveTranslationsToDirectory(downloadUrl, targetDirectory);
    console.log('Translations downloaded and extracted successfully.');
  } catch (error) {
    console.error('Error downloading or saving translations:', error);
  }
})();