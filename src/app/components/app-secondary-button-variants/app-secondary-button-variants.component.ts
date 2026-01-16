import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AppSecondaryButtonVariantsComponentVariant = '1' | '2';

@Component({
  selector: 'app-secondary-button-variants',
  imports: [CommonModule],
  templateUrl: './app-secondary-button-variants.component.html',
  styleUrl: './app-secondary-button-variants.component.scss'
})
export class AppSecondaryButtonVariantsComponent {
  variant = input<AppSecondaryButtonVariantsComponentVariant>('1');
  disabled = input<boolean>(false);
}