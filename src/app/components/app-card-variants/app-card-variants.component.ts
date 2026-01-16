import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { CardSecondaryComponent } from '../card-secondary/card-secondary.component';

export type CardVariantsComponentVariant = '1' | '2';

@Component({
  selector: 'app-card-variants',
  imports: [CommonModule, CardComponent, CardSecondaryComponent],
  templateUrl: './app-card-variants.component.html',
  styleUrl: './app-card-variants.component.scss'
})
export class CardVariantsComponent {
  variant = input<CardVariantsComponentVariant>('1');
  disabled = input<boolean>(false);
}