import { Routes } from '@angular/router';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ComponentsCanvasComponent } from './pages/components-canvas/components-canvas.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { Dashboard2Component } from './pages/dashboard2/dashboard2.component';
import { ActivitiesComponent } from './pages/activities/activities.component';

export const routes: Routes = [
  { path: '', redirectTo: '/projects', pathMatch: 'full' },
  { path: 'projects', component: ProjectsComponent },
  { path: 'components-canvas', component: ComponentsCanvasComponent },
  { path: 'dashboard/:id', component: DashboardComponent },
  { path: 'dashboard2/:id', component: Dashboard2Component },
  { path: 'activities', component: ActivitiesComponent },
  { path: '**', redirectTo: '/projects' }
];
