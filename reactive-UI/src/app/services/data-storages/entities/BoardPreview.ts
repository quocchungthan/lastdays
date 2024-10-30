import { BaseEntity } from "./Base.entity";

export class BoardPreview extends BaseEntity {
   public boardId: string = '';

   public previewDataUrl: string = '/assets/default-preview-pic.jpg';
}