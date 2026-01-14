import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsCanvasComponent } from './components-canvas.component';

describe('ComponentsCanvasComponent', () => {
  let component: ComponentsCanvasComponent;
  let fixture: ComponentFixture<ComponentsCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentsCanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentsCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
