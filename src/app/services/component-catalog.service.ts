import { Injectable } from '@angular/core';

export interface CatalogEntry {
  id: string;
  displayName: string;
  category: string;
  description: string;
  htmlSelector: string;
  status: 'active';
  registeredAt: string;
}

export interface ComponentCatalog {
  catalogId: string;
  version: string;
  lastUpdated: string;
  registeredComponents: { [key: string]: CatalogEntry };
}

@Injectable({
  providedIn: 'root'
})
export class ComponentCatalogService {
  private readonly STORAGE_KEY = 'component-catalog';
  private catalog: Map<string, CatalogEntry> = new Map();

  constructor() {
    this.loadCatalog();
  }

  /**
   * Load catalog from localStorage
   */
  private loadCatalog(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data: ComponentCatalog = JSON.parse(stored);
        Object.entries(data.registeredComponents || {}).forEach(([id, entry]) => {
          this.catalog.set(id, entry);
        });
        console.log('Catalog loaded:', this.catalog.size, 'components');
      }
    } catch (error) {
      console.error('Failed to load catalog from localStorage:', error);
    }
  }

  /**
   * Save catalog to localStorage
   */
  private saveCatalog(): void {
    try {
      const catalogData: ComponentCatalog = {
        catalogId: 'design-system-v1',
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        registeredComponents: Object.fromEntries(this.catalog)
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(catalogData, null, 2));
      console.log('Catalog saved:', this.catalog.size, 'components');
    } catch (error) {
      console.error('Failed to save catalog to localStorage:', error);
    }
  }

  /**
   * Check if a component is registered in the catalog
   */
  isInCatalog(componentId: string): boolean {
    return this.catalog.has(componentId);
  }

  /**
   * Register a component in the catalog
   */
  registerComponent(entry: CatalogEntry): void {
    this.catalog.set(entry.id, entry);
    this.saveCatalog();
  }

  /**
   * Unregister a component from the catalog
   */
  unregisterComponent(componentId: string): boolean {
    const existed = this.catalog.delete(componentId);
    if (existed) {
      this.saveCatalog();
    }
    return existed;
  }

  /**
   * Get a component entry from the catalog
   */
  getComponent(componentId: string): CatalogEntry | undefined {
    return this.catalog.get(componentId);
  }

  /**
   * Get all registered components
   */
  getAllComponents(): CatalogEntry[] {
    return Array.from(this.catalog.values());
  }

  /**
   * Get catalog as JSON (for export/AI consumption)
   */
  getCatalogAsJson(): ComponentCatalog {
    return {
      catalogId: 'design-system-v1',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      registeredComponents: Object.fromEntries(this.catalog)
    };
  }

  /**
   * Clear all components from catalog
   */
  clearCatalog(): void {
    this.catalog.clear();
    this.saveCatalog();
  }
}
