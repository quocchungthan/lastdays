import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BoardBasicData } from '../../viewmodels/agile-domain/last-visits.viewmodel';
import { DatePipe } from '@angular/common';
import { SEGMENT_TO_BOARD_DETAIL } from '../../../configs/routing.consants';
import { RouterModule } from '@angular/router';
import { BoardPreview } from '@uidata/entities/BoardPreview';
import { ExtendedSimpleChanges } from '@ui/types/type-simple-changes';
import { BoardPreviewsService } from '@uidata/boardPreviews.service';

@Component({
  selector: 'app-board-grid',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './board-grid.component.html',
  styleUrl: './board-grid.component.scss'
})
export class BoardGridComponent implements OnChanges {
  @Input()
  boardList: BoardBasicData[] = [];
  SEGMENT_TO_BOARD_DETAIL = SEGMENT_TO_BOARD_DETAIL;

  constructor(private _boardPreviews: BoardPreviewsService) {
  }
  ngOnChanges(changes: ExtendedSimpleChanges<BoardGridComponent>): void {
    if (changes.boardList) {
      this._updateBoardPreviewPictures();
    }
  }

  private _updateBoardPreviewPictures() {
    this.boardList.forEach(boardItem => {
      this._boardPreviews.detail(boardItem.id)
        .then((preview) => {
          if (!preview) {
            return;
          }

          boardItem.previewUrl = preview.previewDataUrl;
        });
    });
  }
}
