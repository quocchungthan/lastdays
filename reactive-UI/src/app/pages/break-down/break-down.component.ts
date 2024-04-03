import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-break-down',
  standalone: true,
  imports: [],
  templateUrl: './break-down.component.html',
  styleUrl: './break-down.component.scss'
})
export class BreakDownComponent {
  @Input()
  data: [] = [];
}
