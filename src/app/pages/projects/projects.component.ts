import { Component, AfterViewInit, signal } from '@angular/core';
import { ProjectHeaderComponent } from './components/project-header/project-header.component';
import { PaginationComponent } from './components/pagination/pagination.component';

declare var initFlowbite: () => void;

@Component({
  selector: 'app-projects',
  imports: [ProjectHeaderComponent, PaginationComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements AfterViewInit {
  currentPage = signal(1);
  totalItems = signal(123);
  itemsPerPage = signal(10);

  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    // TODO: Load projects for the new page
  }
}
