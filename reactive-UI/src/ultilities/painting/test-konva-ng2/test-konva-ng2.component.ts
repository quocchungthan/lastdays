import { Component, Input } from '@angular/core';
import { DrawingBearer } from '../communication-objects/DrawingObject.fabric';

@Component({
  selector: 'test-konva-ng2',
  standalone: true,
  imports: [],
  templateUrl: './test-konva-ng2.component.html',
  styleUrl: './test-konva-ng2.component.scss'
})
export class TestKonvaNg2Component {
  @Input()
  data: DrawingBearer = {
    version: '1.1.1',
    objects: [],
    height: 0,
    width: 0,
  };
}
