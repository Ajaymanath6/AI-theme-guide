import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../primary-button/primary-button.component';
import { PrimaryOutlineButtonComponent } from '../primary-outline-button/primary-outline-button.component';

export type SuperComponentComponentVariant = '1' | '2';

@Component({
  selector: 'app-super-component',
  imports: [CommonModule, PrimaryButtonComponent, PrimaryOutlineButtonComponent],
  templateUrl: './super-component.component.html',
  styleUrl: './super-component.component.scss'
})
export class SuperComponentComponent {
  variant = input<SuperComponentComponentVariant>('1');
  disabled = input<boolean>(false);
}