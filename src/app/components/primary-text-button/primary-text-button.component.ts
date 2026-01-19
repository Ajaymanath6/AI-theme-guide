import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-primary-text-button',
  standalone: true,
  imports: [],
  templateUrl: './primary-text-button.component.html',
  styleUrl: './primary-text-button.component.scss'
})
export class PrimaryTextButtonComponent {
  label = input<string>('Primary Text');
  
  buttonClick = output<MouseEvent>();
}