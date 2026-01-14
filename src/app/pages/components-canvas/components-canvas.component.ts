import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var initFlowbite: () => void;

@Component({
  selector: 'app-components-canvas',
  imports: [CommonModule],
  templateUrl: './components-canvas.component.html',
  styleUrl: './components-canvas.component.scss'
})
export class ComponentsCanvasComponent implements AfterViewInit {
  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }
}
