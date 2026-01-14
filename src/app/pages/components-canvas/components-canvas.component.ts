import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';

declare var initFlowbite: () => void;

interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  content: string;
}

@Component({
  selector: 'app-components-canvas',
  imports: [CommonModule, DragDropModule],
  templateUrl: './components-canvas.component.html',
  styleUrl: './components-canvas.component.scss'
})
export class ComponentsCanvasComponent implements AfterViewInit {
  canvasElements: CanvasElement[] = [
    { id: '1', type: 'card', x: 100, y: 100, content: 'Card 1' },
    { id: '2', type: 'button', x: 300, y: 200, content: 'Button' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    if (typeof initFlowbite === 'function') {
      initFlowbite();
    }
  }

  private dragStartPositions = new Map<string, { x: number; y: number }>();
  private dragDeltas = new Map<string, { x: number; y: number }>();

  onDragStarted(element: CanvasElement): void {
    // Store the starting position from the model
    this.dragStartPositions.set(element.id, { x: element.x, y: element.y });
    this.dragDeltas.set(element.id, { x: 0, y: 0 });
  }

  onDragMoved(event: CdkDragMove, element: CanvasElement): void {
    const startPos = this.dragStartPositions.get(element.id);
    if (!startPos) return;

    // Track the current delta
    this.dragDeltas.set(element.id, { x: event.delta.x, y: event.delta.y });

    // Update position in real-time - this keeps element visible during drag
    element.x = startPos.x + event.delta.x;
    element.y = startPos.y + event.delta.y;
  }

  onDragEnded(event: CdkDragEnd, element: CanvasElement): void {
    const startPos = this.dragStartPositions.get(element.id);
    const delta = this.dragDeltas.get(element.id);
    
    if (startPos && delta) {
      // Calculate final position from start + tracked delta
      element.x = startPos.x + delta.x;
      element.y = startPos.y + delta.y;
    }

    // Clean up
    this.dragStartPositions.delete(element.id);
    this.dragDeltas.delete(element.id);
    
    // Force change detection to ensure position updates and element stays visible
    this.cdr.detectChanges();
  }

  addCard(): void {
    const newCard: CanvasElement = {
      id: Date.now().toString(),
      type: 'card',
      x: 50,
      y: 50,
      content: `Card ${this.canvasElements.length + 1}`
    };
    this.canvasElements.push(newCard);
  }

  addButton(): void {
    const newButton: CanvasElement = {
      id: Date.now().toString(),
      type: 'button',
      x: 50,
      y: 50,
      content: 'New Button'
    };
    this.canvasElements.push(newButton);
  }
}
