import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { BannerInfoComponent } from '../../components/banner-info/banner-info.component';
import { AccountHeaderComponent } from '../../components/account-header/account-header.component';
import { WelcomeSectionComponent } from '../../components/welcome-section/welcome-section.component';
import { ActivitiesComponent } from '../activities/activities.component';
import { CaseResultsLayoutComponent } from '../layouts/case-results-layout/case-results-layout.component';

declare var initFlowbite: () => void;

@Component({
  selector: 'app-dashboard2',
  imports: [CommonModule, SidebarComponent, BannerInfoComponent, AccountHeaderComponent, WelcomeSectionComponent, ActivitiesComponent, CaseResultsLayoutComponent],
  templateUrl: './dashboard2.component.html',
  styleUrl: './dashboard2.component.scss'
})
export class Dashboard2Component implements AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;
  
  projectId: string | null = null;
  showBetaBanner = true;
  showCaseResults = false;
  currentSearchQuery: string = '';
  isAccountHeaderHidden: boolean = false;
  isBannerHidden: boolean = false;
  isSearchLoading: boolean = false;
  
  // Sidebar state – Home selected when hosting dashboard2
  isSidebarCollapsed = false;
  activeMenuItem: string | null = 'home';
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
    this.currentSearchQuery = query;
    this.isSearchLoading = true;
    
    // Simulate API call - show loading for 2 seconds
    setTimeout(() => {
      this.isSearchLoading = false;
    }, 2000);
    
    // Handle search logic here
    console.log('Search query:', query);
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    
    // Collapse account header when scrolling the main content
    this.isAccountHeaderHidden = scrollTop > 50;
    
    // Hide banner when scrolling (permanently hidden once scrolled)
    if (scrollTop > 50 && !this.isBannerHidden) {
      this.isBannerHidden = true;
    }
  }
}
