const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');
const IGNORE_FILES = ['layout.tsx', 'loading.tsx', 'error.tsx', 'page.module.css', 'page.css'];

function isPageFile(file) {
  return (
    file.startsWith('page.') &&
    (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.js'))
  );
}

function formatSegment(segment) {
  // Convert [param] to :param
  return segment.replace(/\[(.+?)\]/g, ':$1');
}

function walk(dir, parentRoute = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let routes = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      const childRoutes = walk(path.join(dir, entry.name), parentRoute + '/' + formatSegment(entry.name));
      routes = routes.concat(childRoutes);
    } else if (isPageFile(entry.name) && !IGNORE_FILES.includes(entry.name)) {
      const route = parentRoute || '/';
      routes.push(route);
    }
  }
  return routes;
}

function groupRoutes(routes) {
  const groups = {};

  for (const route of routes) {
    const parts = route.split('/').filter(Boolean);

    if (parts.length === 0) {
      // Root route
      if (!groups['root']) groups['root'] = [];
      groups['root'].push(route);
      continue;
    }

    // Skip :locale and get the actual section
    const sectionIndex = parts[0].startsWith(':') ? 1 : 0;
    const section = parts[sectionIndex] || 'root';

    if (!groups[section]) groups[section] = [];
    groups[section].push(route);
  }

  return groups;
}

function generateMermaidMindmap(routes) {
  const groups = groupRoutes(routes);
  const sections = Object.keys(groups).filter(k => k !== 'root').sort();

  let mermaid = '```mermaid\n%%{init: {\'theme\':\'neutral\'}}%%\nmindmap\n  root((App Routes))\n';

  // Add locale section
  mermaid += '    /:locale\n';

  for (const section of sections) {
    const sectionRoutes = groups[section];
    const routeCount = sectionRoutes.length;
    mermaid += `      ${section}\n`;
    mermaid += `        [${routeCount} route${routeCount !== 1 ? 's' : ''}]\n`;
  }

  if (groups['root']) {
    mermaid += '    Root\n';
    mermaid += `      [${groups['root'].length} route${groups['root'].length !== 1 ? 's' : ''}]\n`;
  }

  mermaid += '```\n';
  return mermaid;
}

function generateMermaidFlowchart(routes, title = 'Routes') {
  if (routes.length === 0) return '';

  // Build a tree structure for better visualization
  const tree = {};

  for (const route of routes) {
    const parts = route.split('/').filter(Boolean);
    let current = tree;

    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }

  let mermaid = '```mermaid\ngraph TD\n';
  let nodeId = 0;
  const nodeMap = new Map();

  function getNodeId(path) {
    if (!nodeMap.has(path)) {
      nodeMap.set(path, `node${nodeId++}`);
    }
    return nodeMap.get(path);
  }

  function addNode(label, path, isParam = false) {
    const id = getNodeId(path);
    if (isParam) {
      mermaid += `    ${id}["${label}"]\n`;
    } else {
      mermaid += `    ${id}[${label}]\n`;
    }
    return id;
  }

  function traverseTree(node, currentPath = '', parentId = null) {
    const keys = Object.keys(node).sort();

    for (const key of keys) {
      const fullPath = currentPath + '/' + key;
      const isParam = key.startsWith(':');
      const nodeId = addNode(key, fullPath, isParam);

      if (parentId) {
        mermaid += `    ${parentId} --> ${nodeId}\n`;
      }

      if (Object.keys(node[key]).length > 0) {
        traverseTree(node[key], fullPath, nodeId);
      }
    }
  }

  // Start with root
  const rootId = addNode(title, 'root', false);
  traverseTree(tree, '', rootId);

  mermaid += '```\n';
  return mermaid;
}

function generateGroupMarkdown(groupName, routes) {
  const capitalizedName = groupName.charAt(0).toUpperCase() + groupName.slice(1);

  let content = `# ${capitalizedName} Routes\n\n`;
  content += `This section contains ${routes.length} route${routes.length !== 1 ? 's' : ''}.\n\n`;

  // Add Mermaid flowchart
  content += '## Route Structure\n\n';
  content += generateMermaidFlowchart(routes, capitalizedName);
  content += '\n';

  // Add table of routes
  content += '## All Routes\n\n';
  content += '| Route | Depth |\n';
  content += '|-------|-------|\n';

  const sortedRoutes = [...routes].sort();
  for (const route of sortedRoutes) {
    const depth = route.split('/').filter(Boolean).length;
    content += `| \`${route}\` | ${depth} |\n`;
  }

  return content;
}

function generateMainSitemap(routes, groups) {
  let content = '# Application Sitemap\n\n';
  content += `Generated on: ${new Date().toISOString()}\n\n`;
  content += `Total routes: ${routes.length}\n\n`;

  // Add overview mindmap
  content += '## Overview\n\n';
  content += generateMermaidMindmap(routes);
  content += '\n';

  // Add route groups summary
  content += '## Route Groups\n\n';

  const sections = Object.keys(groups).filter(k => k !== 'root').sort();
  for (const section of sections) {
    const count = groups[section].length;
    content += `- **[${section}](./routes/${section}.md)** - ${count} route${count !== 1 ? 's' : ''}\n`;
  }

  if (groups['root']) {
    content += `- **[Root Routes](./routes/root.md)** - ${groups['root'].length} route${groups['root'].length !== 1 ? 's' : ''}\n`;
  }

  content += '\n## Quick Reference\n\n';
  content += '<details>\n<summary>View all routes</summary>\n\n';

  const sortedRoutes = [...routes].sort();
  for (const route of sortedRoutes) {
    content += `- \`${route}\`\n`;
  }

  content += '\n</details>\n';

  return content;
}

// Main execution
console.log('Generating sitemap...');

const routes = walk(APP_DIR);
const groups = groupRoutes(routes);

const docsDir = path.join(__dirname, '..', 'docs');

const routesDir = path.join(docsDir, 'routes');

// Create directories
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);
if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir);

// Generate main sitemap
const mainContent = generateMainSitemap(routes, groups);
fs.writeFileSync(path.join(docsDir, 'sitemap.md'), mainContent);
console.log('✓ Main sitemap written to docs/sitemap.md');

// Generate individual group files
for (const [groupName, groupRoutes] of Object.entries(groups)) {
  const filename = groupName === 'root' ? 'root.md' : `${groupName}.md`;
  const content = generateGroupMarkdown(groupName, groupRoutes);
  fs.writeFileSync(path.join(routesDir, filename), content);
  console.log(`✓ Generated docs/routes/${filename} (${groupRoutes.length} routes)`);
}

console.log('\n✨ Sitemap generation complete!');
console.log(`📊 Total: ${routes.length} routes across ${Object.keys(groups).length} groups`);