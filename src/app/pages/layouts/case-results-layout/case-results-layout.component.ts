import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseResultsComponent } from '../../../components/case-results/case-results.component';
import { SideFilterComponent } from '../../../components/side-filter/side-filter.component';
import { CaseCardComponent } from '../../../components/case-card/case-card.component';
import { EmptyStateComponent } from '../../../components/empty-state/empty-state.component';
import { PaginationComponent } from '../../../components/pagination/pagination.component';

interface CaseData {
  caseTitle: string;
  caseTag: string;
  courtName: string;
  filingDate: string;
  areaOfLaw: string;
  caseStatus: string;
  attorneyName: string;
}

@Component({
  selector: 'app-case-results-layout',
  imports: [CommonModule, CaseResultsComponent, SideFilterComponent, CaseCardComponent, EmptyStateComponent, PaginationComponent],
  templateUrl: './case-results-layout.component.html',
  styleUrl: './case-results-layout.component.scss'
})
export class CaseResultsLayoutComponent {
  searchQuery = input<string>('');
  isLoading = input<boolean>(false);

  // Sample case data - 5 different cases
  cases: CaseData[] = [
    {
      caseTitle: 'STATE OF OHIO vs. Danowski, JR, Joseph John',
      caseTag: '2026 TR D 00045 E',
      courtName: 'Ohio County Courts - Eastern Division, Ashtabula County Court',
      filingDate: '21 January 2026',
      areaOfLaw: 'Traffic',
      caseStatus: 'Open',
      attorneyName: 'MCGHEE JOHN EDWARD JR'
    },
    {
      caseTitle: 'STATE OF FLORIDA vs. Smith, Robert Michael',
      caseTag: '2026 CR D 00123 A',
      courtName: 'Florida Circuit Courts - Ninth Judicial Circuit',
      filingDate: '15 February 2026',
      areaOfLaw: 'Criminal',
      caseStatus: 'Open',
      attorneyName: 'JOHNSON MARY ELIZABETH'
    },
    {
      caseTitle: 'STATE OF CALIFORNIA vs. Williams, David James',
      caseTag: '2026 CV D 00456 B',
      courtName: 'California Superior Courts - Los Angeles County Superior Court',
      filingDate: '10 March 2026',
      areaOfLaw: 'Civil',
      caseStatus: 'Closed',
      attorneyName: 'BROWN SARAH ANNE'
    },
    {
      caseTitle: 'STATE OF TEXAS vs. Martinez, Carlos Enrique',
      caseTag: '2026 FM D 00789 C',
      courtName: 'Texas District Courts - Harris County District Court',
      filingDate: '05 April 2026',
      areaOfLaw: 'Family',
      caseStatus: 'Open',
      attorneyName: 'DAVIS MICHAEL THOMAS'
    },
    {
      caseTitle: 'STATE OF NEW YORK vs. Anderson, Jennifer Lynn',
      caseTag: '2026 PR D 00234 D',
      courtName: 'New York Supreme Court - New York County',
      filingDate: '20 May 2026',
      areaOfLaw: 'Probate',
      caseStatus: 'Dismissed',
      attorneyName: 'WILSON PATRICIA ROSE'
    }
  ];
  
  // Simulate search results - in real app, this would come from API
  hasResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return false;
    
    // Simple validation: check if query looks like a typo or invalid
    // For demo: if query contains random strings or is too short, show no results
    // In production, this would check against actual database
    
    // Check for common typo patterns
    const hasTypo = this.detectTypo(query);
    if (hasTypo) return false;
    
    // Check if query matches any case (simplified for demo)
    const matchesCase = this.cases.some(caseItem => 
      caseItem.caseTitle.toLowerCase().includes(query) ||
      caseItem.caseTag.toLowerCase().includes(query) ||
      caseItem.attorneyName.toLowerCase().includes(query)
    );
    
    return matchesCase;
  });
  
  // Determine which empty state scenario to show
  emptyStateScenario = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    
    if (!query) return 'empty-search';
    
    // Check for typos
    if (this.detectTypo(query)) {
      return 'typo';
    }
    
    // Check if it's an attorney search
    if (query.includes('attorney') || query.includes('lawyer') || query.includes('counsel')) {
      return 'attorney-not-found';
    }
    
    // Default: case not found
    return 'case-not-found';
  });
  
  // Simple typo detection logic
  private detectTypo(query: string): boolean {
    // Check for random strings (numbers mixed with letters in unusual patterns)
    const randomStringPattern = /^[a-z0-9]{10,}$/i;
    if (randomStringPattern.test(query) && !query.match(/^[0-9]+$/)) {
      // If it's a long alphanumeric string that's not a case number, likely a typo
      const hasCaseNumberPattern = /^\d{4}\s*[A-Z]{1,3}\s*[D]\s*\d{5,}/i.test(query);
      if (!hasCaseNumberPattern && query.length > 8) {
        return true;
      }
    }
    
    // Check for very short queries that don't look like valid search terms
    if (query.length < 3) {
      return false; // Too short to determine
    }
    
    // Check for common typo patterns (repeated characters, unusual combinations)
    const repeatedChars = /(.)\1{4,}/.test(query); // 5+ repeated characters
    if (repeatedChars) {
      return true;
    }
    
    return false;
  }
}
