import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AppSecondaryButtonVariantsComponent } from '../../components/app-secondary-button-variants/app-secondary-button-variants.component';
import { PrimaryButtonVariantsComponent } from '../../components/app-primary-button-variants/app-primary-button-variants.component';
import { BannerInfoComponent } from '../../components/banner-info/banner-info.component';
import { AccountHeaderComponent } from '../../components/account-header/account-header.component';
import { SearchSectionComponent } from '../../components/search-section/search-section.component';
import { CaseResultsLayoutComponent } from '../layouts/case-results-layout/case-results-layout.component';

declare var initFlowbite: () => void;

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, SidebarComponent, AppSecondaryButtonVariantsComponent, PrimaryButtonVariantsComponent, BannerInfoComponent, AccountHeaderComponent, SearchSectionComponent, CaseResultsLayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements AfterViewInit {
  projectId: string | null = null;
  showBetaBanner = true;
  showCaseResults = false;
  
  // Sidebar state
  isSidebarCollapsed = false;
  activeMenuItem: string | null = null;
  selectedDropdownOption: string | null = null;

  constructor(private route: ActivatedRoute) {
    // Get project ID from route params
    this.route.params.subscribe(params => {
      this.projectId = params['id'] || null;
    });
  }

  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
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
  }

  onSidebarDropdownOption(event: Event, option: string): void {
    event.preventDefault();
    this.selectedDropdownOption = option;
    console.log('Sidebar dropdown option selected:', option);
  }

  onSave(): void {
    console.log('Save clicked!');
    // Your save logic here
  }

  onCancel(): void {
    console.log('Cancel clicked!');
    // Your cancel logic here
  }

  onBannerDismiss(): void {
    this.showBetaBanner = false;
  }

  onSearch(query: string): void {
    this.showCaseResults = true;
    // Handle search logic here
    console.log('Search query:', query);
  }
}
