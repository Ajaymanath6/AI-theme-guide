import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseResultsComponent } from '../../../components/case-results/case-results.component';
import { SideFilterComponent } from '../../../components/side-filter/side-filter.component';

@Component({
  selector: 'app-case-results-layout',
  imports: [CommonModule, CaseResultsComponent, SideFilterComponent],
  templateUrl: './case-results-layout.component.html',
  styleUrl: './case-results-layout.component.scss'
})
export class CaseResultsLayoutComponent {

}
