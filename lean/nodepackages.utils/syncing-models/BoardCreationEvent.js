"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardCreationEvent = void 0;
const uuid_1 = require("uuid");
class BoardCreationEvent {
    constructor() {
        this.timestamp = new Date().toUTCString();
        this.eventId = (0, uuid_1.v4)();
        this.boardId = (0, uuid_1.v4)();
        this.code = 'BoardCreationEvent';
    }
}
exports.BoardCreationEvent = BoardCreationEvent;
