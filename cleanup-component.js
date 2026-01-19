#!/usr/bin/env node

/**
 * Script to clean up a component from all references
 * Usage: node cleanup-component.js <componentId>
 */

const fs = require('fs');
const path = require('path');

const componentId = process.argv[2];

if (!componentId) {
  console.error('❌ Component ID is required');
  console.log('Usage: node cleanup-component.js <componentId>');
  process.exit(1);
}

console.log(`\n🧹 Cleaning up component: ${componentId}\n`);

// Handle variations
const variations = [
  componentId,
  componentId.replace(/^app-app-/, 'app-'),
  componentId.replace(/^app-/, ''),
  componentId.replace(/^app-app-/, '')
];
const uniqueVariations = [...new Set(variations)];
console.log(`📋 Checking variations: ${uniqueVariations.join(', ')}\n`);

// Helper function to recursively find all files
function findFilesRecursive(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.angular') {
        findFilesRecursive(filePath, extensions, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Clean up component catalog
const catalogPath = path.join(__dirname, 'component-catalog.json');
if (fs.existsSync(catalogPath)) {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  let modified = false;
  
  uniqueVariations.forEach(variation => {
    if (catalog.registeredComponents && catalog.registeredComponents[variation]) {
      delete catalog.registeredComponents[variation];
      console.log(`✓ Removed ${variation} from catalog`);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
    console.log('✅ Updated component-catalog.json\n');
  }
}

// Clean up TypeScript files
console.log('🔍 Cleaning TypeScript files...');
const srcDir = path.join(__dirname, 'src');
const tsFiles = findFilesRecursive(srcDir, ['.ts']);
let tsCleaned = 0;

tsFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  uniqueVariations.forEach(variation => {
    const componentClassName = variation.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('') + 'Component';
    
    // Remove imports
    const importRegex = new RegExp(`import\\s*{[^}]*${componentClassName}[^}]*}\\s*from\\s*['"][^'"]*/${variation}/${variation}\\.component['"];?\\s*\\n?`, 'g');
    content = content.replace(importRegex, '');
    
    // Remove from imports array
    const importsArrayRegex = new RegExp(`(,\\s*${componentClassName}\\s*(?=,|\\]))|((?<=\\[|,)\\s*${componentClassName}\\s*,)`, 'g');
    content = content.replace(importsArrayRegex, '');
    
    // Remove array elements
    const arrayElementRegex = new RegExp(`\\s*{\\s*[^}]*type:\\s*['"]${variation}['"][^}]*}\\s*,?\\s*\\n?`, 'g');
    content = content.replace(arrayElementRegex, '');
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✓ Cleaned: ${path.relative(__dirname, filePath)}`);
    tsCleaned++;
  }
});

console.log(`✅ Cleaned ${tsCleaned} TypeScript file(s)\n`);

// Clean up HTML files
console.log('🔍 Cleaning HTML files...');
const htmlFiles = findFilesRecursive(srcDir, ['.html']);
let htmlCleaned = 0;

htmlFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  uniqueVariations.forEach(variation => {
    // Remove component tags
    const componentTagRegex = new RegExp(`<app-${variation.replace(/^app-/, '')}[^>]*>.*?</app-${variation.replace(/^app-/, '')}>`, 'gs');
    content = content.replace(componentTagRegex, '');
    
    // Remove self-closing tags
    const selfClosingTagRegex = new RegExp(`<app-${variation.replace(/^app-/, '')}[^>]*/>`, 'g');
    content = content.replace(selfClosingTagRegex, '');
    
    // Remove switch cases
    const switchCaseRegex = new RegExp(`@case\\s*\\(['"]${variation}['"]\\)\\s*{[\\s\\S]*?}\\s*`, 'g');
    content = content.replace(switchCaseRegex, '');
    
    // Remove @if blocks
    const ifBlockRegex = new RegExp(`@if\\s*\\([^)]*['"]${variation}['"][^)]*\\)\\s*{[\\s\\S]*?}\\s*`, 'g');
    content = content.replace(ifBlockRegex, '');
  });
  
  // Clean up blank lines
  content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✓ Cleaned: ${path.relative(__dirname, filePath)}`);
    htmlCleaned++;
  }
});

console.log(`✅ Cleaned ${htmlCleaned} HTML file(s)\n`);

console.log('✅ Component cleanup complete!');
console.log('\n💡 Note: If the component is still showing on the canvas,');
console.log('   refresh the page or clear browser localStorage.');
