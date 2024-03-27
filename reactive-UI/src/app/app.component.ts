import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { drawingJSON } from '../ultilities/painting/data-to-migrate';
import { TestKonvaNg2Component } from '../ultilities/painting/test-konva-ng2/test-konva-ng2.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TestKonvaNg2Component],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'reactive-ui';
  testData = drawingJSON;
}
