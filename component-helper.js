const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Helper function to recursively find all files with specific extensions
function findFilesRecursive(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and dist directories
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

const app = express();
const PORT = 4202;

// Enable CORS for Angular app
app.use(cors());
app.use(express.json());

// Root endpoint - status page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Component Helper - Running</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #2563eb; margin-top: 0; }
        .status { 
          background: #10b981;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          display: inline-block;
          margin: 10px 0;
        }
        .endpoint {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          font-family: monospace;
        }
        .method {
          color: #059669;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✨ Component Helper Server</h1>
        <div class="status">✅ Running on port ${PORT}</div>
        <p>This is an API server for the Angular Component Canvas.</p>
        <h3>Available Endpoints:</h3>
        <div class="endpoint">
          <span class="method">GET</span> /health - Health check
        </div>
        <div class="endpoint">
          <span class="method">POST</span> /generate - Generate Angular component
        </div>
        <div class="endpoint">
          <span class="method">POST</span> /delete - Delete Angular component
        </div>
        <div class="endpoint">
          <span class="method">POST</span> /write-component-code - Write TypeScript/HTML code to existing component
        </div>
        <div class="endpoint">
          <span class="method">POST</span> /check-component - Check if component exists
        </div>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          💡 Keep this server running while using the component canvas.
        </p>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Component Helper is running' });
});

// Generate component endpoint
app.post('/generate', (req, res) => {
  const { componentId, htmlContent, tsContent } = req.body;

  if (!componentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Component ID is required' 
    });
  }

  // Validate component ID (alphanumeric and dash only)
  if (!/^[a-zA-Z0-9-]+$/.test(componentId)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid component ID. Use only letters, numbers, and dashes.' 
    });
  }

  console.log(`\n🔄 Generating component: ${componentId}`);
  console.log(`📝 Running: ng generate component components/${componentId} --skip-tests\n`);

  // Execute Angular CLI command
  const command = `ng generate component components/${componentId} --skip-tests`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error:', error.message);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: stderr 
      });
    }

    console.log('✅ Component generated successfully!');
    console.log(stdout);

    const componentDir = path.join(process.cwd(), 'src', 'app', 'components', componentId);
    let filesWritten = [];

    // Write TypeScript content if provided
    if (tsContent) {
      const tsFilePath = path.join(componentDir, `${componentId}.component.ts`);
      try {
        fs.writeFileSync(tsFilePath, tsContent, 'utf8');
        console.log('✅ Written TypeScript content to component file');
        filesWritten.push('TypeScript');
      } catch (writeError) {
        console.error('⚠️  Failed to write TypeScript content:', writeError.message);
      }
    }

    // Write HTML content if provided
    if (htmlContent) {
      const htmlFilePath = path.join(componentDir, `${componentId}.component.html`);
      try {
        fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
        console.log('✅ Written HTML content to component file');
        filesWritten.push('HTML');
      } catch (writeError) {
        console.error('⚠️  Failed to write HTML content:', writeError.message);
      }
    }

    // After component is created, update canvas if it's a shared component
    // Note: This will be called automatically when component is marked as shared
    // For now, we'll let the canvas component handle the update via the update script
    
    res.json({ 
      success: true, 
      message: `Component ${componentId} created successfully`,
      output: stdout,
      componentPath: `src/app/components/${componentId}/`,
      htmlWritten: !!htmlContent,
      tsWritten: !!tsContent,
      filesWritten: filesWritten,
      files: [
        `${componentId}.component.ts`,
        `${componentId}.component.html`,
        `${componentId}.component.scss`
      ]
    });
  });
});

