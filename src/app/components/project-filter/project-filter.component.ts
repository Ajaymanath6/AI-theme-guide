import { Component, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GhostButtonComponent } from '../ghost-button/ghost-button.component';
import { SelectUsersModalComponent } from '../select-users-modal/select-users-modal.component';

declare var initFlowbite: () => void;

interface AccordionItem {
  label: string;
  count: string;
}

interface AccordionState {
  isLoading: boolean;
  showAll: boolean;
  items: AccordionItem[];
}

interface UserProjectChild {
  name: string;
  count: string;
}

interface UserProjectItem {
  label: string;
  isExpanded: boolean;
  projects: UserProjectChild[];
}

@Component({
  selector: 'app-project-filter',
  imports: [CommonModule, GhostButtonComponent, SelectUsersModalComponent],
  templateUrl: './project-filter.component.html',
  styleUrl: './project-filter.component.scss'
})
export class ProjectFilterComponent implements AfterViewInit {
  // Accordion states
  accordionStates: { [key: string]: AccordionState } = {
    'status': {
      isLoading: false,
      showAll: false,
      items: [
        { label: 'Active', count: '12' },
        { label: 'Inactive', count: '5' },
        { label: 'Archived', count: '3' },
        { label: 'Draft', count: '2' },
        { label: 'Completed', count: '8' }
      ]
    },
    'users': {
      isLoading: false,
      showAll: false,
      items: [
        { label: 'Projects', count: '8' },
        { label: 'User Projects', count: '15' }
      ]
    }
  };

  // User projects tree structure – names match modal list (User Projects children)
  userProjects: UserProjectItem[] = [
    {
      label: 'User Projects',
      isExpanded: false,
      projects: [
        { name: 'Alex Johnson', count: '26' },
        { name: 'Sam Williams', count: '12' },
        { name: 'Jordan Lee', count: '8' },
        { name: 'Taylor Davis', count: '15' },
        { name: 'Morgan Brown', count: '4' },
        { name: 'Casey Miller', count: '7' },
        { name: 'Riley Wilson', count: '3' },
        { name: 'Avery Moore', count: '11' },
        { name: 'Quinn Taylor', count: '5' },
        { name: 'Parker Anderson', count: '9' },
        { name: 'Cameron Thomas', count: '2' },
        { name: 'Drew Jackson', count: '14' },
        { name: 'Blake White', count: '6' },
        { name: 'Skyler Harris', count: '10' },
        { name: 'Jamie Martin', count: '13' },
        { name: 'Dakota Thompson', count: '1' },
        { name: 'Reese Garcia', count: '18' },
        { name: 'Emery Martinez', count: '4' },
        { name: 'Hayden Robinson', count: '7' },
        { name: 'Finley Clark', count: '20' },
        { name: 'River Lewis', count: '16' },
        { name: 'Phoenix Walker', count: '8' },
        { name: 'Harper Hall', count: '22' },
        { name: 'Rowan Young', count: '19' }
      ]
    }
  ];

  getVisibleItems(accordionKey: string): AccordionItem[] {
    const state = this.accordionStates[accordionKey];
    if (!state) return [];
    return state.showAll ? state.items : state.items.slice(0, 4);
  }

  hasMoreItems(accordionKey: string): boolean {
    const state = this.accordionStates[accordionKey];
    if (!state) return false;
    return state.items.length > 4;
  }

  showMore(accordionKey: string): void {
    const state = this.accordionStates[accordionKey];
    if (state) {
      state.showAll = true;
    }
  }

  toggleUserProjects(): void {
    const userProject = this.userProjects[0];
    if (userProject) {
      userProject.isExpanded = !userProject.isExpanded;
    }
  }

  /** Show first 5 user projects in list; "Show more" opens the users modal */
  readonly userProjectsShowCount = 5;
  readonly showMoreButtonFullWidth: boolean = true;
  showUsersModal = signal<boolean>(false);

  getVisibleUserProjects(): UserProjectChild[] {
    const list = this.userProjects[0]?.projects ?? [];
    return list.slice(0, this.userProjectsShowCount);
  }

  hasMoreUserProjects(): boolean {
    const list = this.userProjects[0]?.projects ?? [];
    return list.length > this.userProjectsShowCount;
  }

  openUsersModal(): void {
    this.showUsersModal.set(true);
  }

  closeUsersModal(): void {
    this.showUsersModal.set(false);
  }

  onAccordionClick(accordionKey: string, event: Event): void {
    const state = this.accordionStates[accordionKey];
    if (!state) return;
    
    // Prevent default behavior
    event.preventDefault();
    
    // Get the accordion body element
    const button = event.target as HTMLElement;
    const buttonElement = button.closest('button');
    if (!buttonElement) return;
    
    const targetId = buttonElement.getAttribute('data-accordion-target');
    if (!targetId) return;
    
    const accordionBody = document.querySelector(targetId) as HTMLElement;
    if (!accordionBody) return;
    
    // Get the icon element for rotation
    const icon = buttonElement.querySelector('[data-accordion-icon]') as HTMLElement;
    
    // Check if accordion is currently hidden (will open) or visible (will close)
    const isCurrentlyHidden = accordionBody.classList.contains('hidden');
    
    // Toggle accordion manually (allows multiple to be open)
    if (isCurrentlyHidden) {
      // Opening - show loading spinner for 2 seconds
      accordionBody.classList.remove('hidden');
      buttonElement.setAttribute('aria-expanded', 'true');
      if (icon) {
        icon.style.transform = 'rotate(180deg)';
      }
      
      if (!state.isLoading) {
        state.isLoading = true;
        setTimeout(() => {
          state.isLoading = false;
        }, 2000);
      }
    } else {
      // Closing
      accordionBody.classList.add('hidden');
      buttonElement.setAttribute('aria-expanded', 'false');
      if (icon) {
        icon.style.transform = 'rotate(0deg)';
      }
    }
  }
  
  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }
}
