import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GhostButtonComponent } from '../ghost-button/ghost-button.component';

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

@Component({
  selector: 'app-side-filter',
  imports: [CommonModule, GhostButtonComponent],
  templateUrl: './side-filter.component.html',
  styleUrl: './side-filter.component.scss'
})
export class SideFilterComponent implements AfterViewInit {
  // Accordion states
  accordionStates: { [key: string]: AccordionState } = {
    'state': {
      isLoading: false,
      showAll: false,
      items: [
        { label: 'Florida', count: '6M' },
        { label: 'California', count: '4M' },
        { label: 'Texas', count: '3M' },
        { label: 'Ohio', count: '2M' },
        { label: 'New York', count: '2M' }
      ]
    },
    'court-system': {
      isLoading: false,
      showAll: false,
      items: [
        { label: 'Florida County Courts', count: '4M' },
        { label: 'California Superior Courts', count: '3M' },
        { label: 'Florida Circuit Courts', count: '2M' },
        { label: 'Wisconsin Circuit Courts', count: '2M' },
        { label: 'Ohio Court of Common Pleas', count: '1M' }
      ]
    },
    'court': {
      isLoading: false,
      showAll: false,
      items: [
        { label: 'California Superior Courts - Los Angeles County Superior Court', count: '919K' },
        { label: 'Wisconsin Circuit Courts - Milwaukee County Circuit Court', count: '463K' },
        { label: 'Florida County Courts - Pinellas County Court', count: '449K' },
        { label: 'Florida Circuit Courts - Ninth Judicial Circuit', count: '416K' },
        { label: 'Illinois Circuit Courts - 1st Municipal District, Cook County Circuit Court', count: '384K' }
      ]
    },
    'filing-date': {
      isLoading: false,
      showAll: false,
      items: []
    },
    'area-of-law': {
      isLoading: false,
      showAll: false,
      items: [
        { label: 'Commercial and Trade', count: '4M' },
        { label: 'Real Property', count: '4M' },
        { label: 'Personal Injury and Torts', count: '3M' },
        { label: 'Personal and Family', count: '3M' },
        { label: 'Probate', count: '1M' }
      ]
    },
    'case-type-group': {
      isLoading: false,
      showAll: false,
      items: []
    },
    'case-type': {
      isLoading: false,
      showAll: false,
      items: [
        { label: 'Real Property', count: '3M' },
        { label: 'Personal Injury and Torts', count: '2M' },
        { label: 'Small Claims', count: '2M' },
        { label: 'Divorce/Separation', count: '1M' },
        { label: 'Contract', count: '1M' }
      ]
    },
    'case-status': {
      isLoading: false,
      showAll: false,
      items: [
        { label: 'Closed', count: '16M' },
        { label: 'Open', count: '5M' },
        { label: 'Dismissed', count: '1M' },
        { label: 'Judgment Entered', count: '1M' },
        { label: 'Inactive', count: '437K' }
      ]
    }
  };

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
