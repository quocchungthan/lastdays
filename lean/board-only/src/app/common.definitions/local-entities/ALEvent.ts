import { BaseEntity } from "./BaseEntity";

export interface ALEvent extends BaseEntity {
   code: 'BoardCreated';
   boardId: string;
}