// Update canvas for shared component endpoint
app.post('/update-canvas-shared-component', (req, res) => {
  const { componentId } = req.body;
  
  if (!componentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Component ID is required' 
    });
  }

  try {
    const updateScriptPath = path.join(process.cwd(), 'update-canvas-shared-components.js');
    
    console.log(`🔄 Updating canvas for shared component: ${componentId}`);
    
    exec(`node "${updateScriptPath}" "${componentId}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error running update script:', error);
        return res.status(500).json({ 
          success: false, 
          error: error.message,
          stderr: stderr
        });
      }
      
      console.log(stdout);
      res.json({ 
        success: true, 
        message: 'Canvas updated successfully',
        output: stdout
      });
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete component endpoint
app.post('/delete', (req, res) => {
  const { componentId } = req.body;
  
  if (!componentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Component ID is required' 
    });
  }

  console.log(`\n🗑️  Deleting component: ${componentId}`);
  
  // Component directory path
  const componentDir = path.join(process.cwd(), 'src', 'app', 'components', componentId);
  
  // Check if directory exists
  const componentDirExists = fs.existsSync(componentDir);
  if (!componentDirExists) {
    console.log(`⚠️  Component directory not found: ${componentDir}`);
    console.log(`   Proceeding to clean up references only...`);
  }

  try {
    // Step 1: Delete the entire component directory (if it exists)
    if (componentDirExists) {
      fs.rmSync(componentDir, { recursive: true, force: true });
      console.log('✅ Component directory deleted successfully!');
      console.log(`   Deleted: ${componentDir}`);
    } else {
      console.log('ℹ️  No component directory to delete (cleaning up references only)');
    }

    // Step 2: Clean up references in canvas component TypeScript
    const canvasComponentPath = path.join(process.cwd(), 'src', 'app', 'pages', 'components-canvas', 'components-canvas.component.ts');
    if (fs.existsSync(canvasComponentPath)) {
      let tsContent = fs.readFileSync(canvasComponentPath, 'utf8');
      
      // Remove import statement
      const importRegex = new RegExp(`import\\s*{\\s*\\w+Component\\s*}\\s*from\\s*['"].*/${componentId}/${componentId}\\.component['"];?\\s*\\n?`, 'g');
      tsContent = tsContent.replace(importRegex, '');
      
      // Remove from imports array (better comma handling)
      const componentClassName = componentId.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Component';
      const importsArrayRegex = new RegExp(`(,\\s*${componentClassName}\\s*(?=,|\\]))|((?<=\\[|,)\\s*${componentClassName}\\s*,)`, 'g');
      tsContent = tsContent.replace(importsArrayRegex, '');
      
      // Remove from canvasElements array
      const canvasElementRegex = new RegExp(`\\s*{\\s*id:\\s*'${componentId}\\d*'[^}]*}\\s*,?\\s*\\n?`, 'g');
      tsContent = tsContent.replace(canvasElementRegex, '');
      
      // Remove from syncCatalogToLocalStorage sharedComponents array
      const syncRegex = new RegExp(`\\s*{\\s*id:\\s*'${componentId}'[^}]*}\\s*,?\\s*\\n?`, 'g');
      tsContent = tsContent.replace(syncRegex, '');
      
      fs.writeFileSync(canvasComponentPath, tsContent, 'utf8');
      console.log('✅ Cleaned up canvas component TypeScript');
    }

    // Step 3: Clean up references in canvas component HTML
    const canvasHtmlPath = path.join(process.cwd(), 'src', 'app', 'pages', 'components-canvas', 'components-canvas.component.html');
    if (fs.existsSync(canvasHtmlPath)) {
      let htmlContent = fs.readFileSync(canvasHtmlPath, 'utf8');
      
      // Remove the entire @if block for this component (handle both shared and non-shared versions)
      const htmlBlockRegex = new RegExp(`\\s*<!--[^>]*${componentId}[^>]*-->\\s*@if\\s*\\(element\\.type\\s*===\\s*['"]${componentId}['"]\\)\\s*{[\\s\\S]*?^\\s*}\\s*\\n?`, 'gm');
      htmlContent = htmlContent.replace(htmlBlockRegex, '');
      
      // Remove @switch case statements for this component
      const switchCaseRegex = new RegExp(`@case\\s*\\(['"]${componentId}['"]\\)\\s*{[\\s\\S]*?}\\s*`, 'g');
      htmlContent = htmlContent.replace(switchCaseRegex, '');
      
      // Remove component tags
      const componentTagRegex = new RegExp(`<app-${componentId}[^>]*>.*?</app-${componentId}>`, 'gs');
      htmlContent = htmlContent.replace(componentTagRegex, '');
      
      // Remove self-closing tags
      const selfClosingTagRegex = new RegExp(`<app-${componentId}[^>]*/>`, 'g');
      htmlContent = htmlContent.replace(selfClosingTagRegex, '');
      
      // Remove comments referencing this component
      const commentRegex = new RegExp(`<!--[^>]*${componentId}[^>]*-->\\s*`, 'g');
      htmlContent = htmlContent.replace(commentRegex, '');
      
      // Clean up multiple consecutive blank lines (max 2)
      htmlContent = htmlContent.replace(/\n\s*\n\s*\n+/g, '\n\n');
      
      fs.writeFileSync(canvasHtmlPath, htmlContent, 'utf8');
      console.log('✅ Cleaned up canvas HTML template');
    }

    // Step 4: Clean up references in SCSS
    const canvasScssPath = path.join(process.cwd(), 'src', 'app', 'pages', 'components-canvas', 'components-canvas.component.scss');
    if (fs.existsSync(canvasScssPath)) {
      let scssContent = fs.readFileSync(canvasScssPath, 'utf8');
      let originalContent = scssContent;
      
      // Remove app-componentId from selectors (handle variations)
      const variations = [
        componentId,
        componentId.replace(/^app-app-/, 'app-'),
        componentId.replace(/^app-/, ''),
        componentId.replace(/^app-app-/, '')
      ];
      const uniqueVariations = [...new Set(variations)];
      
      uniqueVariations.forEach(variation => {
        // Remove from selectors (handle different patterns)
        const scssRegex = new RegExp(`,?\\s*&:hover\\s*>\\s*app-${variation.replace(/^app-/, '')}\\s*,?|,?\\s*&\\s*>\\s*app-${variation.replace(/^app-/, '')}\\s*,?`, 'g');
        scssContent = scssContent.replace(scssRegex, '');
        
        // Remove entire rules that only reference this component
        const componentRuleRegex = new RegExp(`[^}]*app-${variation.replace(/^app-/, '')}[^}]*{[^}]*}[^}]*`, 'g');
        scssContent = scssContent.replace(componentRuleRegex, '');
      });
      
      // Clean up malformed selectors (comment followed by selector)
      scssContent = scssContent.replace(/\/\/[^\n]*\*\s*{/g, '// Fixed comment\n      * {');
      
      // Clean up empty rules and extra braces
      scssContent = scssContent.replace(/\{\s*\}/g, '');
      scssContent = scssContent.replace(/\n\s*\n\s*\n+/g, '\n\n');
      
      // Validate SCSS structure - ensure braces are balanced
      const openBraces = (scssContent.match(/{/g) || []).length;
      const closeBraces = (scssContent.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        console.warn(`⚠️  SCSS brace mismatch detected: ${openBraces} open, ${closeBraces} close`);
        console.warn('   Attempting to fix...');
        // Try to fix by adding missing closing braces at the end
        const diff = openBraces - closeBraces;
        if (diff > 0) {
          scssContent += '\n' + '}'.repeat(diff);
          console.log('   ✓ Added missing closing braces');
        }
      }
      
      if (scssContent !== originalContent) {
        fs.writeFileSync(canvasScssPath, scssContent, 'utf8');
        console.log('✅ Cleaned up SCSS styles');
      } else {
        console.log('ℹ️  No SCSS changes needed');
      }
    }

    // Step 5: Search and clean up ALL TypeScript files in the project
    console.log('\n🔍 Searching for references in all TypeScript files...');
    const srcDir = path.join(process.cwd(), 'src');
    const tsFiles = findFilesRecursive(srcDir, ['.ts']);
    const componentClassName = componentId.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Component';
    let tsFilesCleanedCount = 0;
    
    tsFiles.forEach(filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Remove import statement (handles single and multiple imports)
      const importRegex = new RegExp(`import\\s*{[^}]*${componentClassName}[^}]*}\\s*from\\s*['"][^'"]*/${componentId}/${componentId}\\.component['"];?\\s*\\n?`, 'g');
      content = content.replace(importRegex, '');
      
      // Remove from imports array in @Component decorator (better comma handling)
      // Match: ", ComponentName" or "ComponentName," or ", ComponentName,"
      const importsArrayRegex = new RegExp(`(,\\s*${componentClassName}\\s*(?=,|\\]))|((?<=\\[|,)\\s*${componentClassName}\\s*,)`, 'g');
      content = content.replace(importsArrayRegex, '');
      
      // Remove switch case statements for this component
      // Match: case 'componentId': ... break;
      const switchCaseRegex = new RegExp(`case\\s*['"]${componentId}['"]\\s*:[\\s\\S]*?break\\s*;`, 'g');
      content = content.replace(switchCaseRegex, '');
      
      // Remove if statements checking for componentId
      const ifComponentRegex = new RegExp(`if\\s*\\([^)]*['"]${componentId}['"][^)]*\\)\\s*{[\\s\\S]*?}\\s*`, 'g');
      content = content.replace(ifComponentRegex, '');
      
      // Remove references in arrays (like canvasElements)
      const arrayElementRegex = new RegExp(`\\s*{\\s*[^}]*type:\\s*['"]${componentId}['"][^}]*}\\s*,?\\s*\\n?`, 'g');
      content = content.replace(arrayElementRegex, '');
      
      // Remove references in object properties
      const objectPropertyRegex = new RegExp(`['"]${componentId}['"]\\s*:\\s*[^,}\\n]+[,}]?`, 'g');
      content = content.replace(objectPropertyRegex, '');
      
      // Clean up multiple consecutive blank lines (max 2)
      content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
      
      // Check if content was modified
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`   ✓ Cleaned: ${path.relative(process.cwd(), filePath)}`);
        tsFilesCleanedCount++;
      }
    });
    
    console.log(`✅ Cleaned ${tsFilesCleanedCount} TypeScript file(s)`);

    // Step 6: Search and clean up ALL HTML files in the project
    console.log('\n🔍 Searching for references in all HTML files...');
    const htmlFiles = findFilesRecursive(srcDir, ['.html']);
    let htmlFilesCleanedCount = 0;
    
    htmlFiles.forEach(filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Remove <app-componentId></app-componentId> tags (with any attributes and content)
      const componentTagRegex = new RegExp(`<app-${componentId}[^>]*>.*?</app-${componentId}>`, 'gs');
      content = content.replace(componentTagRegex, '');
      
      // Remove self-closing tags <app-componentId />
      const selfClosingTagRegex = new RegExp(`<app-${componentId}[^>]*/>`, 'g');
      content = content.replace(selfClosingTagRegex, '');
      
      // Remove @switch case statements for this component
      // Match: @case ('componentId') { ... <app-componentId> ... }
      const switchCaseRegex = new RegExp(`@case\\s*\\(['"]${componentId}['"]\\)\\s*{[\\s\\S]*?}\\s*`, 'g');
      content = content.replace(switchCaseRegex, '');
      
      // Remove @if blocks that check for this component type
      // Match: @if (element.type === 'componentId') { ... }
      const ifBlockRegex = new RegExp(`@if\\s*\\([^)]*element\\.type\\s*===\\s*['"]${componentId}['"][^)]*\\)\\s*{[\\s\\S]*?}\\s*`, 'g');
      content = content.replace(ifBlockRegex, '');
      
      // Remove @if blocks with componentId in condition
      const ifComponentRegex = new RegExp(`@if\\s*\\([^)]*['"]${componentId}['"][^)]*\\)\\s*{[\\s\\S]*?}\\s*`, 'g');
      content = content.replace(ifComponentRegex, '');
      
      // Remove @for loops that only contain this component
      const forLoopRegex = new RegExp(`@for\\s*\\([^)]+\\)\\s*{\\s*<app-${componentId}[^>]*>.*?</app-${componentId}>\\s*}`, 'gs');
      content = content.replace(forLoopRegex, '');
      
      // Remove grid/container divs that only had this component
      const gridContainerRegex = new RegExp(`<div[^>]*>\\s*@for\\s*\\([^)]+\\)\\s*{\\s*<app-${componentId}[^>]*>.*?</app-${componentId}>\\s*}\\s*</div>`, 'gs');
      content = content.replace(gridContainerRegex, '');
      
      // Remove empty @for loops that might have been left behind
      const emptyForRegex = new RegExp(`@for\\s*\\([^)]+\\)\\s*{\\s*}\\s*`, 'g');
      content = content.replace(emptyForRegex, '');
      
      // Remove comments referencing this component
      const commentRegex = new RegExp(`<!--[^>]*${componentId}[^>]*-->\\s*`, 'g');
      content = content.replace(commentRegex, '');
      
      // Clean up multiple consecutive blank lines (max 2)
      content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
      
      // Check if content was modified
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`   ✓ Cleaned: ${path.relative(process.cwd(), filePath)}`);
        htmlFilesCleanedCount++;
      }
    });
    
    console.log(`✅ Cleaned ${htmlFilesCleanedCount} HTML file(s)`);

    res.json({ 
      success: true, 
      message: `Component ${componentId} deleted successfully`,
      deletedPath: componentDir,
      cleanedUp: {
        typescript: tsFilesCleanedCount,
        html: htmlFilesCleanedCount,
        canvas: true,
        scss: true
      }
    });
  } catch (error) {
    console.error('❌ Error deleting component:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Write component code endpoint (for super components or updating existing components)
app.post('/write-component-code', (req, res) => {
  const { componentId, tsContent, htmlContent } = req.body;

  if (!componentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Component ID is required' 
    });
  }

  const componentDir = path.join(process.cwd(), 'src', 'app', 'components', componentId);
  
  if (!fs.existsSync(componentDir)) {
    return res.status(404).json({ 
      success: false, 
      error: `Component directory not found: ${componentDir}` 
    });
  }

  let filesWritten = [];

  // Write TypeScript content if provided
  if (tsContent) {
    const tsFilePath = path.join(componentDir, `${componentId}.component.ts`);
    try {
      fs.writeFileSync(tsFilePath, tsContent, 'utf8');
      console.log(`✅ Written TypeScript content to: ${tsFilePath}`);
      filesWritten.push('TypeScript');
    } catch (writeError) {
      console.error('⚠️  Failed to write TypeScript content:', writeError.message);
      return res.status(500).json({ 
        success: false, 
        error: `Failed to write TypeScript: ${writeError.message}` 
      });
    }
  }

  // Write HTML content if provided
  if (htmlContent) {
    const htmlFilePath = path.join(componentDir, `${componentId}.component.html`);
    try {
      fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
      console.log(`✅ Written HTML content to: ${htmlFilePath}`);
      filesWritten.push('HTML');
    } catch (writeError) {
      console.error('⚠️  Failed to write HTML content:', writeError.message);
      return res.status(500).json({ 
        success: false, 
        error: `Failed to write HTML: ${writeError.message}` 
      });
    }
  }

  res.json({ 
    success: true, 
    message: `Component code written successfully for ${componentId}`,
    filesWritten: filesWritten,
    componentPath: `src/app/components/${componentId}/`
  });
});

