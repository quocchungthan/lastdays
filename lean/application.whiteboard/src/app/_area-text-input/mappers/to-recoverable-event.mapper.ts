import Konva from "konva";
import { getBoardId } from "../../../utils/url.helper";
import { STROKE_WIDTH } from "../../../shared-configuration/size";
import { Point } from "../../../share-models/Point";
import { TextPastedEvent } from "../../../syncing-models/TextPastedEvent";

 export function ToRecoverableEvent(object: Konva.Text): TextPastedEvent {
   const event = new TextPastedEvent();
   event.name = object.name();  // The name of the text element
   event.color = object.stroke();  // Stroke color of the text (text outline color)
   event.boardId = getBoardId(location.href) ?? '';  // Board ID extracted from the URL
   event.position = { x: object.x(), y: object.y() };  // Position of the text element
   event.rotation = object.rotation();  // Rotation angle of the text element
   event.fontSize = object.fontSize();
   
   return event;
}


export function Recover(event: TextPastedEvent): Konva.Text {
   // Initialize a new Konva.Text object with properties from the event
   const konvaText = new Konva.Text({
      name: event.name,  // Set the name property
      text: event.name,  // Set the text to the name (this could be adjusted based on your needs)
      fill: event.color,  // Set the fill color (using the color from the event)
      x: event.position.x,  // Set the x position
      y: event.position.y,  // Set the y position
      rotation: event.rotation,  // Set the rotation angle
      fontFamily: 'Pacifico',  // Set the font family
      fontSize: event.fontSize,  // Default font size (can be adjusted)
      stroke: event.color,  // Set the stroke color (text outline)
      strokeWidth: STROKE_WIDTH,  // Stroke width (configured globally)
   });
   
   return konvaText;
}


export function Init(text: string, position: Point, color: string) {
   return new Konva.Text({
      x: position.x,
      y: position.y,
      fill: color,  // Set the text color
      fontFamily: 'Pacifico',  // Set the font family
      draggable: true,
      text,
      fontSize: 90,  // Default font size (can be adjusted)
      stroke: color,  // Set the stroke color (text outline)
      strokeWidth: STROKE_WIDTH,  // Stroke width (configured globally)
   });
}
