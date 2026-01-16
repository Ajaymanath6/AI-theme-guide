import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { ComponentCatalogService, CatalogEntry } from '../../services/component-catalog.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SuperComponentComponent } from '../../components/super-component/super-component.component';
declare var initFlowbite: () => void;

interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  content: string;
  isSharedComponent?: boolean;
}

@Component({
  selector: 'app-components-canvas',
  imports: [CommonModule, DragDropModule, RouterLink, FormsModule, SidebarComponent, SuperComponentComponent],
  templateUrl: './components-canvas.component.html',
  styleUrl: './components-canvas.component.scss'
})
export class ComponentsCanvasComponent implements AfterViewInit {
  canvasElements: CanvasElement[] = [
    { id: 'sidebar1', type: 'sidebar', x: 0, y: 60, content: 'Sidebar', isSharedComponent: true },
    { id: 'primary-button1', type: 'primary-button', x: 50, y: 200, content: 'Primary Button' },
    { id: 'primary-outline-button1', type: 'primary-outline-button', x: 200, y: 200, content: 'Primary Outline Button' },
    { id: 'secondary-button1', type: 'secondary-button', x: 350, y: 200, content: 'Secondary Button' },
    { id: 'secondary-outline-button1', type: 'secondary-outline-button', x: 500, y: 200, content: 'Secondary Outline Button' }
  ];

  isSidebarCollapsed = false;
  activeMenuItem: string | null = null;
  selectedDropdownOption: string | null = null;

  // File System Access API - store directory handle
  private directoryHandle: any = null;

  // Shared component popover state
  showSharedComponentPopover = false;
  selectedComponentForSharing: string | null = null;
  isCreatingComponent = false;

  // Super component dialog state
  showSuperComponentDialog = false;
  selectedComponentsForSuper: string[] = [];
  superComponentName = '';
  isCreatingSuperComponent = false;
  availableSharedComponents: CatalogEntry[] = [];
  superComponentApproach: 'full-component' | 'style-variation' = 'full-component';

