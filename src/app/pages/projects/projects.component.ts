import { Component, AfterViewInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectHeaderComponent } from './components/project-header/project-header.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ProjectCardComponent } from './components/project-card/project-card.component';
import { ProjectFilterComponent } from '../../components/project-filter/project-filter.component';

declare var initFlowbite: () => void;

interface Project {
  id: string | number;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-projects',
  imports: [CommonModule, ProjectHeaderComponent, PaginationComponent, ProjectCardComponent, ProjectFilterComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements AfterViewInit {
  currentPage = signal(1);
  totalItems = signal(123);
  itemsPerPage = signal(10);
  
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  /** Set of pinned project IDs - toggled when user clicks pin on a card */
  pinnedIds = signal<Set<string | number>>(new Set());

  pinnedProjects = computed(() => this.projects.filter(p => this.pinnedIds().has(p.id)));
  unpinnedProjects = computed(() => this.projects.filter(p => !this.pinnedIds().has(p.id)));

  projects: Project[] = [
    { id: 1, title: 'Legal Case Management System', subtitle: 'Comprehensive platform for managing legal cases, documents, and client information with advanced search and filtering capabilities' },
    { id: 2, title: 'Client Portal Dashboard', subtitle: 'Interactive dashboard for clients to view case status, upload documents, and communicate with their legal team' },
    { id: 3, title: 'Document Automation Suite', subtitle: 'Automated document generation and template management system for legal contracts and agreements' },
    { id: 4, title: 'Billing & Time Tracking', subtitle: 'Track billable hours, generate invoices, and manage client billing with detailed reporting and analytics' },
    { id: 5, title: 'Court Calendar Integration', subtitle: 'Sync with court systems to manage hearings, deadlines, and important dates across all cases' },
    { id: 6, title: 'Legal Research Assistant', subtitle: 'AI-powered research tool to find relevant case law, statutes, and legal precedents for your cases' },
    { id: 7, title: 'Compliance Monitoring', subtitle: 'Track regulatory compliance requirements, deadlines, and generate compliance reports automatically' },
    { id: 8, title: 'Client Relationship Manager', subtitle: 'Manage client communications, track interactions, and maintain detailed client profiles and history' }
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
    const current = new Set(this.pinnedIds());
    if (current.has(projectId)) {
      current.delete(projectId);
    } else {
      current.add(projectId);
    }
    this.pinnedIds.set(current);
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
