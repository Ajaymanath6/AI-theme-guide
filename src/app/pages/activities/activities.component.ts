import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitsTabsComponent } from '../../components/visits-tabs/visits-tabs.component';
import { ActivityCardComponent } from '../../components/activity-card/activity-card.component';
import { TrackingCaseCardComponent } from '../../components/tracking-case-card/tracking-case-card.component';
import { ProjectTileCardComponent } from '../../components/project-tile-card/project-tile-card.component';

interface ActivityCardItem {
  id: number;
  badgeIcon: string;
  projectLabel: string;
  titleSuffix: string;
  subtitle: string;
}

interface PinCardItem {
  id: number;
  projectName: string;
  description: string;
  createdDate: string;
}

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, VisitsTabsComponent, ActivityCardComponent, TrackingCaseCardComponent, ProjectTileCardComponent],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss'
})
export class ActivitiesComponent {
  activityCards: ActivityCardItem[] = [
    { id: 1, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : Google cases', subtitle: 'some criteria' },
    { id: 2, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : Acme Corp', subtitle: 'filed last week' },
    { id: 3, badgeIcon: 'folder', projectLabel: 'Project', titleSuffix: ' : Smith v. Jones', subtitle: 'document upload' },
    { id: 4, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : Patent lookup', subtitle: '2 hours ago' }
  ];

  /** 10 tracking cards; initially 5 visible, scroll or "Show All" to see rest */
  trackingCards: ActivityCardItem[] = [
    { id: 101, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : Google cases', subtitle: 'Updated 2h ago' },
    { id: 102, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : Acme Corp', subtitle: 'Updated yesterday' },
    { id: 103, badgeIcon: 'folder', projectLabel: 'Project', titleSuffix: ' : Smith v. Jones', subtitle: 'Document filed' },
    { id: 104, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : Patent lookup', subtitle: 'Status changed' },
    { id: 105, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : Doe v. Roe', subtitle: 'New filing' },
    { id: 106, badgeIcon: 'folder', projectLabel: 'Project', titleSuffix: ' : State v. Adams', subtitle: 'Motion filed' },
    { id: 107, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : IP Review', subtitle: 'Updated 5h ago' },
    { id: 108, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : Contract case', subtitle: 'Amendment' },
    { id: 109, badgeIcon: 'folder', projectLabel: 'Project', titleSuffix: ' : Estate matter', subtitle: 'Updated today' },
    { id: 110, badgeIcon: 'search', projectLabel: 'Project', titleSuffix: ' : Trademark', subtitle: 'Opposition filed' }
  ];

  showAllTrackingCards = false;

  /** Pinns section: tab options */
  pinsTabOptions = ['Projects', 'Cases', 'Attorneys', 'Law firms', 'Judges', 'Parties'];

  /** Pinns: project tile cards; first row = 3, Show All reveals rest */
  pinCards: PinCardItem[] = [
    { id: 1, projectName: 'Legal Case Management System', description: 'Comprehensive platform for managing legal cases, documents, and client information.', createdDate: 'Jan 3, 2024' },
    { id: 2, projectName: 'Patent Research Hub', description: 'Tools for patent lookup, prior art, and IP tracking.', createdDate: 'Feb 10, 2024' },
    { id: 3, projectName: 'Contract Lifecycle Manager', description: 'Draft, review, and track contracts from intake to renewal.', createdDate: 'Mar 1, 2024' },
    { id: 4, projectName: 'Litigation Tracker', description: 'Case deadlines, filings, and docket monitoring.', createdDate: 'Mar 15, 2024' },
    { id: 5, projectName: 'Compliance Dashboard', description: 'Regulatory checks and audit readiness.', createdDate: 'Apr 2, 2024' },
    { id: 6, projectName: 'Matter Billing Suite', description: 'Time and matter-based billing and reporting.', createdDate: 'Apr 20, 2024' }
  ];

  showAllPins = false;

  onActivityRunSearch(card: ActivityCardItem): void {
    console.log('Run Search', card);
  }

  onActivityMenuClick(card: ActivityCardItem): void {
    console.log('Menu', card);
  }

  onTrackingRunSearch(card: ActivityCardItem): void {
    console.log('Tracking Run Search', card);
  }

  onTrackingMenuClick(card: ActivityCardItem): void {
    console.log('Tracking Menu', card);
  }
}
