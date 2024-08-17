import { Component, Input } from '@angular/core';

@Component({
  selector: 'warning-box',
  standalone: true,
  imports: [],
  templateUrl: './warning-box.component.html',
  styleUrl: './warning-box.component.scss'
})
export class WarningBoxComponent {
  @Input()
  warningMessage: string = '';
}
