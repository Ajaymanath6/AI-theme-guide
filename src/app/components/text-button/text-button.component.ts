import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-text-button',
  standalone: true,
  imports: [],
  templateUrl: './text-button.component.html',
  styleUrl: './text-button.component.scss'
})
export class TextButtonComponent {
  label = input<string>('Text');
  
  buttonClick = output<MouseEvent>();
}