import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  imports: [],
  templateUrl: './app-primary-button.component.html',
  styleUrl: './app-primary-button.component.scss'
})
export class PrimaryButtonComponent {
  label = input<string>('primary-button');
  
  buttonClick = output<MouseEvent>();
}