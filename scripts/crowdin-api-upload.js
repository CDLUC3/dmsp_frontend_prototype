const crowdin = require('@crowdin/crowdin-api-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const CROWDIN_API_TOKEN = process.env.CROWDIN_PERSONAL_TOKEN;
const CROWDIN_PROJECT_ID = process.env.CROWDIN_PROJECT_ID;

// initialization of crowdin client
const {
  uploadStorageApi,
  sourceFilesApi,
} = new crowdin.default({
  token: CROWDIN_API_TOKEN
})

// Get all files in your app directory
function getLocalFiles(directory, relativePath = '/messages/en-US') {
  const filePaths = [];
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const itemRelativePath = path.join(relativePath, item);

    if (fs.lstatSync(fullPath).isDirectory()) {
      filePaths.push(...getLocalFiles(fullPath, itemRelativePath));
    } else if (path.extname(item) === '.json') {
      filePaths.push(itemRelativePath);
    }
  }

  return filePaths;
}

// Delete a file from Crowdin
async function deleteFile(projectId, fileId, filePath) {
  await sourceFilesApi.deleteFile(projectId, fileId);
  console.log(`Deleted file from Crowdin: ${filePath}`);
}

// Compare Crowdin files with local files and delete missing ones
async function deleteMissingFiles(projectId, localFilePaths) {
  const files = await sourceFilesApi.listProjectFiles(projectId);

  for (const file of files.data) {
    const relativePath = file.data.path;
    if (!localFilePaths.includes(relativePath)) {
      await deleteFile(projectId, file.data.id, relativePath);
    }
  }
}


async function getFileIdByPath(projectId, relativePath) {
  const files = await sourceFilesApi.listProjectFiles(projectId);
  const matchedFile = files.data.find(
    file => file.data.path === relativePath
  );
  if (matchedFile) {
    return matchedFile.data.id;
  }
  console.log(`File not found in Crowdin for path: ${relativePath}`);
  return null;
}

async function createFile(projectId, fileContent, relativePath) {
  const fileName = path.basename(relativePath);
  const parentDirectory = path.dirname(`/${relativePath}`); // e.g., "messages/en-US"
  const storageResponse = await uploadStorageApi.addStorage(fileName, fileContent);

  const directories = await sourceFilesApi.listProjectDirectories(projectId);
  const matchedDirectory = directories.data.find(
    dir => {
      return dir.data.path === parentDirectory;
    }
  );

  if (!matchedDirectory) {
    throw new Error(`Directory not found in Crowdin: ${parentDirectory}`);
  }

  const parentDirectoryId = matchedDirectory.data.id;

  await sourceFilesApi.createFile(projectId, {
    storageId: storageResponse.data.id,
    name: fileName,
    directoryId: parentDirectoryId,
  });

  console.log(`File created: ${relativePath}`);
}

/* If the file already exists in Crowdin, then update it, otherwise, for new files, 
call createFile*/
async function updateOrCreateFile(projectId, relativePath, fileContent, fullPath) {
  const fileId = await getFileIdByPath(CROWDIN_PROJECT_ID, `/${relativePath}`);
  if (fileId) {
    console.log(`Updating file: ${relativePath}`);
    await updateFile(projectId, fileId, fileContent, relativePath);
  } else {
    if (relativePath.includes('.json')) {
      await createFile(projectId, fileContent, relativePath);
    }
  }
}

async function updateFile(projectId, fileId, fileContent, relativePath) {
  const fileName = path.basename(relativePath);
  const storageResponse = await uploadStorageApi.addStorage(fileName, fileContent);
  await sourceFilesApi.updateOrRestoreFile(projectId, fileId, {
    storageId: storageResponse.data.id,
  });
}

const processMessagesDirectory = async (baseDirectory) => {
  const processDirectory = async (currentPath, relativePath = 'messages') => {
    const items = fs.readdirSync(currentPath);

    /* Loop through all items in the 'messages/en-US' directory
    and update all messages in Crowdin*/
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const itemRelativePath = path.join(relativePath, item);
      if (fs.lstatSync(fullPath).isDirectory()) {
        // recursively call if item is a directory and not a file
        await processDirectory(fullPath, itemRelativePath);
        // If it is a .json file inside the 'messages/en-US' directory
      } else if (path.extname(item) === '.json' && itemRelativePath.includes('messages/en-US')) {
        // Upload JSON file with its relative path
        const fileData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

        await updateOrCreateFile(CROWDIN_PROJECT_ID, itemRelativePath, fileData, '/messages/en-US');
        try {
          // Get all local files
          const localFilePaths = getLocalFiles('./messages/en-US');
          await deleteMissingFiles(CROWDIN_PROJECT_ID, localFilePaths);

        } catch (error) {
          console.error(`Error deleting missing files from Crowdin:`, error);
        }
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
