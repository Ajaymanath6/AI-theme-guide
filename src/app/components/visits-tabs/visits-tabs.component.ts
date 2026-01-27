import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visits-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visits-tabs.component.html',
  styleUrl: './visits-tabs.component.scss'
})
export class VisitsTabsComponent {
  selectedTab = 'Searches';
  tabOptions: string[] = ['Searches', 'visited profile', 'visited projects', 'saved Search', 'documents', 'order'];
}
