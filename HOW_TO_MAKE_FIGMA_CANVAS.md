# How to Make Any Page a Figma-Like Canvas

This guide shows you how to convert any Angular page into a drag-and-drop canvas similar to Figma, where elements can be freely dragged and positioned anywhere.

## Prerequisites

1. Angular CDK installed:
```bash
npm install @angular/cdk@^19.0.0 --legacy-peer-deps
```

## Implementation Steps

### Step 1: Import DragDropModule

In your component TypeScript file:

```typescript
import { DragDropModule, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-your-component',
  imports: [CommonModule, DragDropModule],
  // ... rest of component config
})
```

### Step 2: Create Element Interface

Define an interface for draggable elements:

```typescript
interface CanvasElement {
  id: string;
  x: number;
  y: number;
  // Add any other properties your elements need
}
```

### Step 3: Component Logic

Add the drag handling logic to your component:

```typescript
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';

export class YourComponent {
  // Array of draggable elements
  canvasElements: CanvasElement[] = [
    { id: '1', x: 100, y: 100 },
    { id: '2', x: 300, y: 200 }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

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
}
```

### Step 4: HTML Template

Structure your HTML with a canvas container and draggable elements:

```html
<div class="min-h-screen bg-brandcolor-fill p-4">
  <!-- Canvas Area -->
  <div class="relative bg-brandcolor-white border border-brandcolor-strokeweak rounded-lg overflow-hidden canvas-container h-[calc(100vh-2rem)]">
    <!-- Canvas Elements -->
    @for (element of canvasElements; track element.id) {
      <div
        cdkDrag
        [attr.data-element-id]="element.id"
        (cdkDragStarted)="onDragStarted(element)"
        (cdkDragMoved)="onDragMoved($event, element)"
        (cdkDragEnded)="onDragEnded($event, element)"
        [style.position]="'absolute'"
        [style.left.px]="element.x"
        [style.top.px]="element.y"
        [style.cursor]="'move'"
        [style.z-index]="'1'"
        class="cursor-move draggable-element">
        
        <!-- Your element content here -->
        <div>Your Content</div>
      </div>
    }
  </div>
</div>
```

### Step 5: CSS Styles

Add these styles to your component SCSS file:

```scss
// Canvas container
.canvas-container {
  position: relative;
  min-height: 100%;
}

// Hide CDK preview and placeholder - use original element
.cdk-drag-preview {
  display: none !important;
}

.cdk-drag-placeholder {
  display: none !important;
}

.cdk-drag-animating {
  transition: none; // No transition for instant response
}

// Draggable elements - smooth like Figma
.draggable-element {
  cursor: move;
  position: absolute !important;
  will-change: transform;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  
  &:hover {
    cursor: grab;
  }
  
  &:active {
    cursor: grabbing;
  }
  
  // During drag
  &.cdk-drag-dragging {
    z-index: 1000 !important;
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
  }
}

// Ensure no transitions interfere with smooth drag and elements stay visible
[cdkDrag] {
  transition: none !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
  
  &.cdk-drag-dragging {
    transition: none !important;
    opacity: 1 !important;
    visibility: visible !important;
    display: block !important;
  }
  
  // Make sure element never disappears
  * {
    opacity: 1 !important;
    visibility: visible !important;
  }
}
```

## Key Points

1. **Use absolute positioning** - Elements must use `position: absolute` with `left` and `top` in pixels
2. **Track delta during drag** - `CdkDragEnd` doesn't have `delta`, so track it in `onDragMoved`
3. **Disable CDK preview** - Hide preview and placeholder to use original element
4. **Force visibility** - Use `!important` CSS rules to ensure elements never disappear
5. **Change detection** - Call `detectChanges()` after drag ends to update the view

## Complete Working Example

See `src/app/pages/components-canvas/` for a complete working implementation.

## Troubleshooting

- **Elements disappearing**: Ensure CSS has `opacity: 1 !important` and `visibility: visible !important`
- **Position not saving**: Check that `onDragEnded` is calculating position correctly
- **Jumping on release**: Make sure you're tracking delta in `onDragMoved` and using it in `onDragEnded`
