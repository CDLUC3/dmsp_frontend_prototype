/*eslint-disable  @typescript-eslint/no-var-requires*/
const fs = require('fs');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const sanitizeTranslationFile = (filePath) => {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const sanitizedContent = Object.keys(content).reduce((sanitized, key) => {
    // Recursively sanitize nested objects
    sanitized[key] = Object.keys(content[key]).reduce((sanitizedObj, subKey) => {
      const value = content[key][subKey];

      // Only sanitize string values
      sanitizedObj[subKey] = typeof value === 'string'
        ? sanitizeHtml(value, {
          allowedTags: ['b', 'i', 'em', 'p', 'strong', 'a', 'important', 'guidelines'],
          allowedAttributes: {
            'a': ['href'],
            'important': [],
            'guidelines': []
          },
          // escapes disallowed tags
          disallowedTagsMode: 'escape'
        })
        : value;

      return sanitizedObj;
    }, {});

    return sanitized;
  }, {});

  fs.writeFileSync(filePath, JSON.stringify(sanitizedContent, null, 2));
  console.log(`Sanitized: ${filePath}`);
};

// Recursive function to get all JSON files
const getAllJsonFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recurse into subdirectory
      arrayOfFiles = getAllJsonFiles(filePath, arrayOfFiles);
    } else if (path.extname(file) === '.json') {
      // Add JSON file to array
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
};

const sanitizeAllTranslations = () => {
  // sanitize translations under pt-BR
  const translationDir = path.join(__dirname, '../messages');

  // Exit if directory does not exist
  if (!fs.existsSync(translationDir)) {
    console.error(`Translations directory not found: ${translationDir}`);
    process.exit(1);
  }

  try {
    // Get all JSON files recursively
    const jsonFiles = getAllJsonFiles(translationDir);

    // Log found files
    console.log(`Found ${jsonFiles.length} JSON files to sanitize:`);
    jsonFiles.forEach(file => console.log(` - ${file}`));

    // Sanitize each file
    jsonFiles.forEach(filePath => {
      try {
        sanitizeTranslationFile(filePath);
      } catch (error) {
        console.error(`Error sanitizing ${filePath}:`, error);
      }
    });

    console.log('\nSanitization complete.');
  } catch (error) {
    console.error('Error during sanitization process:', error);
    process.exit(1);
  }

  console.log('All translations sanitized.');
};

sanitizeAllTranslations();