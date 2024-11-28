import Konva from "konva";
import { ObjectDeltionEvent } from "../../../syncing-models/ObjectDeletionEvent";
import { getBoardId } from "../../../utils/url.helper";

export function ToRecoverableEvent(object: Konva.Shape | Konva.Group): ObjectDeltionEvent {
   const event = new ObjectDeltionEvent();
   const objectId = object.name().split(' ').filter(x => x)[1];
   event.target = objectId;
   event.boardId = getBoardId(location.href) ?? '';

   return event;
}