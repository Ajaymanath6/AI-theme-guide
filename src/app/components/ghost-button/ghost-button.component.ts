import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-ghost-button',
  standalone: true,
  imports: [],
  templateUrl: './ghost-button.component.html',
  styleUrl: './ghost-button.component.scss'
})
export class GhostButtonComponent {
  label = input<string>('Ghost');
  /** When true, button takes full width of container and text is centered. */
  fullWidth = input<boolean>(false);

  buttonClick = output<MouseEvent>();
}