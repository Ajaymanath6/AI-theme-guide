import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DragDropModule, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { ComponentCatalogService, CatalogEntry } from '../../services/component-catalog.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { Card3Component } from '../../components/card3/card3.component';
import { Card4Component } from '../../components/card4/card4.component';

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
  imports: [CommonModule, DragDropModule, RouterLink, SidebarComponent, Card3Component, Card4Component],
  templateUrl: './components-canvas.component.html',
  styleUrl: './components-canvas.component.scss'
})
export class ComponentsCanvasComponent implements AfterViewInit {
  canvasElements: CanvasElement[] = [
    { id: 'header1', type: 'header', x: 0, y: 0, content: 'Header' },
    { id: 'sidebar1', type: 'sidebar', x: 0, y: 60, content: 'Sidebar', isSharedComponent: true },
    { id: 'card1', type: 'card1', x: 50, y: 50, content: 'Card Title One' },
    { id: 'card2', type: 'card2', x: 400, y: 50, content: 'Card Title Two' },
    { id: 'card3', type: 'card3', x: 750, y: 50, content: 'Card Title Three' },
    { id: 'card4', type: 'card4', x: 1100, y: 50, content: 'Card Title Four' },
    { id: 'card5', type: 'card5', x: 50, y: 400, content: 'Card Title Five' },
    { id: 'dropdown1', type: 'dropdown', x: 50, y: 300, content: 'Dropdown Component' }
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
  private loadSharedComponentStatus(): void {
    // Sync component-catalog.json data to localStorage if needed
    this.syncCatalogToLocalStorage();
    
    this.canvasElements.forEach(element => {
      const catalogEntry = this.catalogService.getComponent(element.type);
      if (catalogEntry && catalogEntry.isSharedComponent) {
        element.isSharedComponent = true;
      }
    });
    console.log('✓ Shared component status loaded from catalog');
  }

  /**
   * Sync hardcoded catalog data to localStorage
   * This ensures card3 and card4 are marked as shared
   */
  private syncCatalogToLocalStorage(): void {
    // Check if card3 is in catalog and mark as shared if component files exist
    if (this.catalogService.isInCatalog('card3')) {
      const card3Entry = this.catalogService.getComponent('card3');
      if (!card3Entry?.isSharedComponent) {
        const updatedCard3: CatalogEntry = {
          ...card3Entry!,
          isSharedComponent: true,
          componentPath: 'src/app/components/card3/card3.component.ts',
          componentTag: '<app-card3></app-card3>'
        };
        this.catalogService.registerComponent(updatedCard3);
      }
    }

    // Check if card4 is in catalog and mark as shared if component files exist
    if (this.catalogService.isInCatalog('card4')) {
      const card4Entry = this.catalogService.getComponent('card4');
      if (!card4Entry?.isSharedComponent) {
        const updatedCard4: CatalogEntry = {
          id: 'card4',
          displayName: this.getDisplayName('card4'),
          category: this.getCategory('card4'),
          description: this.getDescription('card4'),
          htmlSelector: "[title='card4']",
          status: 'active',
          registeredAt: new Date().toISOString(),
          isSharedComponent: true,
          componentPath: 'src/app/components/card4/card4.component.ts',
          componentTag: '<app-card4></app-card4>'
        };
        this.catalogService.registerComponent(updatedCard4);
      }
    }
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
