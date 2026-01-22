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
  currentPage = input<number>(1);
  pageSize = 10;

  // Sample case data - Generate more cases for pagination demo
  allCases: CaseData[] = [
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
    },
    {
      caseTitle: 'STATE OF ILLINOIS vs. Taylor, James Robert',
      caseTag: '2026 CR D 00567 E',
      courtName: 'Illinois Circuit Courts - Cook County Circuit Court',
      filingDate: '12 June 2026',
      areaOfLaw: 'Criminal',
      caseStatus: 'Open',
      attorneyName: 'MILLER DAVID PAUL'
    },
    {
      caseTitle: 'STATE OF PENNSYLVANIA vs. White, Lisa Marie',
      caseTag: '2026 CV D 00678 F',
      courtName: 'Pennsylvania Superior Court - Philadelphia County',
      filingDate: '08 July 2026',
      areaOfLaw: 'Civil',
      caseStatus: 'Open',
      attorneyName: 'GARCIA MARIA ELENA'
    },
    {
      caseTitle: 'STATE OF MICHIGAN vs. Harris, Michael John',
      caseTag: '2026 FM D 00789 G',
      courtName: 'Michigan Circuit Courts - Wayne County Circuit Court',
      filingDate: '25 August 2026',
      areaOfLaw: 'Family',
      caseStatus: 'Closed',
      attorneyName: 'RODRIGUEZ CARLOS ANTONIO'
    },
    {
      caseTitle: 'STATE OF GEORGIA vs. Clark, Sarah Elizabeth',
      caseTag: '2026 TR D 00890 H',
      courtName: 'Georgia Superior Courts - Fulton County Superior Court',
      filingDate: '14 September 2026',
      areaOfLaw: 'Traffic',
      caseStatus: 'Open',
      attorneyName: 'LEE JENNIFER ANN'
    },
    {
      caseTitle: 'STATE OF NORTH CAROLINA vs. Lewis, Robert William',
      caseTag: '2026 CR D 00901 I',
      courtName: 'North Carolina Superior Courts - Mecklenburg County',
      filingDate: '03 October 2026',
      areaOfLaw: 'Criminal',
      caseStatus: 'Open',
      attorneyName: 'WALKER THOMAS JAMES'
    },
    {
      caseTitle: 'STATE OF ARIZONA vs. Young, Patricia Ann',
      caseTag: '2026 CV D 01012 J',
      courtName: 'Arizona Superior Courts - Maricopa County Superior Court',
      filingDate: '19 November 2026',
      areaOfLaw: 'Civil',
      caseStatus: 'Dismissed',
      attorneyName: 'HALL SUSAN MARIE'
    },
    {
      caseTitle: 'STATE OF MASSACHUSETTS vs. King, Daniel Patrick',
      caseTag: '2026 PR D 01123 K',
      courtName: 'Massachusetts Probate and Family Court - Suffolk County',
      filingDate: '07 December 2026',
      areaOfLaw: 'Probate',
      caseStatus: 'Open',
      attorneyName: 'ALLEN RICHARD MICHAEL'
    },
    {
      caseTitle: 'STATE OF WASHINGTON vs. Wright, Nancy Jean',
      caseTag: '2026 FM D 01234 L',
      courtName: 'Washington Superior Courts - King County Superior Court',
      filingDate: '22 January 2027',
      areaOfLaw: 'Family',
      caseStatus: 'Open',
      attorneyName: 'LOPEZ ANTHONY RAY'
    },
    {
      caseTitle: 'STATE OF INDIANA vs. Lopez, Christopher Mark',
      caseTag: '2026 TR D 01345 M',
      courtName: 'Indiana Circuit Courts - Marion County Circuit Court',
      filingDate: '11 February 2027',
      areaOfLaw: 'Traffic',
      caseStatus: 'Closed',
      attorneyName: 'GREEN AMANDA ROSE'
    },
    {
      caseTitle: 'STATE OF TENNESSEE vs. Hill, Michelle Lynn',
      caseTag: '2026 CR D 01456 N',
      courtName: 'Tennessee Circuit Courts - Davidson County Circuit Court',
      filingDate: '30 March 2027',
      areaOfLaw: 'Criminal',
      caseStatus: 'Open',
      attorneyName: 'ADAMS KEVIN JOSEPH'
    },
    {
      caseTitle: 'STATE OF MISSOURI vs. Scott, Brian Edward',
      caseTag: '2026 CV D 01567 O',
      courtName: 'Missouri Circuit Courts - St. Louis County Circuit Court',
      filingDate: '18 April 2027',
      areaOfLaw: 'Civil',
      caseStatus: 'Open',
      attorneyName: 'BAKER LAURA MICHELLE'
    },
    {
      caseTitle: 'STATE OF MARYLAND vs. Green, Karen Sue',
      caseTag: '2026 FM D 01678 P',
      courtName: 'Maryland Circuit Courts - Baltimore County Circuit Court',
      filingDate: '05 May 2027',
      areaOfLaw: 'Family',
      caseStatus: 'Dismissed',
      attorneyName: 'NELSON MARK DAVID'
    },
    {
      caseTitle: 'STATE OF WISCONSIN vs. Adams, Steven Paul',
      caseTag: '2026 PR D 01789 Q',
      courtName: 'Wisconsin Circuit Courts - Milwaukee County Circuit Court',
      filingDate: '27 June 2027',
      areaOfLaw: 'Probate',
      caseStatus: 'Open',
      attorneyName: 'CARTER EMILY GRACE'
    },
    {
      caseTitle: 'STATE OF COLORADO vs. Baker, Jessica Ann',
      caseTag: '2026 TR D 01890 R',
      courtName: 'Colorado District Courts - Denver County District Court',
      filingDate: '14 July 2027',
      areaOfLaw: 'Traffic',
      caseStatus: 'Open',
      attorneyName: 'MITCHELL JASON ROBERT'
    },
    {
      caseTitle: 'STATE OF MINNESOTA vs. Nelson, Kevin James',
      caseTag: '2026 CR D 01901 S',
      courtName: 'Minnesota District Courts - Hennepin County District Court',
      filingDate: '02 August 2027',
      areaOfLaw: 'Criminal',
      caseStatus: 'Closed',
      attorneyName: 'PEREZ NICOLE MARIE'
    },
    {
      caseTitle: 'STATE OF LOUISIANA vs. Carter, Amanda Rose',
      caseTag: '2026 CV D 02012 T',
      courtName: 'Louisiana District Courts - Orleans Parish Civil District Court',
      filingDate: '21 September 2027',
      areaOfLaw: 'Civil',
      caseStatus: 'Open',
      attorneyName: 'ROBERTS TIMOTHY JOHN'
    },
    {
      caseTitle: 'STATE OF ALABAMA vs. Mitchell, Ryan Thomas',
      caseTag: '2026 FM D 02123 U',
      courtName: 'Alabama Circuit Courts - Jefferson County Circuit Court',
      filingDate: '09 October 2027',
      areaOfLaw: 'Family',
      caseStatus: 'Open',
      attorneyName: 'TURNER STEPHANIE LYNN'
    },
    {
      caseTitle: 'STATE OF KENTUCKY vs. Perez, Matthew Charles',
      caseTag: '2026 PR D 02234 V',
      courtName: 'Kentucky Circuit Courts - Fayette County Circuit Court',
      filingDate: '28 November 2027',
      areaOfLaw: 'Probate',
      caseStatus: 'Dismissed',
      attorneyName: 'PHILLIPS DANIEL MARK'
    },
    {
      caseTitle: 'STATE OF OREGON vs. Roberts, Ashley Nicole',
      caseTag: '2026 TR D 02345 W',
      courtName: 'Oregon Circuit Courts - Multnomah County Circuit Court',
      filingDate: '16 December 2027',
      areaOfLaw: 'Traffic',
      caseStatus: 'Open',
      attorneyName: 'CAMPBELL RACHEL ELIZABETH'
    },
    {
      caseTitle: 'STATE OF OKLAHOMA vs. Turner, Justin Michael',
      caseTag: '2026 CR D 02456 X',
      courtName: 'Oklahoma District Courts - Oklahoma County District Court',
      filingDate: '04 January 2028',
      areaOfLaw: 'Criminal',
      caseStatus: 'Open',
      attorneyName: 'PARKER ANDREW JAMES'
    }
  ];
  
  // Get paginated cases (10 per page)
  cases = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.allCases.slice(startIndex, endIndex);
  });
  
  // Total number of cases
  totalCases = computed(() => this.allCases.length);
  
  // Total pages
  totalPages = computed(() => Math.ceil(this.totalCases() / this.pageSize));
  
  // Get start and end index for display
  startIndex = computed(() => (this.currentPage() - 1) * this.pageSize + 1);
  endIndex = computed(() => Math.min(this.currentPage() * this.pageSize, this.totalCases()));
  
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
    const matchesCase = this.allCases.some(caseItem => 
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