// Check if component exists endpoint
app.post('/check-component', (req, res) => {
  const { componentId } = req.body;
  
  if (!componentId) {
    return res.status(400).json({ exists: false });
  }

  const componentDir = path.join(process.cwd(), 'src', 'app', 'components', componentId);
  const exists = fs.existsSync(componentDir);
  
  console.log(`📂 Checking component: ${componentId} - ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  
  res.json({ 
    exists,
    componentId,
    path: componentDir
  });
});

// Read component HTML file endpoint
app.post('/read-component-html', (req, res) => {
  const { componentId } = req.body;
  
  if (!componentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Component ID is required' 
    });
  }

  const componentDir = path.join(process.cwd(), 'src', 'app', 'components', componentId);
  const htmlFilePath = path.join(componentDir, `${componentId}.component.html`);
  
  if (!fs.existsSync(htmlFilePath)) {
    return res.status(404).json({ 
      success: false, 
      error: `Component HTML file not found: ${htmlFilePath}` 
    });
  }

  try {
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    res.json({ 
      success: true, 
      htmlContent: htmlContent,
      componentId: componentId,
      filePath: htmlFilePath
    });
  } catch (error) {
    console.error('❌ Error reading component HTML:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Store file modification times for change detection
const fileModTimes = new Map();

// Check if component file was modified endpoint
app.post('/check-component-modified', (req, res) => {
  const { componentId } = req.body;
  
  if (!componentId) {
    return res.status(400).json({ modified: false });
  }

  const componentDir = path.join(process.cwd(), 'src', 'app', 'components', componentId);
  const htmlFilePath = path.join(componentDir, `${componentId}.component.html`);
  const tsFilePath = path.join(componentDir, `${componentId}.component.ts`);
  
  if (!fs.existsSync(htmlFilePath) && !fs.existsSync(tsFilePath)) {
    return res.json({ modified: false });
  }

  try {
    let modified = false;
    const filesToCheck = [htmlFilePath, tsFilePath].filter(f => fs.existsSync(f));
    
    for (const filePath of filesToCheck) {
      const stats = fs.statSync(filePath);
      const currentModTime = stats.mtime.getTime();
      const key = `${componentId}:${filePath}`;
      
      if (fileModTimes.has(key)) {
        if (fileModTimes.get(key) !== currentModTime) {
          modified = true;
          fileModTimes.set(key, currentModTime);
        }
      } else {
        // First time checking, store the time
        fileModTimes.set(key, currentModTime);
      }
    }
    
    res.json({ 
      modified: modified,
      componentId: componentId
    });
  } catch (error) {
    console.error('Error checking file modification:', error);
    res.json({ modified: false });
  }
});

// Update canvas with super components endpoint
app.post('/update-canvas-super-components', (req, res) => {
  try {
    const { exec } = require('child_process');
    const updateScriptPath = path.join(process.cwd(), 'update-canvas-super-components.js');
    
    console.log('🔄 Running canvas update script...');
    
    exec(`node "${updateScriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error running update script:', error);
        return res.status(500).json({ 
          success: false, 
          error: error.message,
          stderr: stderr
        });
      }
      
      console.log(stdout);
      res.json({ 
        success: true, 
        message: 'Canvas updated successfully',
        output: stdout
      });
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Comprehensive cleanup of ALL references from ALL files
app.post('/cleanup-all-references', (req, res) => {
  const { componentId } = req.body;
  
  if (!componentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Component ID is required' 
    });
  }

  console.log(`\n🧹 Comprehensive cleanup for: ${componentId}`);
  console.log('🔍 Searching ALL files for references...\n');
  
  const cleanedFiles = [];
  const srcDir = path.join(process.cwd(), 'src');
  
  // Generate component class name
  const componentClassName = componentId.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('') + 'Component';
  
  // Handle variations
  const variations = [
    componentId,
    componentId.replace(/^app-app-/, 'app-'),
    componentId.replace(/^app-/, ''),
    componentId.replace(/^app-app-/, '')
  ];
  const uniqueVariations = [...new Set(variations)];
  
  try {
    // Clean up ALL TypeScript files
    const tsFiles = findFilesRecursive(srcDir, ['.ts']);
    tsFiles.forEach(filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Remove import statements (all variations)
      uniqueVariations.forEach(variation => {
        const className = variation.split('-').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join('') + 'Component';
        
        // Remove import line
        const importRegex = new RegExp(`import\\s*{[^}]*${className}[^}]*}\\s*from\\s*['"][^'"]*/${variation}/${variation}\\.component['"];?\\s*\\n?`, 'g');
        content = content.replace(importRegex, '');
        
        // Remove from imports array
        const importsArrayRegex = new RegExp(`(,\\s*${className}\\s*(?=,|\\]))|((?<=\\[|,)\\s*${className}\\s*,)`, 'g');
        content = content.replace(importsArrayRegex, '');
      });
      
      // Remove references in arrays
      uniqueVariations.forEach(variation => {
        const arrayElementRegex = new RegExp(`\\s*{\\s*[^}]*type:\\s*['"]${variation}['"][^}]*}\\s*,?\\s*\\n?`, 'g');
        content = content.replace(arrayElementRegex, '');
      });
      
      // Clean up blank lines
      content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        cleanedFiles.push(path.relative(process.cwd(), filePath));
        console.log(`   ✓ Cleaned: ${path.relative(process.cwd(), filePath)}`);
      }
    });
    
    // Clean up ALL HTML files
    const htmlFiles = findFilesRecursive(srcDir, ['.html']);
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
        
        // Remove @switch case statements
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
        cleanedFiles.push(path.relative(process.cwd(), filePath));
        console.log(`   ✓ Cleaned: ${path.relative(process.cwd(), filePath)}`);
      }
    });
    
    console.log(`\n✅ Cleaned ${cleanedFiles.length} file(s)`);
    
    res.json({ 
      success: true, 
      message: `Cleaned up ${cleanedFiles.length} file(s)`,
      cleanedFiles: cleanedFiles
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ Component Helper Server Running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🎯 Ready to generate Angular components!\n`);
  console.log(`💡 Keep this running while using the component canvas.\n`);
});
