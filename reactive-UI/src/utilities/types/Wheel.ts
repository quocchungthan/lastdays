import { Point } from "./Point";

export interface Wheel {
    cursor: Point | null;
    direction: 1 | -1;
}