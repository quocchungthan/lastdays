import { UserIdentity } from '../../services/data-storages/entities/Identity';
import { BaseEvent } from "../drawings/EventQueue";

export enum WSEventType {
    DRAWING_EVENT = "DRAWING_EVENT",
    CHAT = "CHAT_MESSAGE",
    ASK_OTHER_CLIENTS = "ASK_OTHER_CLIENTS",
    SAY_HELLO = "SAY_HELLO",
    PARTICIPANTS_COUNT_UPDATE = "PARTICIPANTS_COUNT_UPDATE",
    OTHER_CLIENT_RESPONDED = "OTHER_CLIENT_RESPONDED"
}

export interface SayHelloEventData {
    user: UserIdentity;
}

export interface WSEvent {
    type: WSEventType;
    data: BaseEvent | string | undefined | BaseEvent[] | number | SayHelloEventData;
}