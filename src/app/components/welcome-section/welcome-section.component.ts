import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-welcome-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './welcome-section.component.html',
  styleUrl: './welcome-section.component.scss'
})
export class WelcomeSectionComponent {
  searchType = 'Natural language';
  dropdownOpen = false;
  searchQuery = '';

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectSearchType(type: string): void {
    this.searchType = type;
    this.dropdownOpen = false;
  }

  getSearchTypeIcon(): string {
    switch (this.searchType) {
      case 'Filter': return 'tune';
      case 'Advanced': return 'settings';
      default: return 'psychology';
    }
  }
}
