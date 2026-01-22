import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var initFlowbite: () => void;

@Component({
  selector: 'app-side-filter',
  imports: [CommonModule],
  templateUrl: './side-filter.component.html',
  styleUrl: './side-filter.component.scss'
})
export class SideFilterComponent implements AfterViewInit {
  
  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }
}
