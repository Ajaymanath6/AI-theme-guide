import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var initFlowbite: () => void;

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements AfterViewInit {
  @Input() isSidebarCollapsed: boolean = false;
  @Input() activeMenuItem: string | null = null;
  @Input() selectedDropdownOption: string | null = null;
  @Input() uniqueId: string = 'sidebar';
  
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<string>();
  @Output() dropdownOptionSelect = new EventEmitter<string>();

  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }

  onToggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  onMenuItemClick(item: string, event: Event): void {
    event.preventDefault();
    this.menuItemClick.emit(item);
  }

  onDropdownOptionSelect(event: Event, option: string): void {
    event.preventDefault();
    this.dropdownOptionSelect.emit(option);
  }
}
