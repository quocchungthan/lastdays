import { Component, Input } from '@angular/core';
import { Problem } from './models/Problem';
import { testData } from './test-data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-break-down',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './break-down.component.html',
  styleUrl: './break-down.component.scss'
})
export class BreakDownComponent {
  @Input()
  data: Problem[] = testData;
}
