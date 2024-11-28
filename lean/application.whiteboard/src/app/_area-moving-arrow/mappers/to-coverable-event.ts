import Konva from 'konva';
import { Point } from '../../../share-models/Point';
import { ArrowPastedEvent } from '../../../syncing-models/ArrowPastedEvent';
import { getBoardId } from '../../../utils/url.helper';

export function ToRecoverableEvent(object: Konva.Arrow): ArrowPastedEvent {
  const event = new ArrowPastedEvent();
  const identifiers = object
    .name()
    .split(' ')
    .filter((x) => x);
  if (identifiers[0] === 'moving-arrow' && identifiers[1]) {
    event.name = object.name();
    event.eventId = identifiers[1];
  } else {
    // New added
    event.name = object.name() + ' ' + event.eventId;
  }
  object.name(event.name);
  event.start = { x: object.points()[0], y: object.points()[1] };
  event.end = { x: object.points()[2], y: object.points()[3] };
  event.name = object.name();
  event.color = object.stroke();
  event.boardId = getBoardId(location.href) ?? '';

  return event;
}

export function Recover(event: ArrowPastedEvent) {
  const konvaObject = Init(event.start, event.color as string);
  konvaObject.points([event.start.x, event.start.y, event.end.x, event.end.y]);
  konvaObject.name(event.name);
  startAnimation(konvaObject); // Start the animation loop

  return konvaObject;
}

function startAnimation(konvaObject: Konva.Arrow) {
   // Set initial dash pattern
   const dashPattern = [10, 5]; // Customize dash pattern
   konvaObject.dash(dashPattern);
 
   let dashOffset = 0; // Initial dash offset
 
   // Set up the animation for the dash pattern to move forward infinitely
   const animation = new Konva.Animation((frame) => {
     // Increment dash offset continuously to make it move forward
     dashOffset -= 1; // You can adjust this value for speed
 
     // Apply the updated dash offset to create the flowing effect
     konvaObject.dashOffset(dashOffset);
 
     // When the dashOffset exceeds the length of the dash pattern, reset it to create an infinite loop
     const dashPatternLength = dashPattern[0] + dashPattern[1]; // Total length of dash pattern
     if (dashOffset > dashPatternLength) {
       dashOffset = 0; // Reset dashOffset to 0 to loop the animation
     }
   }, konvaObject.getLayer());
 
   animation.start(); // Start the animation loop
 }
 
export function Init(position: Point, color: string) {
  const arrow = new Konva.Arrow({
    name: 'moving-arrow',
    points: [position.x, position.y, position.x, position.y], // Start and end point are the same initially
    pointerLength: 10, // Arrow head length
    pointerWidth: 10, // Arrow head width
    stroke: color, // Set the arrow color
    strokeWidth: 3, // Arrow line width
    dash: [8, 10],
  });

  return arrow;
}
