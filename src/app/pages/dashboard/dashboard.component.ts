import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SuperComponentComponent } from '../../components/super-component/super-component.component';
import { AppSecondaryButtonVariantsComponent } from '../../components/app-secondary-button-variants/app-secondary-button-variants.component';
declare var initFlowbite: () => void;

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, SidebarComponent, SuperComponentComponent, AppSecondaryButtonVariantsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements AfterViewInit {
  projectId: string | null = null;
  
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
}
