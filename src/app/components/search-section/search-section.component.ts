import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GhostButtonComponent } from '../ghost-button/ghost-button.component';

@Component({
  selector: 'app-search-section',
  standalone: true,
  imports: [CommonModule, FormsModule, GhostButtonComponent],
  templateUrl: './search-section.component.html',
  styleUrl: './search-section.component.scss'
})
export class SearchSectionComponent {
  selectedSearchType: string = 'Natural language';
  isDropdownOpen: boolean = false;
  searchQuery: string = '';

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectSearchType(type: string): void {
    this.selectedSearchType = type;
    this.isDropdownOpen = false;
  }

  getSelectedTypeIcon(): string {
    switch (this.selectedSearchType) {
      case 'Filter':
        return 'tune';
      case 'Advanced':
        return 'settings';
      default:
        return 'psychology';
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      console.log('Search type:', this.selectedSearchType);
      // TODO: Implement actual search logic here
    }
  }

  onClear(): void {
    this.searchQuery = '';
  }
}
