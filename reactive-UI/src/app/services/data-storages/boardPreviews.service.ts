import { Injectable } from '@angular/core';
import { CrudBaseService } from './crudbase.service';
import { BoardPreview } from './entities/BoardPreview';

@Injectable({
  providedIn: 'root'
})
export class BoardPreviewsService extends CrudBaseService<BoardPreview> {

  constructor() {
    super(BoardPreview);
  }

  saveOrUpdateByBoardId(boardId: string, previewDataUrl: string) {
   return this.detail(boardId)
      .then((preview) => {
         if (preview) {
            preview.previewDataUrl = previewDataUrl;

            return this.update(preview);
         } else {
            const bp = new BoardPreview();
            bp.id = boardId;
            bp.boardId = boardId;
            bp.previewDataUrl = previewDataUrl;

            return this.create(bp);
         }
      });
  }
}
