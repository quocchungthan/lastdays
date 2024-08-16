import { BaseEvent } from "../drawings/EventQueue";

export enum WSEventType {
    DRAWING_EVENT = "DRAWING_EVENT",
    CHAT = "CHAT_MESSAGE",
    ASK_OTHER_CLIENTS = "ASK_OTHER_CLIENTS",
    PARTICIPANTS_COUNT_UPDATE = "PARTICIPANTS_COUNT_UPDATE",
    OTHER_CLIENT_RESPONDED = "OTHER_CLIENT_RESPONDED"
}

export interface WSEvent {
    type: WSEventType;
    data: BaseEvent | string | undefined | BaseEvent[] | number;
}