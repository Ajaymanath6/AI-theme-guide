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
      case 'Natural language': return 'auto_awesome';
      case 'Filter': return 'search';
      case 'Advanced': return 'account_tree';
      default: return 'auto_awesome';
    }
  }

  getSearchPlaceholder(): string {
    switch (this.searchType) {
      case 'Natural language':
        return 'Use natural language to find your case. Example: "Cases where John Smith is a defendant in California"';
      case 'Filter':
        return 'Add one or more filters to refine your search...';
      case 'Advanced':
        return 'Search using UniCourt\'s advanced query language or open the query builder to construct your search...';
      default:
        return 'Use natural language to find your case. Example: "Cases where John Smith is a defendant in California"';
    }
  }
}
