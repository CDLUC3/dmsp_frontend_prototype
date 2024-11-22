const crowdin = require('@crowdin/crowdin-api-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const CROWDIN_API_TOKEN = process.env.CROWDIN_PERSONAL_TOKEN;
const CROWDIN_PROJECT_ID = process.env.CROWDIN_PROJECT_ID;

// initialization of crowdin client
const {
  projectsGroupsApi,
  uploadStorageApi,
  sourceFilesApi,
  translationsApi
} = new crowdin.default({
  token: CROWDIN_API_TOKEN
})

const directoryCache = {}; // Cache for storing directory paths and IDs


// Helper function to create directory in Crowdin
const createCrowdinDirectory = async (directoryName, parentId = null) => {
  try {
    const fullPath = parentId ? `${parentId}/${directoryName}` : directoryName;

    /* If directory already exists, we don't want to try and create that same directory. 
    Check cache for existing directory*/
    if (directoryCache[fullPath]) {
      return directoryCache[fullPath];
    }

    // Create the file directory
    const response = await sourceFilesApi.createDirectory(CROWDIN_PROJECT_ID, {
      name: directoryName,
      ...(parentId && { directoryId: parentId }),
    });

    const directoryId = response.data.id;
    console.log(`Created directory: ${directoryName} with ID: ${directoryId}`);

    // Cache the directory ID
    directoryCache[fullPath] = directoryId;

    return directoryId;
  } catch (error) {
    if (error.message.includes('Directory already exists')) {
      // If directory exists, fetch and return its ID
      const directories = await sourceFilesApi.listDirectories(CROWDIN_PROJECT_ID);
      const existingDir = directories.data.find(dir => dir.name === directoryName);
      return existingDir.id;
    }
    throw error;
  }
};

const uploadFileToCrowdin = async (filePath, relativePath) => {
  try {
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const fileName = path.basename(relativePath);
    const dirPath = path.dirname(relativePath);

    // Create directory structure if needed
    let currentDirId = null;
    if (dirPath !== '.') {
      const directories = dirPath.split(path.sep);
      for (const dir of directories) {
        // returns an id number
        currentDirId = await createCrowdinDirectory(dir, currentDirId);
      }
    }

    /* Upload file to storage. Files need to be added to storage before they
    can be created*/
    const storageResponse = await uploadStorageApi.addStorage(fileName, fileData);
    const storageId = storageResponse.data.id;
    console.log(`Uploaded ${fileName} to storage with ID: ${storageId}`);

    // Add file to the Crowdin project
    await sourceFilesApi.createFile(Number(CROWDIN_PROJECT_ID), {
      name: fileName,
      storageId,
      directoryId: currentDirId,
      type: 'json'
    });

    console.log(`File ${fileName} added to Crowdin in directory ${dirPath}`);
  } catch (error) {
    console.log("Error", error);
    console.error(`Error uploading ${relativePath}:`, error.message);
  }
};

const downloadFileFromCrowdin = async (fileId, outputDir) => {
  try {
    // Step 1: Export the file
    const exportResponse = await translationsApi.buildProjectFileTranslation(
      CROWDIN_PROJECT_ID,
      fileId,
      { targetLanguageId: 'en' } // Adjust target language as needed
    );

    const downloadUrl = exportResponse.data.url;

    // Step 2: Download the file
    const response = await fetch(downloadUrl);
    const fileData = await response.buffer();

    // Step 3: Save the file locally
    const outputPath = path.join(outputDir, `${fileId}.json`);
    fs.writeFileSync(outputPath, fileData);

    console.log(`File downloaded to ${outputPath}`);
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error.message);
  }
};

const processMessagesDirectory = async (baseDirectory) => {
  const processDirectory = async (currentPath, relativePath = 'messages') => {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const itemRelativePath = path.join(relativePath, item);

      if (fs.lstatSync(fullPath).isDirectory()) {
        if (item === 'en-US') {
          // Process files in en-US directory
          await processDirectory(fullPath, itemRelativePath);
        }
      } else if (path.extname(item) === '.json') {
        // Upload JSON file with its relative path
        await uploadFileToCrowdin(fullPath, itemRelativePath);
      }
    }
  };

  await processDirectory(baseDirectory);
};

// Example usage
(async () => {
  try {
    await processMessagesDirectory('./messages');
    console.log('Processing completed successfully');
  } catch (error) {
    console.error('Error processing directory:', error);
  }
})();
