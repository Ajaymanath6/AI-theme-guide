import { Component, AfterViewInit } from '@angular/core';

declare var initFlowbite: () => void;

@Component({
  selector: 'app-document-view',
  imports: [],
  templateUrl: './document-view.component.html',
  styleUrl: './document-view.component.scss'
})
export class DocumentViewComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }
}
