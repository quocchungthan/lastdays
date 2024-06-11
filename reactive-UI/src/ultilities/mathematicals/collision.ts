import { IRect } from "konva/lib/types";

export function areRectanglesIntersecting(rect1: IRect, rect2: IRect) {
    // Check if one rectangle is on the left side of the other
    if (rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x) {
        return false;
    }

    // Check if one rectangle is above the other
    if (rect1.y + rect1.height < rect2.y || rect2.y + rect2.height < rect1.y) {
        return false;
    }

    // If the above conditions are not met, the rectangles intersect
    return true;
}