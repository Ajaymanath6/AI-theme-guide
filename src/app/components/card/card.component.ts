import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
export type CardVariant = '1' | '7';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  variant = input<CardVariant>('1');
  disabled = input<boolean>(false);
}