  // Canvas pan and zoom state
  canvasPanX = 0;
  canvasPanY = 0;
  canvasZoom = 1;
  isPanning = false;
  panStartX = 0;
  panStartY = 0;
  panStartCanvasX = 0;
  panStartCanvasY = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private catalogService: ComponentCatalogService
  ) {
    // Load shared component status from catalog on init
    this.loadSharedComponentStatus();
  }

  /**
   * Load shared component status from catalog
   * This ensures the status persists across page refreshes
   */
  private async loadSharedComponentStatus(): Promise<void> {
    try {
      // First, try to load catalog from JSON file
      await this.catalogService.loadCatalogFromJson();
      
      // Debug: Log all catalog entries
      const allCatalogEntries = this.catalogService.getAllComponents();
      console.log('📋 All catalog entries:', allCatalogEntries.map(c => ({ id: c.id, isShared: c.isSharedComponent })));
      
      // Then sync any components that have files but aren't marked as shared
      const needsSync = this.syncCatalogToLocalStorage();
      
      // Only export if we added new components during sync
      if (needsSync) {
        console.log('💾 Synced new shared components, updating catalog file...');
        await this.exportCatalog();
      }
      
      // Finally, apply shared status to canvas elements
      console.log('🎨 Canvas elements:', this.canvasElements.map(e => ({ type: e.type, id: e.id })));
      this.canvasElements.forEach(element => {
        const catalogEntry = this.catalogService.getComponent(element.type);
        console.log(`Checking ${element.type}:`, catalogEntry ? { id: catalogEntry.id, isShared: catalogEntry.isSharedComponent } : 'NOT FOUND');
        if (catalogEntry && catalogEntry.isSharedComponent) {
          element.isSharedComponent = true;
          console.log(`✓ Applied shared status to: ${element.type}`);
        } else {
          // Reset if not in catalog as shared
          element.isSharedComponent = false;
          if (catalogEntry) {
            console.log(`⚠️ ${element.type} is in catalog but not marked as shared component`);
          } else {
            console.log(`⚠️ ${element.type} not found in catalog`);
          }
        }
      });
      
      const sharedCount = this.canvasElements.filter(e => e.isSharedComponent).length;
      console.log(`✓ Shared component status loaded from catalog. ${sharedCount} components marked as shared.`);
      console.log('Shared components on canvas:', this.canvasElements.filter(e => e.isSharedComponent).map(e => e.type));
      
      // Load super components to canvas after catalog is loaded
      this.loadSuperComponentsToCanvas();
      
      this.cdr.detectChanges();
    } catch (error) {
      console.warn('Could not load catalog from JSON, using localStorage:', error);
      // Fallback: just sync from localStorage
      this.syncCatalogToLocalStorage();
      this.canvasElements.forEach(element => {
        const catalogEntry = this.catalogService.getComponent(element.type);
        if (catalogEntry && catalogEntry.isSharedComponent) {
          element.isSharedComponent = true;
          console.log(`✓ Applied shared status to: ${element.type} (from localStorage)`);
        } else {
          element.isSharedComponent = false;
        }
      });
      
      const sharedCount = this.canvasElements.filter(e => e.isSharedComponent).length;
      console.log(`✓ Shared component status loaded from localStorage. ${sharedCount} components marked as shared.`);
      
      // Load super components to canvas after catalog is loaded
      this.loadSuperComponentsToCanvas();
      
      this.cdr.detectChanges();
    }
  }

  /**
   * Load super components from catalog and add them to canvas if they don't exist
   */
  private loadSuperComponentsToCanvas(): void {
    try {
      const allComponents = this.catalogService.getAllComponents();
      const superComponents = allComponents.filter(c => c.isSuperComponent === true);
      
      console.log('🔍 Found super components in catalog:', superComponents.map(c => c.id));
      
      superComponents.forEach(superComp => {
        // Check if this super component is already on canvas
        const existsOnCanvas = this.canvasElements.some(e => e.type === superComp.id);
        
        if (!existsOnCanvas) {
          // Calculate position (to the right of existing elements)
          const maxX = this.canvasElements.length > 0 
            ? Math.max(...this.canvasElements.map(e => e.x)) 
            : 0;
          const maxY = this.canvasElements.length > 0 
            ? Math.max(...this.canvasElements.map(e => e.y)) 
            : 0;
          
          // Add super component to canvas
          this.canvasElements.push({
            id: `${superComp.id}1`,
            type: superComp.id,
            x: maxX + 350, // Position to the right
            y: maxY > 0 ? maxY : 300,
            content: superComp.displayName || superComp.id
          });
          
          console.log(`✅ Added super component to canvas: ${superComp.id}`);
        } else {
          console.log(`ℹ️ Super component already on canvas: ${superComp.id}`);
        }
      });
      
      this.cdr.detectChanges();
    } catch (error) {
      console.warn('Could not load super components to canvas:', error);
    }
  }

  /**
   * Sync components that have files to catalog as shared
   * This automatically detects shared components based on file existence
   * Returns true if any components were added/updated
   */
  private syncCatalogToLocalStorage(): boolean {
    // List of components that have been created as shared components
    const sharedComponents = [
      { id: 'sidebar', componentPath: 'src/app/components/sidebar/sidebar.component.ts', componentTag: '<app-sidebar></app-sidebar>' },];

    let hasChanges = false;

    sharedComponents.forEach(({ id, componentPath, componentTag }) => {
      const existingEntry = this.catalogService.getComponent(id);
      
      if (existingEntry) {
        // Update existing entry to mark as shared if not already
        if (!existingEntry.isSharedComponent) {
          const updatedEntry: CatalogEntry = {
            ...existingEntry,
            isSharedComponent: true,
            componentPath,
            componentTag
          };
          this.catalogService.registerComponent(updatedEntry);
          console.log(`✓ Marked ${id} as shared component`);
          hasChanges = true;
        }
      } else {
        // Create new entry for shared component
        const newEntry: CatalogEntry = {
          id,
          displayName: this.getDisplayName(id),
          category: this.getCategory(id),
          description: this.getDescription(id),
          htmlSelector: `[title='${id}']`,
          status: 'active',
          registeredAt: new Date().toISOString(),
          isSharedComponent: true,
          componentPath,
          componentTag
        };
        this.catalogService.registerComponent(newEntry);
        console.log(`✓ Created catalog entry for shared component: ${id}`);
        hasChanges = true;
      }
    });

    return hasChanges;
  }

  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }

  private dragStartPositions = new Map<string, { x: number; y: number }>();
  private dragDeltas = new Map<string, { x: number; y: number }>();

  onDragStarted(element: CanvasElement): void {
    // Store the starting position from the model
    this.dragStartPositions.set(element.id, { x: element.x, y: element.y });
    this.dragDeltas.set(element.id, { x: 0, y: 0 });
  }

  onDragMoved(event: CdkDragMove, element: CanvasElement): void {
    const startPos = this.dragStartPositions.get(element.id);
    if (!startPos) return;

    // Track the current delta
    this.dragDeltas.set(element.id, { x: event.delta.x, y: event.delta.y });

    // Update position in real-time - this keeps element visible during drag
    element.x = startPos.x + event.delta.x;
    element.y = startPos.y + event.delta.y;
  }

  onDragEnded(event: CdkDragEnd, element: CanvasElement): void {
    const startPos = this.dragStartPositions.get(element.id);
    const delta = this.dragDeltas.get(element.id);
    
    if (startPos && delta) {
      // Calculate final position from start + tracked delta
      element.x = startPos.x + delta.x;
      element.y = startPos.y + delta.y;
    }

    // Clean up
    this.dragStartPositions.delete(element.id);
    this.dragDeltas.delete(element.id);
    
    // Force change detection to ensure position updates and element stays visible
    this.cdr.detectChanges();
    
    // Reinitialize Flowbite after drag ends to ensure dropdowns work properly
    if (typeof initFlowbite === 'function') {
      setTimeout(() => {
        initFlowbite();
      }, 0);
    }
  }

  addCard(): void {
    const newCard: CanvasElement = {
      id: Date.now().toString(),
      type: 'card',
      x: 50,
      y: 50,
      content: `Card ${this.canvasElements.length + 1}`
    };
    this.canvasElements.push(newCard);
  }

  addButton(): void {
    const newButton: CanvasElement = {
      id: Date.now().toString(),
      type: 'button',
      x: 50,
      y: 50,
      content: 'New Button'
    };
    this.canvasElements.push(newButton);
  }

  onDropdownOption(event: Event, option: string): void {
    event.preventDefault();
    console.log('Selected option:', option);
    // Add your dropdown option logic here
  }

  onDropdownPrimaryButton(elementId: string): void {
    console.log('Primary button clicked for dropdown:', elementId);
    // Add your primary button logic here
  }

  onDropdownNeutralButton(elementId: string): void {
    console.log('Neutral button clicked for dropdown:', elementId);
    // Add your neutral button logic here
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    // Reinitialize Flowbite after sidebar toggle
    if (typeof initFlowbite === 'function') {
      setTimeout(() => {
        initFlowbite();
      }, 0);
    }
  }

  onMenuItemClick(item: string): void {
    this.activeMenuItem = item;
    console.log('Menu item clicked:', item);
    // Add your menu item logic here
  }

  onSidebarDropdownOption(event: Event, option: string): void {
    event.preventDefault();
    this.selectedDropdownOption = option;
    console.log('Sidebar dropdown option selected:', option);
    // Add your dropdown option logic here
  }

  // ============================================
  // Component Catalog Methods (Phase 2)
  // ============================================

  /**
   * Copy component ID to clipboard
   */
  copyToClipboard(componentId: string): void {
    navigator.clipboard.writeText(componentId).then(() => {
      this.showToast(`✓ Copied "${componentId}" to clipboard`);
      console.log('Copied to clipboard:', componentId);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      this.showToast('Failed to copy to clipboard');
    });
  }

  /**
   * Copy component tag to clipboard (for shared components)
   */
  copyComponentTag(componentId: string): void {
    const componentTag = `<app-${componentId}></app-${componentId}>`;
    navigator.clipboard.writeText(componentTag).then(() => {
      this.showToast(`✓ Copied "${componentTag}" to clipboard`);
      console.log('Copied component tag to clipboard:', componentTag);
    }).catch(err => {
      console.error('Failed to copy component tag:', err);
      this.showToast('Failed to copy component tag');
    });
  }

  /**
   * Delete a shared component (files, catalog, canvas)
   */
  async deleteSharedComponent(componentId: string): Promise<void> {
    const confirmed = confirm(
      `⚠️ Delete ${componentId}?\n\n` +
      `This will:\n` +
      `• Delete component files from disk\n` +
      `• Remove from catalog\n` +
      `• Remove from canvas\n\n` +
      `This action cannot be undone!`
    );

    if (!confirmed) return;

    try {
      // Step 1: Call helper service to delete files
      const response = await fetch('http://localhost:4202/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete component');
      }

      // Step 2: Remove from catalog
      this.catalogService.unregisterComponent(componentId);

      // Step 3: Remove from canvas
      const index = this.canvasElements.findIndex(el => el.type === componentId);
      if (index !== -1) {
        this.canvasElements.splice(index, 1);
      }

      // Step 4: Export updated catalog
      await this.exportCatalog();

      // Step 5: Force UI update
      this.cdr.detectChanges();

      this.showToast(`✅ ${componentId} deleted successfully!`);
      console.log('✓ Component deleted:', componentId);

    } catch (error) {
      console.error('Error deleting component:', error);
      this.showToast(
        `❌ Failed to delete component.\n\n` +
        `Make sure component-helper is running:\n` +
        `npm run component-helper`
      );
    }
  }

  /**
   * Delete a super component (keep wrapped components)
   */
  async deleteSuperComponent(componentId: string): Promise<void> {
    const superInfo = this.getSuperComponentInfo(componentId);
    
    const confirmed = confirm(
      `⚠️ Delete super component: ${componentId}?\n\n` +
      `This will:\n` +
      `• Delete super component files from disk\n` +
      `• Remove from catalog\n` +
      `• Keep wrapped components: ${superInfo?.wraps.join(', ')}\n\n` +
      `This action cannot be undone!`
    );

    if (!confirmed) return;

    try {
      // Step 1: Call helper service to delete files
      const response = await fetch('http://localhost:4202/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete super component');
      }

      // Step 2: Remove from catalog
      this.catalogService.unregisterComponent(componentId);

      // Step 3: Remove from canvasElements array (only the super component, not wrapped components)
      this.canvasElements = this.canvasElements.filter(e => e.type !== componentId);

      // Step 4: Export updated catalog
      await this.exportCatalog();

      // Step 5: Force UI update
      this.cdr.detectChanges();

      this.showToast(
        `✅ Super component deleted!\n\n` +
        `Wrapped components still available:\n` +
        `${superInfo?.wraps.join(', ')}`
      );
      console.log('✓ Super component deleted:', componentId);
      console.log('✓ Wrapped components preserved:', superInfo?.wraps);

    } catch (error) {
      console.error('Error deleting super component:', error);
      this.showToast(
        `❌ Failed to delete super component.\n\n` +
        `Make sure component-helper is running:\n` +
        `npm run component-helper`
      );
    }
  }

  // ============================================
  // Super Component Methods
  // ============================================

  /**
   * Open super component creation dialog
   */
  async makeSuperComponent(componentId: string): Promise<void> {
    // Get all shared components
    const allShared = this.catalogService.getAllComponents()
      .filter(c => c.isSharedComponent && !c.isSuperComponent);

    console.log('🔍 Found shared components in catalog:', allShared.map(c => c.id));

    // Verify component files actually exist
    this.availableSharedComponents = [];
    
    // Check if helper service is available
    let helperServiceAvailable = false;
    try {
      const healthCheck = await fetch('http://localhost:4202/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      helperServiceAvailable = healthCheck.ok;
      console.log('✅ Helper service is available');
    } catch (error) {
      console.warn('⚠️ Helper service not available. Showing all catalog components without file verification.');
      helperServiceAvailable = false;
    }

    for (const component of allShared) {
      if (helperServiceAvailable) {
        // Check if component directory exists
        try {
          const exists = await this.checkComponentExists(component.id);
          if (exists) {
            this.availableSharedComponents.push(component);
            console.log(`✅ Component ${component.id} verified - files exist`);
          } else {
            // Component in catalog but files don't exist - don't remove, just skip for now
            console.warn(`⚠️ Component ${component.id} in catalog but file check returned false. Still showing in list.`);
            // Still add it to the list - user can decide
            this.availableSharedComponents.push(component);
          }
        } catch (error) {
          // If check fails, still show the component
          console.warn(`⚠️ Error checking ${component.id}, showing anyway:`, error);
          this.availableSharedComponents.push(component);
        }
      } else {
        // Helper service not available - show all components from catalog
        this.availableSharedComponents.push(component);
        console.log(`📋 Showing ${component.id} from catalog (file check skipped)`);
      }
    }

    console.log('📦 Available shared components for super component:', this.availableSharedComponents.map(c => c.id));

    // Pre-select components with same prefix
    const prefix = componentId.replace(/\d+$/, ''); // Remove trailing numbers
    this.selectedComponentsForSuper = this.availableSharedComponents
      .filter(c => c.id.startsWith(prefix))
      .map(c => c.id);

    // Auto-generate super component name
    this.updateSuperComponentName();

    this.showSuperComponentDialog = true;
  }

  /**
   * Check if component files exist
   */
  private async checkComponentExists(componentId: string): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:4202/check-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId })
      });
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Error checking component:', error);
      return false;
    }
  }

  /**
   * Toggle component selection
   */
  toggleSuperComponentSelection(componentId: string): void {
    const index = this.selectedComponentsForSuper.indexOf(componentId);
    if (index === -1) {
      this.selectedComponentsForSuper.push(componentId);
    } else {
      this.selectedComponentsForSuper.splice(index, 1);
    }
    this.updateSuperComponentName();
  }

  /**
   * Update super component name based on selection
   * RULE: ALL super components MUST start with "app-" prefix
   * IMPORTANT: Super components must have unique names that don't conflict with existing shared components
   * Examples:
   * - Buttons: "secondary-button" + "secondary-outline-button" -> "app-secondary-button-variants"
   * - Any UI: "sidebar" + "header" -> "app-sidebar-variants" (or based on first component)
   */
  private updateSuperComponentName(): void {
    if (this.selectedComponentsForSuper.length === 0) {
      this.superComponentName = '';
      return;
    }

    const first = this.selectedComponentsForSuper[0];
    let baseName = '';
    
    // For button components, extract the base button name
    // e.g., "secondary-button" and "secondary-outline-button" -> "secondary-button"
    const allAreButtons = this.selectedComponentsForSuper.every(id => 
      id.endsWith('-button')
    );

    if (allAreButtons) {
      // Find the base button name (the one without "-outline-")
      const baseButton = this.selectedComponentsForSuper.find(id => 
        !id.includes('-outline-')
      ) || first;
      
      // Remove "-outline-" if present to get base name
      baseName = baseButton.replace(/-outline-button$/, '-button');
      
      // Ensure it ends with "-button"
      if (!baseName.endsWith('-button')) {
        baseName = first.replace(/-outline-button$/, '-button');
      }
    } else {
      // For non-button components, use common prefix logic
      const prefix = first.replace(/\d+$/, ''); // Remove trailing numbers
      
      // Check if all selected have same prefix
      const allSamePrefix = this.selectedComponentsForSuper.every(id => 
        id.startsWith(prefix)
      );

      if (allSamePrefix) {
        baseName = prefix;
      } else {
        // Try to find common base name
        const parts = first.split('-');
        if (parts.length > 1) {
          const base = parts[0];
          const allShareBase = this.selectedComponentsForSuper.every(id => 
            id.startsWith(base + '-')
          );
          
          if (allShareBase) {
            baseName = first;
          } else {
            baseName = first;
          }
        } else {
          baseName = first;
        }
      }
    }
    
    // CRITICAL RULE: Always ensure super component name starts with "app-"
    // Remove any existing "app-" prefix to avoid duplication, then add it
    let cleanName = baseName.startsWith('app-') ? baseName.replace(/^app-/, '') : baseName;
    
    // IMPORTANT: Check if a component with this name already exists (shared or super)
    // If it exists, append "-variants" to make it unique
    const proposedName = `app-${cleanName}`;
    const componentId = cleanName;
    const existingComponent = this.catalogService.getComponent(componentId);
    
    if (existingComponent && (existingComponent.isSharedComponent || existingComponent.isSuperComponent)) {
      // Component already exists, append "-variants" to make it unique
      cleanName = `${cleanName}-variants`;
      console.log(`⚠️ Component ${componentId} already exists. Using unique name: app-${cleanName}`);
    }
    
    // RULE: Super component names must start with "app-" prefix
    // The componentId (folder name) will be the full name with "app-" prefix
    // Example: "app-secondary-button-variants" (not "secondary-button-variants")
    this.superComponentName = `app-${cleanName}`;
  }

  /**
   * Cancel super component creation
   */
  cancelSuperComponentCreation(): void {
    this.showSuperComponentDialog = false;
    this.selectedComponentsForSuper = [];
    this.superComponentName = '';
    this.superComponentApproach = 'full-component';
  }

  /**
   * Confirm and create super component
   */
  async confirmCreateSuperComponent(): Promise<void> {
    if (this.selectedComponentsForSuper.length < 2) {
      this.showToast('⚠️ Select at least 2 components to create a super component');
      return;
    }

    this.isCreatingSuperComponent = true;

    try {
      // Check if helper service is running
      try {
        const healthCheck = await fetch('http://localhost:4202/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        if (!healthCheck.ok) {
          throw new Error('Helper service not responding');
        }
      } catch (error) {
        throw new Error('Component helper service is not running. Please start it with: npm run component-helper');
      }

      // RULE: Super component folder names start with "app-" prefix
      // Example: "app-secondary-button-variants" (folder name includes "app-")
      const componentId = this.superComponentName; // Keep "app-" prefix for folder name

      // Step 1: Generate component files via helper
      // If component already exists, we'll skip generation and just write the code
      try {
        const response = await fetch('http://localhost:4202/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentId })
        });

        if (!response.ok) {
          const errorText = await response.text();
          // If component already exists or has merge conflict, continue anyway (we'll just write the code)
          if (response.status === 500 && (errorText.includes('already exists') || errorText.includes('merge conflict'))) {
            console.log('Component already exists or has conflicts, skipping generation and writing code directly');
          } else {
            throw new Error(`Helper service error (${response.status}): ${errorText || 'Make sure component-helper is running (npm run component-helper)'}`);
          }
        } else {
          const result = await response.json();
          if (!result.success) {
            // If component already exists, continue anyway
            if (result.error && (result.error.includes('already exists') || result.error.includes('merge conflict'))) {
              console.log('Component already exists or has conflicts, skipping generation and writing code directly');
            } else {
              throw new Error(result.error || 'Failed to create super component');
            }
          }
        }
      } catch (error: any) {
        // If generation fails due to existing component, continue to write code
        if (error.message && (error.message.includes('already exists') || error.message.includes('merge conflict'))) {
          console.log('Component already exists, skipping generation and writing code directly');
        } else {
          throw error;
        }
      }

      // Step 2: Generate super component code
      const { tsCode, htmlCode } = this.generateSuperComponentCode(componentId);

      // Step 2a: Write TypeScript and HTML to component files via helper
      const writeResponse = await fetch('http://localhost:4202/write-component-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          componentId,
          tsContent: tsCode,
          htmlContent: htmlCode
        })
      });

      if (!writeResponse.ok) {
        if (writeResponse.status === 404) {
          throw new Error(`Component directory not found. Make sure component-helper is running: npm run component-helper`);
        }
        const errorText = await writeResponse.text();
        throw new Error(`Failed to write component code (${writeResponse.status}): ${errorText}`);
      }

      const writeResult = await writeResponse.json();
      if (!writeResult.success) {
        throw new Error(writeResult.error || 'Failed to write super component code');
      }
      
      console.log('✅ Super component code written successfully!');

      // Step 3: Register in catalog
      const approachDescription = this.superComponentApproach === 'style-variation' 
        ? 'Style variation super component' 
        : 'Full component wrapping super component';
      const entry: CatalogEntry = {
        id: componentId,
        displayName: this.getDisplayName(componentId),
        category: 'super-components',
        description: `${approachDescription} wrapping: ${this.selectedComponentsForSuper.join(', ')}`,
        htmlSelector: componentId, // componentId already includes "app-" prefix
        status: 'active',
        registeredAt: new Date().toISOString(),
        isSuperComponent: true,
        wraps: [...this.selectedComponentsForSuper],
        variants: this.selectedComponentsForSuper.map((id, idx) => (idx + 1).toString()),
        componentPath: `src/app/components/${componentId}/${componentId}.component.ts`,
        componentTag: componentId.startsWith('app-') ? `<${componentId}></${componentId}>` : `<app-${componentId}></app-${componentId}>`
      };

      this.catalogService.registerComponent(entry);

      // Step 4: Export catalog
      await this.exportCatalog();

      // Step 5: Add super component to canvas (only if it doesn't already exist)
      // Check if super component already exists on canvas
      const existingSuperComponent = this.canvasElements.find(e => e.type === componentId);
      
      if (!existingSuperComponent) {
        // Find the rightmost position of selected components to place super component
        let maxX = 0;
        let maxY = 0;
        this.selectedComponentsForSuper.forEach(compId => {
          const element = this.canvasElements.find(e => e.type === compId);
          if (element) {
            maxX = Math.max(maxX, element.x);
            maxY = Math.max(maxY, element.y);
          }
        });
        
        // Add super component to canvas (positioned to the right of selected components)
        this.canvasElements.push({
          id: `${componentId}1`,
          type: componentId,
          x: maxX + 300, // Position to the right
          y: maxY,
          content: this.superComponentName
        });
        
        console.log(`✅ Added super component to canvas: ${componentId}`);
      } else {
        console.log(`ℹ️ Super component already on canvas: ${componentId}. Skipping canvas addition.`);
      }

      // Step 6: Close dialog
      this.showSuperComponentDialog = false;
      this.isCreatingSuperComponent = false;

      this.showToast(
        `✅ Super component created!\n\n` +
        `Component: ${this.superComponentName}\n` +
        `Wraps: ${this.selectedComponentsForSuper.join(', ')}\n\n` +
        `Use: <${this.superComponentName} variant="1|2|3"></${this.superComponentName}>`
      );

    } catch (error) {
      console.error('Error creating super component:', error);
      this.isCreatingSuperComponent = false;
      this.showToast('❌ Failed to create super component. Check console for details.');
    }
  }

  /**
   * Generate super component TypeScript and HTML code
   * Returns the generated code for auto-writing to files
   */
  private generateSuperComponentCode(componentId: string): { tsCode: string; htmlCode: string } {
    // Generate TypeScript
    const tsCode = this.generateSuperComponentTS(componentId);
    const htmlCode = this.generateSuperComponentHTML(componentId);

    console.log('📝 Generated TypeScript:', tsCode);
    console.log('📝 Generated HTML:', htmlCode);

    return { tsCode, htmlCode };
  }

  /**
   * Generate super component TypeScript code
   */
  private generateSuperComponentTS(componentId: string): string {
    if (this.superComponentApproach === 'style-variation') {
      // Style-variation: No component imports, only CommonModule
      return `import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ${this.toClassName(componentId)}Variant = ${this.selectedComponentsForSuper.map((_, idx) => `'${idx + 1}'`).join(' | ')};

@Component({
  selector: '${componentId}',
  imports: [CommonModule],
  templateUrl: './${componentId}.component.html',
  styleUrl: './${componentId}.component.scss'
})
export class ${this.toClassName(componentId)} {
  variant = input<${this.toClassName(componentId)}Variant>('1');
  disabled = input<boolean>(false);
}`;
    } else {
      // Full-component: Import all wrapped components
      const imports = this.selectedComponentsForSuper
        .map(id => {
          const className = this.toClassName(id);
          return `import { ${className} } from '../${id}/${id}.component';`;
        })
        .join('\n');

      const importsList = this.selectedComponentsForSuper
        .map(id => this.toClassName(id))
        .join(', ');

      return `import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
${imports}

export type ${this.toClassName(componentId)}Variant = ${this.selectedComponentsForSuper.map((_, idx) => `'${idx + 1}'`).join(' | ')};

@Component({
  selector: '${componentId}',
  imports: [CommonModule, ${importsList}],
  templateUrl: './${componentId}.component.html',
  styleUrl: './${componentId}.component.scss'
})
export class ${this.toClassName(componentId)} {
  variant = input<${this.toClassName(componentId)}Variant>('1');
  disabled = input<boolean>(false);
}`;
    }
  }

  /**
   * Generate super component HTML code
   */
  private generateSuperComponentHTML(componentId: string): string {
    if (this.superComponentApproach === 'style-variation') {
      // Style-variation: Generate button elements with extracted styles
      const cases = this.selectedComponentsForSuper
        .map((id, idx) => {
          const styles = this.extractButtonStyles(id);
          const label = this.getButtonLabel(id);
          
          if (!styles) {
            // Fallback if style not found (shouldn't happen for buttons)
            return `  @case ('${idx + 1}') {
    <button
      type="button"
      [disabled]="disabled()"
      class="border-[1.5px] border-transparent bg-brandcolor-primary text-brandcolor-white hover:bg-brandcolor-primaryhover focus:border-brandcolor-primary active:border-brandcolor-primary active:shadow-button-press disabled:opacity-50 rounded-md px-4 py-2 font-medium shadow-lg">
      ${label}
    </button>
  }`;
          }
          
          return `  @case ('${idx + 1}') {
    <button
      type="button"
      [disabled]="disabled()"
      class="${styles}">
      ${label}
    </button>
  }`;
        })
        .join('\n');

      const defaultStyles = this.extractButtonStyles(this.selectedComponentsForSuper[0]) || 
        'border-[1.5px] border-transparent bg-brandcolor-primary text-brandcolor-white hover:bg-brandcolor-primaryhover focus:border-brandcolor-primary active:border-brandcolor-primary active:shadow-button-press disabled:opacity-50 rounded-md px-4 py-2 font-medium shadow-lg';
      const defaultLabel = this.getButtonLabel(this.selectedComponentsForSuper[0]);

      return `@switch (variant()) {
${cases}
  @default {
    <button
      type="button"
      [disabled]="disabled()"
      class="${defaultStyles}">
      ${defaultLabel}
    </button>
  }
}`;
    } else {
      // Full-component: Generate component tags
      const cases = this.selectedComponentsForSuper
        .map((id, idx) => {
          return `  @case ('${idx + 1}') {
    <app-${id}></app-${id}>
  }`;
        })
        .join('\n');

      return `@switch (variant()) {
${cases}
  @default {
    <app-${this.selectedComponentsForSuper[0]}></app-${this.selectedComponentsForSuper[0]}>
  }
}`;
    }
  }

  /**
   * Convert component ID to class name
   */
  private toClassName(id: string): string {
    return id
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Component';
  }

  /**
   * Check if component is registered in catalog
   */
  isInCatalog(componentId: string): boolean {
    return this.catalogService.isInCatalog(componentId);
  }

  /**
   * Show toast notification (simple alert for now)
   */
  private showToast(message: string): void {
    // TODO: Replace with proper toast notification
    alert(message);
  }

  // ============================================
  // Component Catalog Methods (Phase 4)
  // ============================================

  /**
   * Get display name for a component
   */
  private getDisplayName(componentId: string): string {
    const displayNames: Record<string, string> = {
      'sidebar': 'Navigation Sidebar',
      'dropdown': 'Action Dropdown Menu'
    };
    return displayNames[componentId] || componentId;
  }

  /**
   * Get category for a component
   */
  private getCategory(componentId: string): string {
    if (componentId === 'sidebar') return 'navigation';
    if (componentId === 'dropdown') return 'menus';
    return 'general';
  }

  /**
   * Get description for a component
   */
  private getDescription(componentId: string): string {
    const descriptions: Record<string, string> = {
      'sidebar': 'Collapsible navigation sidebar with logo, dropdown, menu items, and toggle button',
      'dropdown': 'Dropdown menu with header, 5 options, divider, and action buttons (primary & neutral)'
    };
    return descriptions[componentId] || `Component: ${componentId}`;
  }

  /**
   * Add component to catalog
   */
  addToCatalog(componentId: string): void {
    // Create catalog entry with metadata
    const entry: CatalogEntry = {
      id: componentId,
      displayName: this.getDisplayName(componentId),
      category: this.getCategory(componentId),
      description: this.getDescription(componentId),
      htmlSelector: `[title='${componentId}']`,
      status: 'active',
      registeredAt: new Date().toISOString()
    };

    // Register with service
    this.catalogService.registerComponent(entry);

    // Show success notification
    this.showToast(`✓ "${entry.displayName}" registered to catalog`);
    console.log('Component registered:', entry);

    // Force change detection to update badge UI
    this.cdr.detectChanges();
  }

  /**
   * Remove component from catalog
   */
  removeFromCatalog(componentId: string): void {
    const component = this.catalogService.getComponent(componentId);
    const displayName = component ? component.displayName : componentId;

    // Confirm with user
    if (confirm(`Remove "${displayName}" from catalog?`)) {
      const removed = this.catalogService.unregisterComponent(componentId);
      
      if (removed) {
        this.showToast(`✓ "${displayName}" removed from catalog`);
        console.log('Component unregistered:', componentId);
      } else {
        this.showToast(`Component "${displayName}" was not in catalog`);
      }

      // Force change detection to update badge UI
      this.cdr.detectChanges();
    }
  }

  /**
   * Check if component is a shared component
   */
  isSharedComponent(componentId: string): boolean {
    const entry = this.catalogService.getComponent(componentId);
    return entry?.isSharedComponent === true;
  }

  /**
   * Check if component is a super component
   */
  isSuperComponent(componentId: string): boolean {
    const entry = this.catalogService.getComponent(componentId);
    return entry?.isSuperComponent === true;
  }

  /**
   * Get super component info (wraps and variants)
   */
  getSuperComponentInfo(componentId: string): { wraps: string[], variants: string[] } | null {
    const entry = this.catalogService.getComponent(componentId);
    if (entry?.isSuperComponent) {
      return {
        wraps: entry.wraps || [],
        variants: entry.variants || []
      };
    }
    return null;
  }

  /**
   * Make a component shared (convert to reusable Angular component)
   * Shows popover for user confirmation
   */
  makeSharedComponent(componentId: string): void {
    // Special case: sidebar already exists as shared component
    if (componentId === 'sidebar') {
      // Update catalog with shared component metadata
      const entry: CatalogEntry = {
        id: componentId,
        displayName: this.getDisplayName(componentId),
        category: this.getCategory(componentId),
        description: this.getDescription(componentId),
        htmlSelector: `[title='${componentId}']`,
        status: 'active',
        registeredAt: new Date().toISOString(),
        isSharedComponent: true,
        componentPath: `src/app/components/${componentId}/${componentId}.component.ts`,
        componentTag: `<app-${componentId}></app-${componentId}>`
      };
      
      this.catalogService.registerComponent(entry);
      
      // Update canvas element
      const element = this.canvasElements.find(el => el.type === componentId);
      if (element) {
        element.isSharedComponent = true;
      }
      
      // Force change detection to update UI
      this.cdr.detectChanges();
      
      // Show success message
      this.showToast(`✅ ${componentId} is now a shared component!\n\nComponent created at:\nsrc/app/components/${componentId}/\n\nUse it anywhere with:\n<app-${componentId}></app-${componentId}>`);
      console.log('✓ Shared component created:', componentId);
    } else {
      // For other components, show popover for confirmation
      this.selectedComponentForSharing = componentId;
      this.showSharedComponentPopover = true;
    }
  }

  /**
   * Cancel shared component creation
   */
  cancelSharedComponentCreation(): void {
    this.showSharedComponentPopover = false;
    this.selectedComponentForSharing = null;
    this.isCreatingComponent = false;
  }

  /**
   * Extract HTML content for a component from canvas
   */
  private extractComponentHTML(componentId: string): string {
    const htmlTemplates: Record<string, string> = {};

    return htmlTemplates[componentId] || `<p>${componentId} works!</p>`;
  }

  /**
   * Extract button styles for a component
   * Returns the class string for button components, null for non-button components
   */
  private extractButtonStyles(componentId: string): string | null {
    const buttonStyles: Record<string, string> = {
      'primary-button': 'border-[1.5px] border-transparent bg-brandcolor-primary text-brandcolor-white hover:bg-brandcolor-primaryhover focus:border-brandcolor-primary active:border-brandcolor-primary active:shadow-button-press disabled:opacity-50 rounded-md px-4 py-2 font-medium shadow-lg',
      'primary-outline-button': 'border-[1.5px] border-brandcolor-strokelight text-brandcolor-primary bg-brandcolor-white hover:bg-brandcolor-neutralhover active:border-brandcolor-primary active:text-brandcolor-primary active:shadow-button-press disabled:opacity-50 rounded-md px-4 py-2 font-medium',
      'secondary-button': 'border-[1.5px] border-transparent bg-brandcolor-secondary text-brandcolor-white hover:bg-brandcolor-secondaryhover focus:border-brandcolor-secondary active:border-brandcolor-secondary active:shadow-button-press disabled:opacity-50 rounded-md px-4 py-2 font-medium shadow-lg',
      'secondary-outline-button': 'border-[1.5px] border-brandcolor-strokelight text-brandcolor-secondary bg-brandcolor-white hover:bg-brandcolor-neutralhover active:border-brandcolor-secondary active:text-brandcolor-secondary active:shadow-button-press disabled:opacity-50 rounded-md px-4 py-2 font-medium'
    };

    return buttonStyles[componentId] || null;
  }

  /**
   * Get button label text for a component
   */
  private getButtonLabel(componentId: string): string {
    const labels: Record<string, string> = {
      'primary-button': 'Primary',
      'primary-outline-button': 'Primary Outline',
      'secondary-button': 'Secondary',
      'secondary-outline-button': 'Secondary Outline'
    };

    return labels[componentId] || componentId;
  }

  /**
   * Confirm and create shared component
   * This will trigger the component generation workflow
   */
  async confirmCreateSharedComponent(): Promise<void> {
    if (!this.selectedComponentForSharing) return;

    const componentId = this.selectedComponentForSharing;
    this.isCreatingComponent = true;

    try {
      // Step 1: Show info message that CLI command needs to be run
      console.log(`🔄 Creating shared component: ${componentId}`);
      console.log(`📝 Run: ng generate component components/${componentId} --skip-tests`);
      
      // Step 2: Mark as shared and update catalog immediately
      // (Component files will be created by the user running the CLI command)
      const entry: CatalogEntry = {
        id: componentId,
        displayName: this.getDisplayName(componentId),
        category: this.getCategory(componentId),
        description: this.getDescription(componentId),
        htmlSelector: `[title='${componentId}']`,
        status: 'active',
        registeredAt: new Date().toISOString(),
        isSharedComponent: true,
        componentPath: `src/app/components/${componentId}/${componentId}.component.ts`,
        componentTag: `<app-${componentId}></app-${componentId}>`
      };
      
      this.catalogService.registerComponent(entry);
      
      // Step 3: Update canvas element
      const element = this.canvasElements.find(el => el.type === componentId);
      if (element) {
        element.isSharedComponent = true;
      }
      
      // Step 4: Force change detection
      this.cdr.detectChanges();
      
      // Step 5: Close popover and show success with instructions
      this.showSharedComponentPopover = false;
      this.selectedComponentForSharing = null;
      this.isCreatingComponent = false;
      
      // Show success message with next steps
      const message = `✅ ${componentId} marked as shared component!\n\n` +
                     `📝 Next steps:\n` +
                     `1. The CLI command will run automatically\n` +
                     `2. Component files will be created\n` +
                     `3. You can then use <app-${componentId}> anywhere\n\n` +
                     `Component will be created at:\n` +
                     `src/app/components/${componentId}/`;
      
      this.showToast(message);
      console.log('✓ Shared component marked:', componentId);
      console.log('💡 Component tag:', `<app-${componentId}></app-${componentId}>`);
      
      // Step 6: Extract HTML and trigger CLI command execution with HTML content
      const htmlContent = this.extractComponentHTML(componentId);
      await this.executeCliCommand(componentId, htmlContent);

      // Step 7: Automatically save to project file
      console.log('💾 Auto-saving catalog to project file...');
      await this.exportCatalog();
      
    } catch (error) {
      console.error('Error creating shared component:', error);
      this.isCreatingComponent = false;
      this.showToast('❌ Failed to create shared component. Please try again.');
    }
  }

  /**
   * Execute CLI command to generate Angular component via helper service
   */
  private async executeCliCommand(componentId: string, htmlContent?: string): Promise<void> {
    try {
      console.log(`🚀 Calling component helper service for ${componentId}...`);
      if (htmlContent) {
        console.log(`📝 Sending HTML content to be written automatically`);
      }
      
      // Call the component helper service running on localhost:4202
      const response = await fetch('http://localhost:4202/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ componentId, htmlContent })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Component generated successfully!');
        console.log('📁 Files created:', result.files);
        console.log('📍 Location:', result.componentPath);
        
        // Show success notification
        this.showToast(`✅ Component files created successfully!\n\nFiles:\n${result.files.join('\n')}\n\nLocation: ${result.componentPath}`);
      } else {
        console.error('❌ Failed to generate component:', result.error);
        this.showToast(`❌ Failed to generate component:\n${result.error}\n\nMake sure the component helper is running:\nnpm run component-helper`);
      }
      
    } catch (error: any) {
      console.error('❌ Error calling component helper:', error);
      
      // Check if it's a connection error (helper not running)
      if (error.message?.includes('fetch') || error.name === 'TypeError') {
        this.showToast(`❌ Cannot connect to component helper!\n\nPlease start it first:\nnpm run component-helper\n\nThen try again.\n\nMake sure it's running on port 4202.`);
      } else {
        this.showToast(`❌ Error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Save catalog to project using File System Access API
   * First time: Asks for folder permission
   * After that: Automatically saves to the selected folder
   */
  async exportCatalog(): Promise<void> {
    const catalog = this.catalogService.getCatalogAsJson();
    const componentsCount = Object.keys(catalog.registeredComponents).length;

    if (componentsCount === 0) {
      this.showToast('No components registered in catalog. Register some components first!');
      return;
    }

    // Create JSON content
    const jsonString = JSON.stringify(catalog, null, 2);

    try {
      // Check if File System Access API is supported
      if ('showDirectoryPicker' in window) {
        await this.saveWithFileSystemAPI(jsonString, componentsCount);
      } else {
        // Fallback to download for browsers that don't support the API
        this.fallbackDownload(jsonString, componentsCount);
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name === 'AbortError') {
        console.log('User cancelled file save');
      } else {
        console.error('Error saving file:', error);
        // Fallback to download
        this.fallbackDownload(jsonString, componentsCount);
      }
    }
  }

  /**
   * Save file using File System Access API (automatic save to project)
   */
  private async saveWithFileSystemAPI(content: string, componentsCount: number): Promise<void> {
    try {
      // If we don't have a directory handle, ask user to select the project folder
      if (!this.directoryHandle) {
        this.directoryHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents',
        });
        console.log('📁 Project folder selected:', this.directoryHandle.name);
      }

      // Create/overwrite the component-catalog.json file
      const fileHandle = await this.directoryHandle.getFileHandle('component-catalog.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      this.showToast(`✓ Saved ${componentsCount} component(s) to component-catalog.json in your project folder!`);
      console.log('✓ File saved to project automatically');
      console.log('💡 Now you can use @component-catalog.json in AI chat');
    } catch (error) {
      throw error; // Re-throw to be caught by parent
    }
  }

  /**
   * Fallback download method for unsupported browsers
   */
  private fallbackDownload(content: string, componentsCount: number): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'component-catalog.json';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    this.showToast(`✓ Downloaded ${componentsCount} component(s). Save to your project root!`);
    console.log('⚠️ File System Access API not supported, using download fallback');
  }

  // ============================================
  // Canvas Pan & Zoom Methods
  // ============================================

  /**
   * Start panning the canvas (only on background, not on elements)
   */
  onCanvasMouseDown(event: MouseEvent): void {
    // Only pan with left mouse button on canvas background (not on elements)
    if (event.button !== 0) return;
    
    // Check if clicking on canvas background (not on an element)
    const target = event.target as HTMLElement;
    if (!target.classList.contains('canvas-viewport')) return;

    this.isPanning = true;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.panStartCanvasX = this.canvasPanX;
    this.panStartCanvasY = this.canvasPanY;
    
    // Change cursor to grabbing
    document.body.style.cursor = 'grabbing';
    event.preventDefault();
  }

  /**
   * Pan the canvas while dragging
   */
  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;

    const deltaX = event.clientX - this.panStartX;
    const deltaY = event.clientY - this.panStartY;

    this.canvasPanX = this.panStartCanvasX + deltaX;
    this.canvasPanY = this.panStartCanvasY + deltaY;

    event.preventDefault();
  }

  /**
   * Stop panning the canvas
   */
  onCanvasMouseUp(event: MouseEvent): void {
    if (this.isPanning) {
      this.isPanning = false;
      document.body.style.cursor = 'default';
      event.preventDefault();
    }
  }

  /**
   * Get canvas transform style
   */
  getCanvasTransform(): string {
    return `translate(${this.canvasPanX}px, ${this.canvasPanY}px) scale(${this.canvasZoom})`;
  }

  /**
   * Zoom canvas with mouse wheel
   */
  onCanvasWheel(event: WheelEvent): void {
    event.preventDefault();

    // Zoom speed
    const zoomSpeed = 0.001;
    const delta = -event.deltaY * zoomSpeed;
    
    // Calculate new zoom level (min: 0.1, max: 3)
    const newZoom = Math.min(Math.max(this.canvasZoom + delta, 0.1), 3);
    
    // Get mouse position relative to canvas container
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Calculate zoom origin (zoom towards mouse position)
    const zoomPointX = (mouseX - this.canvasPanX) / this.canvasZoom;
    const zoomPointY = (mouseY - this.canvasPanY) / this.canvasZoom;
    
    // Update zoom
    this.canvasZoom = newZoom;
    
    // Adjust pan to keep zoom centered on mouse
    this.canvasPanX = mouseX - zoomPointX * this.canvasZoom;
    this.canvasPanY = mouseY - zoomPointY * this.canvasZoom;
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    const newZoom = Math.min(this.canvasZoom + 0.1, 3);
    this.canvasZoom = newZoom;
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    const newZoom = Math.max(this.canvasZoom - 0.1, 0.1);
    this.canvasZoom = newZoom;
  }

  /**
   * Reset zoom and pan
   */
  resetZoom(): void {
    this.canvasZoom = 1;
    this.canvasPanX = 0;
    this.canvasPanY = 0;
  }

  /**
   * Get zoom percentage for display
   */
  getZoomPercentage(): number {
    return Math.round(this.canvasZoom * 100);
  }
}
