import Konva from "konva";
import { BaseEntity } from "./Base.entity";

export class DrawingObject extends BaseEntity {
    public boardId: string = '';
    public konvaObject?: Konva.Shape | Konva.Group;
}
