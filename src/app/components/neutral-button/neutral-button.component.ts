import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-neutral-button',
  standalone: true,
  imports: [],
  templateUrl: './neutral-button.component.html',
  styleUrl: './neutral-button.component.scss'
})
export class NeutralButtonComponent {
  label = input<string>('Neutral');
  
  buttonClick = output<MouseEvent>();
}