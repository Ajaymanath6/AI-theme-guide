import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-primary-outline-button',
  standalone: true,
  imports: [],
  templateUrl: './primary-outline-button.component.html',
  styleUrl: './primary-outline-button.component.scss'
})
export class PrimaryOutlineButtonComponent {
  label = input<string>('Primary Outline');
  
  buttonClick = output<MouseEvent>();
}