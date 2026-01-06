import { Component } from '@angular/core';
import { ProjectHeaderComponent } from './components/project-header/project-header.component';

@Component({
  selector: 'app-projects',
  imports: [ProjectHeaderComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {

}
