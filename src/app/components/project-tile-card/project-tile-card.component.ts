import { Component, input } from '@angular/core';

@Component({
  selector: 'app-project-tile-card',
  imports: [],
  templateUrl: './project-tile-card.component.html',
  styleUrl: './project-tile-card.component.scss'
})
export class ProjectTileCardComponent {
  projectName = input<string>('Legal Case Management System');
  description = input<string>('Comprehensive platform for managing legal cases, documents, and client information.');
  createdDate = input<string>('Jan 3, 2024');
}
