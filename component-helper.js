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
  if (!fs.existsSync(componentDir)) {
    console.log(`⚠️  Component directory not found: ${componentDir}`);
    return res.status(404).json({ 
      success: false, 
      error: `Component directory not found: ${componentDir}` 
    });
  }

  try {
    // Step 1: Delete the entire component directory
    fs.rmSync(componentDir, { recursive: true, force: true });
    console.log('✅ Component directory deleted successfully!');
    console.log(`   Deleted: ${componentDir}`);

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
      const htmlBlockRegex = new RegExp(`\\s*<!--[^>]*${componentId}[^>]*-->\\s*@if\\s*\\(element\\.type\\s*===\\s*'${componentId}'\\)\\s*{[\\s\\S]*?^\\s*}\\s*\\n?`, 'gm');
      htmlContent = htmlContent.replace(htmlBlockRegex, '');
      
      fs.writeFileSync(canvasHtmlPath, htmlContent, 'utf8');
      console.log('✅ Cleaned up HTML template');
    }

    // Step 4: Clean up references in SCSS
    const canvasScssPath = path.join(process.cwd(), 'src', 'app', 'pages', 'components-canvas', 'components-canvas.component.scss');
    if (fs.existsSync(canvasScssPath)) {
      let scssContent = fs.readFileSync(canvasScssPath, 'utf8');
      
      // Remove app-componentId from selectors
      const scssRegex = new RegExp(`,?\\s*&:hover\\s*>\\s*app-${componentId}\\s*,?|,?\\s*&\\s*>\\s*app-${componentId}\\s*,?`, 'g');
      scssContent = scssContent.replace(scssRegex, '');
      
      fs.writeFileSync(canvasScssPath, scssContent, 'utf8');
      console.log('✅ Cleaned up SCSS styles');
    }

    // Step 5: Search and clean up ALL TypeScript files in the project
    console.log('\n🔍 Searching for references in all TypeScript files...');
    const srcDir = path.join(process.cwd(), 'src');
    const tsFiles = findFilesRecursive(srcDir, ['.ts']);
    const componentClassName = componentId.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Component';
    let tsFilesCleanedCount = 0;
    
    tsFiles.forEach(filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Remove import statement
      const importRegex = new RegExp(`import\\s*{[^}]*${componentClassName}[^}]*}\\s*from\\s*['"][^'"]*/${componentId}/${componentId}\\.component['"];?\\s*\\n?`, 'g');
      if (importRegex.test(content)) {
        content = content.replace(importRegex, '');
        modified = true;
      }
      
      // Remove from imports array (better comma handling)
      // Match: ", ComponentName" or "ComponentName," or ", ComponentName,"
      const importsArrayRegex = new RegExp(`(,\\s*${componentClassName}\\s*(?=,|\\]))|((?<=\\[|,)\\s*${componentClassName}\\s*,)`, 'g');
      if (importsArrayRegex.test(content)) {
        content = content.replace(importsArrayRegex, '');
        modified = true;
      }
      
      if (modified) {
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
      let modified = false;
      
      // Remove <app-componentId></app-componentId> tags
      const componentTagRegex = new RegExp(`<app-${componentId}[^>]*>.*?</app-${componentId}>`, 'gs');
      if (componentTagRegex.test(content)) {
        content = content.replace(componentTagRegex, '');
        modified = true;
      }
      
      // Remove self-closing tags <app-componentId />
      const selfClosingTagRegex = new RegExp(`<app-${componentId}[^>]*/>`, 'g');
      if (selfClosingTagRegex.test(content)) {
        content = content.replace(selfClosingTagRegex, '');
        modified = true;
      }
      
      // Remove @for loops that only contain this component
      const forLoopRegex = new RegExp(`@for\\s*\\([^)]+\\)\\s*{\\s*<app-${componentId}[^>]*>.*?</app-${componentId}>\\s*}`, 'gs');
      if (forLoopRegex.test(content)) {
        content = content.replace(forLoopRegex, '');
        modified = true;
      }
      
      // Remove grid containers that only had this component
      const gridContainerRegex = new RegExp(`<div[^>]*grid[^>]*>\\s*@for\\s*\\([^)]+\\)\\s*{\\s*<app-${componentId}[^>]*>.*?</app-${componentId}>\\s*}\\s*</div>`, 'gs');
      if (gridContainerRegex.test(content)) {
        content = content.replace(gridContainerRegex, '');
        modified = true;
      }
      
      if (modified) {
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

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ Component Helper Server Running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🎯 Ready to generate Angular components!\n`);
  console.log(`💡 Keep this running while using the component canvas.\n`);
});
