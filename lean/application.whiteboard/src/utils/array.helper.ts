import { Point } from "../share-models/Point";

export function pointsToCoordinations(points: number[]) {
   return points.reduce((previous, current, index) => (
      index % 2 === 0 ? [...previous, { x: current, y: points[index + 1] } as Point] : previous
    ), [] as Point[])
}