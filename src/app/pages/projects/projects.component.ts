import { Component, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectHeaderComponent } from './components/project-header/project-header.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ProjectCardComponent } from './components/project-card/project-card.component';

declare var initFlowbite: () => void;

interface Project {
  id: string | number;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-projects',
  imports: [CommonModule, ProjectHeaderComponent, PaginationComponent, ProjectCardComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements AfterViewInit {
  currentPage = signal(1);
  totalItems = signal(123);
  itemsPerPage = signal(10);

  projects: Project[] = [
    { id: 1, title: 'Project Title 1', subtitle: 'Project subtitle description' },
    { id: 2, title: 'Project Title 2', subtitle: 'Project subtitle description' },
    { id: 3, title: 'Project Title 3', subtitle: 'Project subtitle description' },
    { id: 4, title: 'Project Title 4', subtitle: 'Project subtitle description' },
    { id: 5, title: 'Project Title 5', subtitle: 'Project subtitle description' },
    { id: 6, title: 'Project Title 6', subtitle: 'Project subtitle description' },
    { id: 7, title: 'Project Title 7', subtitle: 'Project subtitle description' },
    { id: 8, title: 'Project Title 8', subtitle: 'Project subtitle description' }
  ];

  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    // TODO: Load projects for the new page
  }

  onKeep(projectId: string | number): void {
    console.log('Keep project:', projectId);
    // TODO: Implement keep functionality
  }

  onPin(projectId: string | number): void {
    console.log('Pin project:', projectId);
    // TODO: Implement pin functionality
  }

  onEdit(projectId: string | number): void {
    console.log('Edit project:', projectId);
    // TODO: Implement edit functionality
  }

  onCopyId(projectId: string | number): void {
    console.log('Copy project ID:', projectId);
    // TODO: Implement copy to clipboard functionality
    if (navigator.clipboard) {
      navigator.clipboard.writeText(String(projectId));
    }
  }

  onDelete(projectId: string | number): void {
    console.log('Delete project:', projectId);
    // TODO: Implement delete functionality
  }
}
