import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectHeaderComponent } from '../projects/components/project-header/project-header.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, ProjectHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  projectId: string | null = null;

  constructor(private route: ActivatedRoute) {
    // Get project ID from route params
    this.route.params.subscribe(params => {
      this.projectId = params['id'] || null;
    });
  }
}
