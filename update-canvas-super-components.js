#!/usr/bin/env node

/**
 * Script to automatically update canvas component files with super components
 * This ensures all super components show their first variant on the canvas
 * 
 * Usage: node update-canvas-super-components.js
 */

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, 'component-catalog.json');
const CANVAS_TS_PATH = path.join(__dirname, 'src/app/pages/components-canvas/components-canvas.component.ts');
const CANVAS_HTML_PATH = path.join(__dirname, 'src/app/pages/components-canvas/components-canvas.component.html');

// Helper function to convert component ID to class name
function toClassName(id) {
  const cleanId = id.startsWith('app-') ? id.replace(/^app-/, '') : id;
  return cleanId
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Component';
}

// Helper function to convert component ID to import path
function toImportPath(id) {
  return `../../components/${id}/${id}.component`;
}

// Read catalog
function readCatalog() {
  try {
    const catalogContent = fs.readFileSync(CATALOG_PATH, 'utf8');
    return JSON.parse(catalogContent);
  } catch (error) {
    console.error('❌ Error reading catalog:', error.message);
    process.exit(1);
  }
}

// Get all super components from catalog
function getSuperComponents(catalog) {
  const superComponents = [];
  const components = catalog.registeredComponents || {};
  
  for (const [id, entry] of Object.entries(components)) {
    if (entry.isSuperComponent === true) {
      superComponents.push({
        id: id,
        className: toClassName(id),
        importPath: toImportPath(id),
        selector: entry.htmlSelector || id
      });
    }
  }
  
  return superComponents;
}

// Update TypeScript file
function updateTypeScriptFile(superComponents) {
  let content = fs.readFileSync(CANVAS_TS_PATH, 'utf8');
  
  // Find where imports end
  const importEndIndex = content.indexOf('declare var initFlowbite');
  if (importEndIndex === -1) {
    console.error('❌ Could not find import section');
    return false;
  }
  
  // Extract existing imports
  const importSection = content.substring(0, importEndIndex);
  const existingImports = new Set();
  const importRegex = /import\s+{[^}]+}\s+from\s+['"]([^'"]+)['"];?/g;
  let match;
  while ((match = importRegex.exec(importSection)) !== null) {
    existingImports.add(match[0]);
  }
  
  // Add new super component imports
  superComponents.forEach(comp => {
    const newImport = `import { ${comp.className} } from '${comp.importPath}';`;
    if (!Array.from(existingImports).some(imp => imp.includes(comp.className))) {
      existingImports.add(newImport);
    }
  });
  
  // Rebuild imports section
  const baseImports = [
    "import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';",
    "import { CommonModule } from '@angular/common';",
    "import { RouterLink } from '@angular/router';",
    "import { FormsModule } from '@angular/forms';",
    "import { DragDropModule, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';",
    "import { ComponentCatalogService, CatalogEntry } from '../../services/component-catalog.service';",
    "import { SidebarComponent } from '../../components/sidebar/sidebar.component';"
  ];
  
  // Get super component imports
  const superComponentImports = Array.from(existingImports).filter(imp => 
    imp.includes('components/') && !imp.includes('sidebar')
  );
  
  // Combine all imports
  const allImports = [...baseImports, ...superComponentImports, 'declare var initFlowbite: () => void;'];
  
  // Replace imports section
  const beforeImports = content.substring(0, content.indexOf("import { Component"));
  const afterImports = content.substring(importEndIndex + 'declare var initFlowbite: () => void;'.length);
  content = beforeImports + allImports.join('\n') + '\n' + afterImports;
  
  // Update imports array in @Component decorator
  const componentDecoratorRegex = /imports:\s*\[([^\]]+)\]/;
  const existingImportsArray = content.match(componentDecoratorRegex);
  if (existingImportsArray) {
    // Extract existing component imports
    const existingComponents = existingImportsArray[1].split(',').map(s => s.trim());
    const baseComponentImports = [
      'CommonModule',
      'DragDropModule',
      'RouterLink',
      'FormsModule',
      'SidebarComponent'
    ];
    
    // Get super component class names
    const superComponentClasses = superComponents.map(c => c.className);
    
    // Combine (remove duplicates)
    const allComponentImports = [...new Set([...baseComponentImports, ...superComponentClasses])];
    const newImportsArray = `imports: [${allComponentImports.join(', ')}]`;
    content = content.replace(componentDecoratorRegex, newImportsArray);
  }
  
  fs.writeFileSync(CANVAS_TS_PATH, content, 'utf8');
  console.log('✅ Updated components-canvas.component.ts');
  return true;
}

// Update HTML file
function updateHtmlFile(superComponents) {
  let content = fs.readFileSync(CANVAS_HTML_PATH, 'utf8');
  
  // Find the switch statement for super components
  const switchStartMarker = '<!-- Super Component Rendering -->';
  const switchStart = content.indexOf(switchStartMarker);
  const switchStartIndex = content.indexOf('@switch (element.type) {', switchStart);
  const defaultStart = content.indexOf('@default {', switchStartIndex);
  
  if (switchStartIndex === -1 || defaultStart === -1) {
    console.error('❌ Could not find switch statement');
    return false;
  }
  
  // Extract existing cases to preserve them
  const switchContent = content.substring(switchStartIndex, defaultStart);
  const existingCaseIds = new Set();
  const caseRegex = /@case\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;
  while ((match = caseRegex.exec(switchContent)) !== null) {
    existingCaseIds.add(match[1]);
  }
  
  // Build case statements for all super components
  const allCases = [];
  superComponents.forEach(comp => {
    allCases.push(`              @case ('${comp.id}') {
                <${comp.selector} variant="1"></${comp.selector}>
              }`);
  });
  
  // Get the default case and everything after
  const defaultCaseEnd = content.indexOf('}', defaultStart);
  const afterSwitch = content.substring(defaultCaseEnd + 1);
  
  // Rebuild the switch statement
  const beforeSwitch = content.substring(0, switchStartIndex);
  const switchHeader = '            @switch (element.type) {';
  const newCases = allCases.join('\n');
  const defaultCase = content.substring(defaultStart, defaultCaseEnd + 1);
  
  content = beforeSwitch + switchHeader + '\n' + newCases + '\n' + defaultCase + afterSwitch;
  
  fs.writeFileSync(CANVAS_HTML_PATH, content, 'utf8');
  console.log('✅ Updated components-canvas.component.html');
  return true;
}

// Main function
function main() {
  console.log('🔄 Updating canvas component files with super components...\n');
  
  const catalog = readCatalog();
  const superComponents = getSuperComponents(catalog);
  
  if (superComponents.length === 0) {
    console.log('ℹ️  No super components found in catalog');
    return;
  }
  
  console.log(`📦 Found ${superComponents.length} super component(s):`);
  superComponents.forEach(comp => {
    console.log(`   - ${comp.id} (${comp.className})`);
  });
  console.log('');
  
  // Update files
  const tsUpdated = updateTypeScriptFile(superComponents);
  const htmlUpdated = updateHtmlFile(superComponents);
  
  if (tsUpdated && htmlUpdated) {
    console.log('\n✅ Successfully updated canvas component files!');
    console.log('💡 All super components will now show their first variant on the canvas.');
  } else {
    console.error('\n❌ Failed to update some files');
    process.exit(1);
  }
}

// Run script
if (require.main === module) {
  main();
}

module.exports = { main, getSuperComponents, toClassName };
