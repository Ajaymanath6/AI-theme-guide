#!/usr/bin/env node

/**
 * Auto-complete Phase 4 when super component is created
 * This script watches for the creation of app-primary-button-variants
 * and automatically updates the dashboard when detected
 */

const fs = require('fs');
const path = require('path');

const COMPONENT_PATH = path.join(__dirname, 'src/app/components/app-primary-button-variants/app-primary-button-variants.component.ts');
const DASHBOARD_TS_PATH = path.join(__dirname, 'src/app/pages/dashboard/dashboard.component.ts');
const DASHBOARD_HTML_PATH = path.join(__dirname, 'src/app/pages/dashboard/dashboard.component.html');
const CANVAS_TS_PATH = path.join(__dirname, 'src/app/pages/components-canvas/components-canvas.component.ts');
const CANVAS_HTML_PATH = path.join(__dirname, 'src/app/pages/components-canvas/components-canvas.component.html');

console.log('👀 Watching for app-primary-button-variants creation...');
console.log('   Create the super component through the canvas UI');
console.log('   This script will automatically update the dashboard when detected\n');

let checkCount = 0;
const maxChecks = 60; // 5 minutes (60 * 5 seconds)

const checkInterval = setInterval(() => {
  checkCount++;
  
  if (fs.existsSync(COMPONENT_PATH)) {
    clearInterval(checkInterval);
    console.log('\n✅ Super component detected!');
    completePhase4();
  } else if (checkCount >= maxChecks) {
    clearInterval(checkInterval);
    console.log('\n⏱️  Timeout: Super component not created within 5 minutes');
    console.log('   Run this script again when ready, or manually complete Phase 4');
    process.exit(0);
  } else {
    // Show progress every 12 checks (1 minute)
    if (checkCount % 12 === 0) {
      console.log(`   Still waiting... (${checkCount * 5}s elapsed)`);
    }
  }
}, 5000); // Check every 5 seconds

