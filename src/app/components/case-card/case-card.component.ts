import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-case-card',
  imports: [CommonModule],
  templateUrl: './case-card.component.html',
  styleUrl: './case-card.component.scss'
})
export class CaseCardComponent {
  caseTitle = input<string>('');
  caseTag = input<string>('');
  courtName = input<string>('');
  filingDate = input<string>('');
  areaOfLaw = input<string>('');
  caseStatus = input<string>('');
  attorneyName = input<string>('');
  isLoading = input<boolean>(false);
}
