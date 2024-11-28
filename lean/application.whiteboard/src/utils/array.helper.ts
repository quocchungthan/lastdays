import { Point } from "../share-models/Point";

export function pointsToCoordinations(points: number[]) {
   return points.reduce((previous, current, index) => (
      index % 2 === 0 ? [...previous, { x: current, y: points[index + 1] } as Point] : previous
    ), [] as Point[])
}

export function calculateDistance(p1: Point, p2: Point): number {
   return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
 }