import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-primary-outline-button',
  imports: [],
  templateUrl: './app-primary-outline-button.component.html',
  styleUrl: './app-primary-outline-button.component.scss'
})
export class PrimaryOutlineButtonComponent {
  label = input<string>('primary-outline-button');
  
  buttonClick = output<MouseEvent>();
}