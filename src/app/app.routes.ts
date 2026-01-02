import { Routes } from '@angular/router';
import { DocumentViewComponent } from './components/document-view/document-view.component';

export const routes: Routes = [
  { path: '', redirectTo: '/document-view', pathMatch: 'full' },
  { path: 'document-view', component: DocumentViewComponent }
];
