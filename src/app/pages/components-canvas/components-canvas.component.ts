import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DragDropModule, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { ComponentCatalogService, CatalogEntry } from '../../services/component-catalog.service';

declare var initFlowbite: () => void;

interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  content: string;
}

@Component({
  selector: 'app-components-canvas',
  imports: [CommonModule, DragDropModule, RouterLink],
  templateUrl: './components-canvas.component.html',
  styleUrl: './components-canvas.component.scss'
})
export class ComponentsCanvasComponent implements AfterViewInit {
  canvasElements: CanvasElement[] = [
    { id: 'header1', type: 'header', x: 0, y: 0, content: 'Header' },
    { id: 'sidebar1', type: 'sidebar', x: 0, y: 60, content: 'Sidebar' },
    { id: 'card1', type: 'card1', x: 50, y: 50, content: 'Card Title One' },
    { id: 'card2', type: 'card2', x: 400, y: 50, content: 'Card Title Two' },
    { id: 'card3', type: 'card3', x: 750, y: 50, content: 'Card Title Three' },
    { id: 'card4', type: 'card4', x: 1100, y: 50, content: 'Card Title Four' },
    { id: 'dropdown1', type: 'dropdown', x: 50, y: 300, content: 'Dropdown Component' }
  ];

  isSidebarCollapsed = false;
  activeMenuItem: string | null = null;
  selectedDropdownOption: string | null = null;

  // File System Access API - store directory handle
  private directoryHandle: any = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private catalogService: ComponentCatalogService
  ) {}

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
}
