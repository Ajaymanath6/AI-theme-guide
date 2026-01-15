const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4202;

// Enable CORS for Angular app
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Component Helper is running' });
});

// Generate component endpoint
app.post('/generate', (req, res) => {
  const { componentId } = req.body;

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

    res.json({ 
      success: true, 
      message: `Component ${componentId} created successfully`,
      output: stdout,
      componentPath: `src/app/components/${componentId}/`,
      files: [
        `${componentId}.component.ts`,
        `${componentId}.component.html`,
        `${componentId}.component.scss`
      ]
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✨ Component Helper Server Running`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🎯 Ready to generate Angular components!\n`);
  console.log(`💡 Keep this running while using the component canvas.\n`);
});
