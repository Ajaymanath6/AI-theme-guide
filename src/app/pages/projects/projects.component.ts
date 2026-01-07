import { Component, AfterViewInit } from '@angular/core';
import { ProjectHeaderComponent } from './components/project-header/project-header.component';

declare var initFlowbite: () => void;

@Component({
  selector: 'app-projects',
  imports: [ProjectHeaderComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements AfterViewInit {
  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }
}
