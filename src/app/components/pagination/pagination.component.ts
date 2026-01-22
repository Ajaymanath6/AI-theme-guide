import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  currentPage = input<number>(1);
  totalPages = input<number>(100);
  pageSize = input<number>(10);
  totalResults = input<number>(3012424);
  
  get startIndex(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }
  
  get endIndex(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalResults());
  }
  
  get pagesToShow(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];
    
    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (current <= 4) {
        // Near the start: 1 2 3 4 5 ... 100
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis marker
        pages.push(total);
      } else if (current >= total - 3) {
        // Near the end: 1 ... 96 97 98 99 100
        pages.push(-1); // Ellipsis marker
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // In the middle: 1 ... 48 49 50 51 52 ... 100
        pages.push(-1); // Ellipsis marker
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis marker
        pages.push(total);
      }
    }
    
    return pages;
  }
}
