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

// Check if component file exists
function componentExists(componentId) {
  const componentPath = path.join(__dirname, 'src/app/components', componentId, `${componentId}.component.ts`);
  return fs.existsSync(componentPath);
}

// Update TypeScript file
function updateTypeScriptFile(superComponents) {
  let content = fs.readFileSync(CANVAS_TS_PATH, 'utf8');
  
  // Filter out super components that don't have files
  const validSuperComponents = superComponents.filter(comp => {
    const exists = componentExists(comp.id);
    if (!exists) {
      console.log(`⚠️  Skipping ${comp.id} - component file not found`);
    }
    return exists;
  });
  
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
  
  // Remove imports for components that no longer exist
  const validComponentIds = new Set(validSuperComponents.map(c => c.id));
  const validClassNames = new Set(validSuperComponents.map(c => c.className));
  
  // Filter out imports for deleted components
  const filteredImports = Array.from(existingImports).filter(imp => {
    // Keep base imports
    if (!imp.includes('components/') || imp.includes('sidebar')) {
      return true;
    }
    // Check if this import is for a valid super component
    return validSuperComponents.some(comp => imp.includes(comp.className));
  });
  
  // Add new super component imports
  validSuperComponents.forEach(comp => {
    const newImport = `import { ${comp.className} } from '${comp.importPath}';`;
    if (!filteredImports.some(imp => imp.includes(comp.className))) {
      filteredImports.push(newImport);
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
  
  // Get super component imports (only valid ones)
  const superComponentImports = filteredImports.filter(imp => 
    imp.includes('components/') && !imp.includes('sidebar')
  );
  
  // Combine all imports
  const allImports = [...baseImports, ...superComponentImports, 'declare var initFlowbite: () => void;'];
  
  // Replace imports section
  const beforeImports = content.substring(0, content.indexOf("import { Component"));
  const afterImports = content.substring(importEndIndex + 'declare var initFlowbite: () => void;'.length);
  content = beforeImports + allImports.join('\n') + '\n' + afterImports;
  
  // Clean up any duplicate imports
  const lines = content.split('\n');
  const seenImports = new Set();
  const cleanedLines = [];
  for (const line of lines) {
    if (line.trim().startsWith('import ')) {
      if (!seenImports.has(line.trim())) {
        seenImports.add(line.trim());
        cleanedLines.push(line);
      }
    } else {
      cleanedLines.push(line);
    }
  }
  content = cleanedLines.join('\n');
  
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
    
    // Get super component class names (only valid ones that have imports)
    const superComponentClasses = validSuperComponents
      .filter(comp => {
        // Verify import statement exists
        const importStatement = `import { ${comp.className} } from '${comp.importPath}';`;
        return content.includes(importStatement);
      })
      .map(c => c.className);
    
    // Keep all existing component imports that have corresponding import statements
    const validExistingComponents = existingComponents.filter(comp => {
      // Keep base imports
      if (baseComponentImports.includes(comp)) {
        return true;
      }
      // Keep any component that has a valid import statement (don't remove existing super components)
      const hasImport = content.includes(`import { ${comp} } from`);
      return hasImport;
    });
    
    // Combine (remove duplicates and invalid components)
    const allComponentImports = [
      ...baseComponentImports,
      ...validExistingComponents.filter(c => !baseComponentImports.includes(c)),
      ...superComponentClasses
    ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
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
  
  // Filter out super components that don't have files
  const validSuperComponents = superComponents.filter(comp => componentExists(comp.id));
  
  // Find the switch statement for super components
  const switchStartMarker = '<!-- Super Component Rendering -->';
  const switchStart = content.indexOf(switchStartMarker);
  
  if (switchStart === -1) {
    console.error('❌ Could not find "Super Component Rendering" comment');
    return false;
  }
  
  const switchStartIndex = content.indexOf('@switch (element.type) {', switchStart);
  
  if (switchStartIndex === -1) {
    console.error('❌ Could not find @switch statement');
    return false;
  }
  
  // Find the closing brace of the switch statement
  let braceCount = 0;
  let switchEndIndex = switchStartIndex;
  let inSwitch = false;
  
  for (let i = switchStartIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      inSwitch = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (inSwitch && braceCount === 0) {
        switchEndIndex = i + 1;
        break;
      }
    }
  }
  
  // Build case statements for all valid super components
  const allCases = [];
  validSuperComponents.forEach(comp => {
    allCases.push(`              @case ('${comp.id}') {
                <${comp.selector} variant="1"></${comp.selector}>
              }`);
  });
  
  // Rebuild the switch statement
  const beforeSwitch = content.substring(0, switchStartIndex);
  const switchHeader = '            @switch (element.type) {';
  const afterSwitch = content.substring(switchEndIndex);
  
  // If no valid super components, keep the switch empty with just a comment
  if (allCases.length === 0) {
    content = beforeSwitch + switchHeader + '\n              <!-- No super components -->\n            }' + afterSwitch;
  } else {
    content = beforeSwitch + switchHeader + '\n' + allCases.join('\n') + '\n            }' + afterSwitch;
  }
  
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
