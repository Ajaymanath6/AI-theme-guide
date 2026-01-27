import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitsTabsComponent } from '../../components/visits-tabs/visits-tabs.component';
import { ActivityCardComponent } from '../../components/activity-card/activity-card.component';

interface ActivityCardItem {
  id: number;
  badgeIcon: string;
  projectLabel: string;
  titleSuffix: string;
  subtitle: string;
}

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, VisitsTabsComponent, ActivityCardComponent],
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

  onActivityRunSearch(card: ActivityCardItem): void {
    console.log('Run Search', card);
  }

  onActivityMenuClick(card: ActivityCardItem): void {
    console.log('Menu', card);
  }
}
