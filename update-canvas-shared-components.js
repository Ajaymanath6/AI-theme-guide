const fs = require('fs');
const path = require('path');

const CANVAS_TS_PATH = path.join(process.cwd(), 'src', 'app', 'pages', 'components-canvas', 'components-canvas.component.ts');
const CANVAS_HTML_PATH = path.join(process.cwd(), 'src', 'app', 'pages', 'components-canvas', 'components-canvas.component.html');

// Check if component file exists
function componentExists(componentId) {
  const componentDir = path.join(process.cwd(), 'src', 'app', 'components', componentId);
  const tsFile = path.join(componentDir, `${componentId}.component.ts`);
  return fs.existsSync(tsFile);
}

// Get component class name from component ID
function getComponentClassName(componentId) {
  return componentId
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Component';
}

// Get component selector from component ID
function getComponentSelector(componentId) {
  return `app-${componentId}`;
}

// Update TypeScript file to add import and add to imports array
function updateTypeScriptFile(componentId) {
  if (!componentExists(componentId)) {
    console.log(`⚠️  Component ${componentId} does not exist, skipping TypeScript update`);
    return false;
  }

  let content = fs.readFileSync(CANVAS_TS_PATH, 'utf8');
  const className = getComponentClassName(componentId);
  const importPath = `../../components/${componentId}/${componentId}.component`;
  const importStatement = `import { ${className} } from '${importPath}';`;

  // Check if import already exists
  if (content.includes(importStatement)) {
    console.log(`✓ Import for ${componentId} already exists`);
  } else {
    // Find where to add import (after other component imports)
    const importEndIndex = content.indexOf('declare var initFlowbite');
    if (importEndIndex === -1) {
      console.error('❌ Could not find import section');
      return false;
    }

    // Add import before declare statement
    content = content.substring(0, importEndIndex) + importStatement + '\n' + content.substring(importEndIndex);
    console.log(`✅ Added import for ${componentId}`);
  }

  // Add to imports array
  const importsArrayRegex = /imports:\s*\[([^\]]+)\]/;
  const match = content.match(importsArrayRegex);
  
  if (match) {
    const existingImports = match[1].split(',').map(s => s.trim());
    
    // Check if already in imports
    if (!existingImports.includes(className)) {
      // Add to imports array
      const newImports = [...existingImports, className].join(', ');
      content = content.replace(importsArrayRegex, `imports: [${newImports}]`);
      console.log(`✅ Added ${className} to imports array`);
    } else {
      console.log(`✓ ${className} already in imports array`);
    }
  }

  fs.writeFileSync(CANVAS_TS_PATH, content, 'utf8');
  console.log('✅ Updated components-canvas.component.ts');
  return true;
}

// Update HTML file to add component rendering with shared component check
function updateHtmlFile(componentId) {
  if (!componentExists(componentId)) {
    console.log(`⚠️  Component ${componentId} does not exist, skipping HTML update`);
    return false;
  }

  let content = fs.readFileSync(CANVAS_HTML_PATH, 'utf8');
  const selector = getComponentSelector(componentId);
  
  // Find the @if block for this component type
  const componentIfRegex = new RegExp(`(@if\\s*\\(element\\.type\\s*===\\s*['"]${componentId}['"]\\)\\s*{)([^}]+)(})`, 's');
  const match = content.match(componentIfRegex);
  
  if (match) {
    const fullMatch = match[0];
    const ifStatement = match[1];
    const existingContent = match[2];
    const closingBrace = match[3];
    
    // Check if already updated with shared component check
    if (existingContent.includes('element.isSharedComponent') && existingContent.includes(selector)) {
      console.log(`✓ HTML for ${componentId} already updated with shared component rendering`);
      return true;
    }
    
    // Replace with new structure that checks for shared component
    const newContent = `${ifStatement}
            @if (element.isSharedComponent) {
              <${selector}></${selector}>
            } @else {
${existingContent}
            }
          ${closingBrace}`;
    
    content = content.replace(fullMatch, newContent);
    console.log(`✅ Updated HTML to use component tag for shared ${componentId}`);
  } else {
    // Component type not found in HTML, might be a new component type
    console.log(`⚠️  Component type ${componentId} not found in canvas HTML, may need manual addition`);
    return false;
  }

  fs.writeFileSync(CANVAS_HTML_PATH, content, 'utf8');
  console.log('✅ Updated components-canvas.component.html');
  return true;
}

// Main function
function updateCanvasForSharedComponent(componentId) {
  console.log(`\n🔄 Updating canvas for shared component: ${componentId}\n`);
  
  if (!fs.existsSync(CANVAS_TS_PATH)) {
    console.error(`❌ Canvas TypeScript file not found: ${CANVAS_TS_PATH}`);
    return false;
  }
  
  if (!fs.existsSync(CANVAS_HTML_PATH)) {
    console.error(`❌ Canvas HTML file not found: ${CANVAS_HTML_PATH}`);
    return false;
  }

  const tsUpdated = updateTypeScriptFile(componentId);
  const htmlUpdated = updateHtmlFile(componentId);
  
  if (tsUpdated && htmlUpdated) {
    console.log(`\n✅ Canvas updated successfully for ${componentId}\n`);
    return true;
  } else {
    console.log(`\n⚠️  Canvas update incomplete for ${componentId}\n`);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  const componentId = process.argv[2];
  if (!componentId) {
    console.error('Usage: node update-canvas-shared-components.js <component-id>');
    process.exit(1);
  }
  updateCanvasForSharedComponent(componentId);
}

module.exports = { updateCanvasForSharedComponent };
