import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-users-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-users-modal.component.html',
  styleUrl: './select-users-modal.component.scss'
})
export class SelectUsersModalComponent {
  /** When false, modal is hidden. Default false so canvas is not blocked until opened. */
  isOpen = input<boolean>(false);
  /** When true, render only the content box (no overlay) for use as a canvas UI element. */
  asCanvasElement = input<boolean>(false);
  /** Emitted when modal is closed (overlay or close button). */
  closed = output<void>();

  searchQuery = '';
  /** 24 placeholder user names: 3 per row × 8 rows */
  userNames: string[] = [
    'Alex Johnson', 'Sam Williams', 'Jordan Lee',
    'Taylor Davis', 'Morgan Brown', 'Casey Miller',
    'Riley Wilson', 'Avery Moore', 'Quinn Taylor',
    'Parker Anderson', 'Cameron Thomas', 'Drew Jackson',
    'Blake White', 'Skyler Harris', 'Jamie Martin',
    'Dakota Thompson', 'Reese Garcia', 'Emery Martinez',
    'Hayden Robinson', 'Finley Clark', 'River Lewis',
    'Phoenix Walker', 'Harper Hall', 'Rowan Young'
  ];
}
