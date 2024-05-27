import { Component, Input } from '@angular/core';
import { BoardBasicData } from '../../viewmodels/agile-domain/last-visits.viewmodel';
import { DatePipe } from '@angular/common';
import { SEGMENT_TO_BOARD_DETAIL } from '../../configs/routing.consants';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-board-grid',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './board-grid.component.html',
  styleUrl: './board-grid.component.scss'
})
export class BoardGridComponent {
  @Input()
  boardList: BoardBasicData[] = [];
  SEGMENT_TO_BOARD_DETAIL = SEGMENT_TO_BOARD_DETAIL;
}
