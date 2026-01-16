import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { ComponentCatalogService, CatalogEntry } from '../../services/component-catalog.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
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
  imports: [CommonModule, DragDropModule, RouterLink, FormsModule, SidebarComponent],
  templateUrl: './components-canvas.component.html',
  styleUrl: './components-canvas.component.scss'
})
export class ComponentsCanvasComponent implements AfterViewInit {
  canvasElements: CanvasElement[] = [
    { id: 'header1', type: 'header', x: 0, y: 0, content: 'Header' },
    { id: 'sidebar1', type: 'sidebar', x: 0, y: 60, content: 'Sidebar', isSharedComponent: true },
    { id: 'card1', type: 'card1', x: 50, y: 50, content: 'Card Title One' },
    { id: 'card2', type: 'card2', x: 400, y: 50, content: 'Card Title Two' },];

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
      
      // Then sync any components that have files but aren't marked as shared
      const needsSync = this.syncCatalogToLocalStorage();
      
      // Only export if we added new components during sync
      if (needsSync) {
        console.log('💾 Synced new shared components, updating catalog file...');
        await this.exportCatalog();
      }
      
      // Finally, apply shared status to canvas elements
      this.canvasElements.forEach(element => {
        const catalogEntry = this.catalogService.getComponent(element.type);
        if (catalogEntry && catalogEntry.isSharedComponent) {
          element.isSharedComponent = true;
        }
      });
      console.log('✓ Shared component status loaded from catalog');
      this.cdr.detectChanges();
    } catch (error) {
      console.warn('Could not load catalog from JSON, using localStorage:', error);
      // Fallback: just sync from localStorage
      this.syncCatalogToLocalStorage();
      this.canvasElements.forEach(element => {
        const catalogEntry = this.catalogService.getComponent(element.type);
        if (catalogEntry && catalogEntry.isSharedComponent) {
          element.isSharedComponent = true;
        }
      });
      this.cdr.detectChanges();
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

  // ============================================
  // Super Component Methods
  // ============================================

  /**
   * Open super component creation dialog
   */
  makeSuperComponent(componentId: string): void {
    // Get all shared components
    this.availableSharedComponents = this.catalogService.getAllComponents()
      .filter(c => c.isSharedComponent && !c.isSuperComponent);

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
   */
  private updateSuperComponentName(): void {
    if (this.selectedComponentsForSuper.length === 0) {
      this.superComponentName = '';
      return;
    }

    // Extract common prefix
    const first = this.selectedComponentsForSuper[0];
    const prefix = first.replace(/\d+$/, ''); // Remove trailing numbers
    
    // Check if all selected have same prefix
    const allSamePrefix = this.selectedComponentsForSuper.every(id => 
      id.startsWith(prefix)
    );

    if (allSamePrefix) {
      this.superComponentName = `app-${prefix}`;
    } else {
      this.superComponentName = 'app-super-component';
    }
  }

  /**
   * Cancel super component creation
   */
  cancelSuperComponentCreation(): void {
    this.showSuperComponentDialog = false;
    this.selectedComponentsForSuper = [];
    this.superComponentName = '';
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
      const componentId = this.superComponentName.replace('app-', '');

      // Step 1: Generate component files via helper
      const response = await fetch('http://localhost:4202/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create super component');
      }

      // Step 2: Generate super component code
      await this.generateSuperComponentCode(componentId);

      // Step 3: Register in catalog
      const entry: CatalogEntry = {
        id: componentId,
        displayName: this.getDisplayName(componentId),
        category: 'super-components',
        description: `Super component wrapping: ${this.selectedComponentsForSuper.join(', ')}`,
        htmlSelector: `app-${componentId}`,
        status: 'active',
        registeredAt: new Date().toISOString(),
        isSuperComponent: true,
        wraps: [...this.selectedComponentsForSuper],
        variants: this.selectedComponentsForSuper.map((id, idx) => (idx + 1).toString()),
        componentPath: `src/app/components/${componentId}/${componentId}.component.ts`,
        componentTag: `<app-${componentId}></app-${componentId}>`
      };

      this.catalogService.registerComponent(entry);

      // Step 4: Export catalog
      await this.exportCatalog();

      // Step 5: Close dialog
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
   */
  private async generateSuperComponentCode(componentId: string): Promise<void> {
    // Generate TypeScript
    const tsCode = this.generateSuperComponentTS(componentId);
    const htmlCode = this.generateSuperComponentHTML(componentId);

    console.log('📝 Generated TypeScript:', tsCode);
    console.log('📝 Generated HTML:', htmlCode);

    // Note: In production, you'd write these to files
    // For now, log instructions for manual copy-paste
    this.showToast(
      `📝 Copy the generated code from console:\n\n` +
      `1. Open: src/app/components/${componentId}/${componentId}.component.ts\n` +
      `2. Open: src/app/components/${componentId}/${componentId}.component.html\n` +
      `3. Replace with generated code from console`
    );
  }

  /**
   * Generate super component TypeScript code
   */
  private generateSuperComponentTS(componentId: string): string {
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
  selector: 'app-${componentId}',
  imports: [CommonModule, ${importsList}],
  templateUrl: './${componentId}.component.html',
  styleUrl: './${componentId}.component.scss'
})
export class ${this.toClassName(componentId)} {
  variant = input<${this.toClassName(componentId)}Variant>('1');
  disabled = input<boolean>(false);
}`;
  }

  /**
   * Generate super component HTML code
   */
  private generateSuperComponentHTML(componentId: string): string {
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
      'card1': 'Primary Content Card',
      'card2': 'Action Card',
      'card3': 'Compact Card',
      'card4': 'Dual Subheading Card',
      'card5': 'Image Card',
      'card6': 'Hero Profile Card',
      'sidebar': 'Navigation Sidebar',
      'dropdown': 'Action Dropdown Menu'
    };
    return displayNames[componentId] || componentId;
  }

  /**
   * Get category for a component
   */
  private getCategory(componentId: string): string {
    if (componentId.startsWith('card')) return 'cards';
    if (componentId === 'sidebar') return 'navigation';
    if (componentId === 'dropdown') return 'menus';
    return 'general';
  }

  /**
   * Get description for a component
   */
  private getDescription(componentId: string): string {
    const descriptions: Record<string, string> = {
      'card1': 'Card with long paragraph content, primary and secondary action buttons',
      'card2': 'Card with two-line content, primary and primary outline buttons',
      'card3': 'Compact card with single line content, secondary and secondary outline buttons',
      'card4': 'Card with title, subtitle, dual subheadings (left & right), divider, primary and neutral buttons',
      'card5': 'Card with title, subtitle, placeholder image, primary and secondary buttons',
      'card6': 'Card with title, subtitle, divider, hero name (Nisarage), subtitle with paragraph, divider, primary and secondary buttons',
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
      
      // Step 6: Trigger CLI command execution
      await this.executeCliCommand(componentId);

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
  private async executeCliCommand(componentId: string): Promise<void> {
    try {
      console.log(`🚀 Calling component helper service for ${componentId}...`);
      
      // Call the component helper service running on localhost:4202
      const response = await fetch('http://localhost:4202/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ componentId })
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
