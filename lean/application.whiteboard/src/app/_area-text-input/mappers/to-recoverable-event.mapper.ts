import Konva from "konva";
import { getBoardId } from "../../../utils/url.helper";
import { Point } from "../../../share-models/Point";
import { TextPastedEvent } from "../../../syncing-models/TextPastedEvent";
import { SUPPORTED_COLORS } from "../../../shared-configuration/theme.constants";

 export function ToRecoverableEvent(object: Konva.Text): TextPastedEvent {
   const event = new TextPastedEvent();
   const identifiers = object.name().split(' ').filter((x) => x);
   if (identifiers[0] === 'text_input_tool' && identifiers[1]) {
      event.name = object.name();
      event.eventId = identifiers[1];
   } else {
      // New added
      event.name = object.name() + ' ' + event.eventId;
   }
   event.color = object.stroke();  // Stroke color of the text (text outline color)
   event.boardId = getBoardId(location.href) ?? '';  // Board ID extracted from the URL
   event.position = { x: object.x(), y: object.y() };  // Position of the text element
   event.rotation = object.rotation();  // Rotation angle of the text element
   event.fontSize = object.fontSize();
   event.text = object.text();
   
   return event;
}


export function Recover(event: TextPastedEvent): Konva.Text {
   // Initialize a new Konva.Text object with properties from the event
   event.color ??= SUPPORTED_COLORS[0];
   event.name ??= 'text_input_tool ' + event.eventId;
   const konvaText = Init(event.text, event.position, event.color as string);
   konvaText.name(event.name);
   konvaText.fill(event.color);
   konvaText.rotation(event.rotation);
   konvaText.fontSize(event.fontSize);
   konvaText.draggable(false);
   
   return konvaText;
}


export function Init(text: string, position: Point, color: string) {
   return new Konva.Text({
      x: position.x,
      y: position.y,
      fill: color,  // Set the text color
      fontFamily: '"Playwrite HR Lijeva", cursive',  // Set the font family
      draggable: true,
      text,
      name: 'text_input_tool',
      lineHeight: 1,
      fontSize: 70,  // Default font size (can be adjusted)
      stroke: color,  // Set the stroke color (text outline)
      fontStyle: 'normal',
      strokeWidth: 1,
   });
}
