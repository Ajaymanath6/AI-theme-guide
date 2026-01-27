import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-activity-card',
  standalone: true,
  imports: [],
  templateUrl: './activity-card.component.html',
  styleUrl: './activity-card.component.scss'
})
export class ActivityCardComponent {
  /** Material Symbol name for the badge icon (e.g. 'search'). */
  badgeIcon = input<string>('search');
  /** Strong-text label (e.g. 'Project'). */
  projectLabel = input<string>('Project');
  /** Secondary underlined suffix after the label (e.g. ' : Google cases'). */
  titleSuffix = input<string>(' : Google cases');
  /** Subtitle text below the title (e.g. 'some criteria'). */
  subtitle = input<string>('some criteria');

  /** Emitted when "Run Search" is clicked. */
  onRunSearch = output<void>();
  /** Emitted when the 3-dots menu button is clicked. */
  onMenuClick = output<void>();
}
