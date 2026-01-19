import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../primary-button/primary-button.component';
import { PrimaryOutlineButtonComponent } from '../primary-outline-button/primary-outline-button.component';
import { NeutralButtonComponent } from '../neutral-button/neutral-button.component';

export type PrimaryButtonVariantsComponentVariant = '1' | '2' | '3';

@Component({
  selector: 'app-primary-button-variants',
  imports: [CommonModule, PrimaryButtonComponent, PrimaryOutlineButtonComponent, NeutralButtonComponent],
  templateUrl: './app-primary-button-variants.component.html',
  styleUrl: './app-primary-button-variants.component.scss'
})
export class PrimaryButtonVariantsComponent {
  variant = input<PrimaryButtonVariantsComponentVariant>('1');
  // ========== COMMON BUTTON INPUTS (Predefined) ==========
  label = input<string>('Button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  icon = input<string | null>(null);
  iconRight = input<string | null>(null);
  type = input<'button' | 'submit' | 'reset'>('button');
  size = input<'sm' | 'md' | 'lg'>('md');
  fullWidth = input<boolean>(false);
  ariaLabel = input<string | null>(null);
  tooltip = input<string | null>(null);
  
  // ========== COMMON BUTTON OUTPUTS (Predefined) ==========
  buttonClick = output<MouseEvent>();
  buttonFocus = output<FocusEvent>();
  buttonBlur = output<FocusEvent>();
  buttonMouseEnter = output<MouseEvent>();
  buttonMouseLeave = output<MouseEvent>();
}