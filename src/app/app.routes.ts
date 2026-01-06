import { Routes } from '@angular/router';
import { DocumentViewComponent } from './components/document-view/document-view.component';
import { ProjectsComponent } from './pages/projects/projects.component';

export const routes: Routes = [
  { path: '', redirectTo: '/document-view', pathMatch: 'full' },
  { path: 'document-view', component: DocumentViewComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: '**', redirectTo: '/document-view' }
];
