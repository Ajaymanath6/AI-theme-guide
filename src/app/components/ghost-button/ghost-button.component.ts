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
  
  buttonClick = output<MouseEvent>();
}