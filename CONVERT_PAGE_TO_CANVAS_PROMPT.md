# Prompt: Convert Any Page to Figma-Like Canvas

Copy this prompt to convert any Angular page into a drag-and-drop canvas:

---

**PROMPT:**

Convert this Angular page into a Figma-like drag-and-drop canvas where all UI elements can be freely dragged and positioned anywhere on the page.

**Requirements:**

1. **Install Angular CDK** (if not already installed):
   - Run: `npm install @angular/cdk@^19.0.0 --legacy-peer-deps`
   - Import `DragDropModule` in the component

2. **Make all elements draggable:**
   - Each element should have `cdkDrag` directive
   - Elements must use `position: absolute` with `left` and `top` in pixels
   - Track element positions in component state (x, y coordinates)

3. **Implement drag handlers:**
   - `onDragStarted(element)` - Store initial position
   - `onDragMoved(event, element)` - Update position in real-time during drag
   - `onDragEnded(event, element)` - Save final position

4. **CSS Requirements:**
   - Hide CDK preview: `.cdk-drag-preview { display: none !important; }`
   - Hide placeholder: `.cdk-drag-placeholder { display: none !important; }`
   - Ensure elements stay visible: `opacity: 1 !important; visibility: visible !important;`
   - No transitions: `transition: none !important;`

5. **Canvas Container:**
   - Wrap all draggable elements in a container with `position: relative`
   - Container should have full height: `h-[calc(100vh-2rem)]` or similar

6. **Element Structure:**
   ```typescript
   interface CanvasElement {
     id: string;
     x: number;
     y: number;
     // ... other properties
   }
   ```

7. **Drag Logic:**
   ```typescript
   private dragStartPositions = new Map<string, { x: number; y: number }>();
   private dragDeltas = new Map<string, { x: number; y: number }>();

   onDragStarted(element: CanvasElement): void {
     this.dragStartPositions.set(element.id, { x: element.x, y: element.y });
     this.dragDeltas.set(element.id, { x: 0, y: 0 });
   }

   onDragMoved(event: CdkDragMove, element: CanvasElement): void {
     const startPos = this.dragStartPositions.get(element.id);
     if (!startPos) return;
     this.dragDeltas.set(element.id, { x: event.delta.x, y: event.delta.y });
     element.x = startPos.x + event.delta.x;
     element.y = startPos.y + event.delta.y;
   }

   onDragEnded(event: CdkDragEnd, element: CanvasElement): void {
     const startPos = this.dragStartPositions.get(element.id);
     const delta = this.dragDeltas.get(element.id);
     if (startPos && delta) {
       element.x = startPos.x + delta.x;
       element.y = startPos.y + delta.y;
     }
     this.dragStartPositions.delete(element.id);
     this.dragDeltas.delete(element.id);
     this.cdr.detectChanges();
   }
   ```

8. **HTML Template:**
   ```html
   <div class="canvas-container" style="position: relative; height: 100vh;">
     @for (element of elements; track element.id) {
       <div
         cdkDrag
         [attr.data-element-id]="element.id"
         (cdkDragStarted)="onDragStarted(element)"
         (cdkDragMoved)="onDragMoved($event, element)"
         (cdkDragEnded)="onDragEnded($event, element)"
         [style.position]="'absolute'"
         [style.left.px]="element.x"
         [style.top.px]="element.y"
         [style.cursor]="'move'">
         <!-- Element content -->
       </div>
     }
   </div>
   ```

9. **Critical CSS:**
   ```scss
   .cdk-drag-preview { display: none !important; }
   .cdk-drag-placeholder { display: none !important; }
   [cdkDrag] {
     transition: none !important;
     opacity: 1 !important;
     visibility: visible !important;
     display: block !important;
   }
   ```

**Expected Behavior:**
- Click and hold any element → cursor changes to grab
- Drag element → element follows cursor smoothly
- Release → element stays exactly where dropped
- No jumping, no disappearing, smooth like Figma

**Important Notes:**
- Elements must have unique IDs
- Position must be tracked in component state (x, y)
- Use `ChangeDetectorRef` to force updates after drag
- Disable CDK preview/placeholder to use original element
- Ensure all elements stay visible with `!important` CSS rules

---

**END OF PROMPT**

Use this prompt with any AI assistant to convert any Angular page into a drag-and-drop canvas!
