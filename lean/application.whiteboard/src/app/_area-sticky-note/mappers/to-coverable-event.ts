import Konva from 'konva';
import { Point } from '../../../share-models/Point';
import { getBoardId } from '../../../utils/url.helper';
import { SUPPORTED_COLORS } from '../../../shared-configuration/theme.constants';
import { v4 as uuidv4 } from 'uuid';
import { StickyNotePastedEvent } from '../../../syncing-models/StickyNotePastedEvent';

export function ToRecoverableEvent(object: Konva.Group): StickyNotePastedEvent {
  const event = new StickyNotePastedEvent();
   const identifiers = object.name().split(' ').filter((x) => x);
   if (identifiers[0] === 'sticky-note' && identifiers[1]) {
      event.name = object.name();
      event.eventId = identifiers[1];
   } else {
      // New added
      event.name = object.name() + ' ' + event.eventId;
   }
   event.boardId = getBoardId(location.href) ?? '';  // Board ID extracted from the URL
   event.position = { x: object.x(), y: object.y() };  // Position of the text element
   event.color = (object.children.filter(x => x instanceof Konva.Rect && x.hasName('background')).at(0) as Konva.Rect).fill();
   
   return event;
}

export function Recover(event: StickyNotePastedEvent) {
  event.color ??= SUPPORTED_COLORS[0];
  event.name ??= 'sticky-note ' + event.eventId;
  const konvaObject = Init(event.position, event.color as string);
  konvaObject.name(event.name);

  return konvaObject;
}
 
export function Init(position: Point, color: string) {
  const stickyNoteContainer = new Konva.Group({
    name: 'sticky-note ' + uuidv4(),
    x: position.x,
    y: position.y,
    draggable: true
  });

  const stickyNoteBackground = new Konva.Rect({
    width: 150,
    height: 150,
    fill: color,
    name: 'background',
    stroke: 'transparent',
    draggable: false,
  });

  stickyNoteContainer.add(stickyNoteBackground);

  return stickyNoteContainer;
}
