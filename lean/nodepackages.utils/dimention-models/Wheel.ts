import { Point } from "../dimention-models/Point";

export interface Wheel {
    cursor: Point | null;
    direction: 1 | -1;
}