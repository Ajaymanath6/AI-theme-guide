import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-info.component.html',
  styleUrl: './banner-info.component.scss'
})
export class BannerInfoComponent {
  @Output() cancel = new EventEmitter<void>();
}