function completePhase4() {
  console.log('\n🔄 Phase 4: Updating Dashboard...\n');
  
  try {
    // Step 1: Update dashboard TypeScript
    console.log('1️⃣  Updating dashboard.component.ts...');
    let dashboardTS = fs.readFileSync(DASHBOARD_TS_PATH, 'utf8');
    
    // Replace PrimaryButtonComponent import with PrimaryButtonVariantsComponent
    dashboardTS = dashboardTS.replace(
      /import { PrimaryButtonComponent } from '\.\.\/\.\.\/components\/primary-button\/primary-button\.component';/,
      "import { PrimaryButtonVariantsComponent } from '../../components/app-primary-button-variants/app-primary-button-variants.component';"
    );
    
    // Remove PrimaryOutlineButtonComponent import
    dashboardTS = dashboardTS.replace(
      /import { PrimaryOutlineButtonComponent } from '\.\.\/\.\.\/components\/primary-outline-button\/primary-outline-button\.component';\n/,
      ''
    );
    
    // Update imports array
    dashboardTS = dashboardTS.replace(
      /imports: \[CommonModule, RouterLink, SidebarComponent, AppSecondaryButtonVariantsComponent, PrimaryButtonComponent, PrimaryOutlineButtonComponent\]/,
      'imports: [CommonModule, RouterLink, SidebarComponent, AppSecondaryButtonVariantsComponent, PrimaryButtonVariantsComponent]'
    );
    
    fs.writeFileSync(DASHBOARD_TS_PATH, dashboardTS, 'utf8');
    console.log('   ✅ dashboard.component.ts updated');
    
    // Step 2: Update dashboard HTML
    console.log('2️⃣  Updating dashboard.component.html...');
    let dashboardHTML = fs.readFileSync(DASHBOARD_HTML_PATH, 'utf8');
    
    // Replace app-primary-button with app-primary-button-variants variant="1"
    dashboardHTML = dashboardHTML.replace(
      /<app-primary-button\s+label="Save"\s+\(buttonClick\)="onSave\(\)"\s*>\s*<\/app-primary-button>/,
      `<app-primary-button-variants 
            variant="1"
            label="Save"
            (buttonClick)="onSave()">
          </app-primary-button-variants>`
    );
    
    // Replace app-primary-outline-button with app-primary-button-variants variant="2"
    dashboardHTML = dashboardHTML.replace(
      /<app-primary-outline-button\s+label="Cancel"\s+\(buttonClick\)="onCancel\(\)"\s*>\s*<\/app-primary-outline-button>/,
      `<app-primary-button-variants 
            variant="2"
            label="Cancel"
            (buttonClick)="onCancel()">
          </app-primary-button-variants>`
    );
    
    fs.writeFileSync(DASHBOARD_HTML_PATH, dashboardHTML, 'utf8');
    console.log('   ✅ dashboard.component.html updated');
    
    // Step 3: Update canvas TypeScript
    console.log('3️⃣  Updating components-canvas.component.ts...');
    let canvasTS = fs.readFileSync(CANVAS_TS_PATH, 'utf8');
    
    // Add PrimaryButtonVariantsComponent import if not present
    if (!canvasTS.includes('PrimaryButtonVariantsComponent')) {
      canvasTS = canvasTS.replace(
        /import { AppSecondaryButtonVariantsComponent } from '\.\.\/\.\.\/components\/app-secondary-button-variants\/app-secondary-button-variants\.component';/,
        `import { AppSecondaryButtonVariantsComponent } from '../../components/app-secondary-button-variants/app-secondary-button-variants.component';
import { PrimaryButtonVariantsComponent } from '../../components/app-primary-button-variants/app-primary-button-variants.component';`
      );
      
      // Add to imports array
      canvasTS = canvasTS.replace(
        /imports: \[CommonModule, DragDropModule, RouterLink, FormsModule, SidebarComponent, AppSecondaryButtonVariantsComponent\]/,
        'imports: [CommonModule, DragDropModule, RouterLink, FormsModule, SidebarComponent, AppSecondaryButtonVariantsComponent, PrimaryButtonVariantsComponent]'
      );
      
      fs.writeFileSync(CANVAS_TS_PATH, canvasTS, 'utf8');
      console.log('   ✅ components-canvas.component.ts updated');
    } else {
      console.log('   ℹ️  components-canvas.component.ts already has import');
    }
    
    // Step 4: Update canvas HTML
    console.log('4️⃣  Updating components-canvas.component.html...');
    let canvasHTML = fs.readFileSync(CANVAS_HTML_PATH, 'utf8');
    
    // Add case for app-primary-button-variants if not present
    if (!canvasHTML.includes("@case ('app-primary-button-variants')")) {
      canvasHTML = canvasHTML.replace(
        /(@case \('app-secondary-button-variants'\) \{[\s\S]*?<\/app-secondary-button-variants>\s*\})/,
        `$1
              @case ('app-primary-button-variants') {
                <app-primary-button-variants variant="1"></app-primary-button-variants>
              }`
      );
      
      fs.writeFileSync(CANVAS_HTML_PATH, canvasHTML, 'utf8');
      console.log('   ✅ components-canvas.component.html updated');
    } else {
      console.log('   ℹ️  components-canvas.component.html already has case');
    }
    
    console.log('\n✅ Phase 4 Complete!');
    console.log('\n🎉 All Phases Completed Successfully!\n');
    console.log('📋 Summary:');
    console.log('   ✅ Phase 1: Old component deleted');
    console.log('   ✅ Phase 2: Generation system enhanced');
    console.log('   ✅ Phase 3: Super component created (by you)');
    console.log('   ✅ Phase 4: Dashboard updated automatically');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Test the dashboard buttons');
    console.log('   2. Try enhanced properties: [loading], icon, size, etc.');
    console.log('   3. Check the generated component code');
    console.log('\n💡 Example usage:');
    console.log('   <app-primary-button-variants');
    console.log('     variant="1"');
    console.log('     label="Save"');
    console.log('     size="lg"');
    console.log('     [loading]="isSaving"');
    console.log('     (buttonClick)="onSave()">');
    console.log('   </app-primary-button-variants>\n');
    
  } catch (error) {
    console.error('\n❌ Error during Phase 4:', error.message);
    console.error('   You may need to manually complete the updates');
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Watcher stopped');
  console.log('   Run this script again when ready to complete Phase 4');
  process.exit(0);
});
