export enum WSEventType {
    DRAWING_EVENT = "DRAWING_EVENT",
    CHAT = "CHAT_MESSAGE",
    ASK_OTHER_CLIENTS = "ASK_OTHER_CLIENTS",
    SAY_HELLO = "SAY_HELLO",
    PARTICIPANTS_COUNT_UPDATE = "PARTICIPANTS_COUNT_UPDATE",
    OTHER_CLIENT_RESPONDED = "OTHER_CLIENT_RESPONDED"
}

export interface SayHelloEventData {
    // TODO: use the common package
    user: any;
}

export interface ChatTextEventData {
    text: string;
    displayName: string;
}

export interface WSEvent {
    type: WSEventType;
    // TODO: use the common package
    data: any;
}