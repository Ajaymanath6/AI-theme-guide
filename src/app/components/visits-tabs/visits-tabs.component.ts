import { Component, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

const DEFAULT_TAB_OPTIONS = ['Searches', 'visited profile', 'visited projects', 'saved Search', 'documents', 'order'];

@Component({
  selector: 'app-visits-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visits-tabs.component.html',
  styleUrl: './visits-tabs.component.scss'
})
export class VisitsTabsComponent {
  /** Tab labels; when provided, overrides default. */
  tabOptions = input<string[]>(DEFAULT_TAB_OPTIONS);

  selectedTab = 'Searches';

  constructor() {
    effect(() => {
      const opts = this.tabOptions();
      if (opts?.length && !opts.includes(this.selectedTab)) {
        this.selectedTab = opts[0];
      }
    });
  }
}
