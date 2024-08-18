import { BaseEntity } from '@uidata/entities/Base.entity';

export class BaseEvent extends BaseEntity {
    createdByUserId: string = '';
    boardId: string = '';

    constructor(itself?: BaseEvent) {
        super();
        if (!itself) {
            return;
        }

        if (typeof(itself.modifiedTime) === 'string') {
          this.modifiedTime = new Date(Date.parse(itself.modifiedTime));
        } else {
          this.modifiedTime = itself.modifiedTime;
        }
        this.boardId = itself.boardId;
        this.createdByUserId = itself.createdByUserId;
        this.id = itself.id;
        
    }
}