import { Component, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EmptyStateScenario {
  icon: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  scenario = input<string>('no-results');
  
  scenarios: { [key: string]: EmptyStateScenario } = {
    'case-not-found': {
      icon: 'search',
      title: 'Case not found',
      content: 'We could not find any cases matching your search. Try using different keywords, case numbers, or party names. You can also refine your search using the filters on the left.'
    },
    'attorney-not-found': {
      icon: 'person',
      title: 'Attorney not found',
      content: 'We could not find any attorneys matching your search. Please check the spelling of the attorney\'s name or try searching with a different format.'
    },
    'typo': {
      icon: 'spellcheck',
      title: 'Possible typo detected',
      content: 'It looks like there might be a typo in your search. Please check your spelling and try again with the correct spelling.'
    },
    'no-results': {
      icon: 'search_off',
      title: 'No results found',
      content: 'We did not find any results matching your search criteria. Try using different keywords, adjusting your filters, or broadening your search terms.'
    },
    'error-500': {
      icon: 'error_outline',
      title: 'Server error',
      content: 'We encountered an error processing your request. Please try again in a few moments. If the problem persists, contact support.'
    },
    'error-generic': {
      icon: 'warning',
      title: 'Something went wrong',
      content: 'An unexpected error occurred while processing your search. Please try again or contact support if the problem persists.'
    },
    'empty-search': {
      icon: 'search',
      title: 'Start your search',
      content: 'Enter a case number, party name, attorney name, or use natural language to find cases, documents, and legal information.'
    }
  };
  
  currentScenario!: EmptyStateScenario;

  constructor() {
    // Initialize with default scenario
    this.currentScenario = this.scenarios['no-results'];
    
    // Update scenario when input changes
    effect(() => {
      const scenarioKey = this.scenario();
      this.currentScenario = this.scenarios[scenarioKey] || this.scenarios['no-results'];
    });
  }
}
