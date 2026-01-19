import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-neutral-button',
  imports: [],
  templateUrl: './app-neutral-button.component.html',
  styleUrl: './app-neutral-button.component.scss'
})
export class NeutralButtonComponent {
  label = input<string>('neutral-button');
  
  buttonClick = output<MouseEvent>();
}