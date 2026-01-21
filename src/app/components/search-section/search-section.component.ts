import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-section.component.html',
  styleUrl: './search-section.component.scss'
})
export class SearchSectionComponent {
  selectedSearchType: string = 'Natural language';
  isDropdownOpen: boolean = false;

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
}
