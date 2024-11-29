"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrowPastedEvent = void 0;
const uuid_1 = require("uuid");
class ArrowPastedEvent {
    constructor() {
        this.timestamp = new Date().toUTCString();
        this.eventId = (0, uuid_1.v4)();
        this.boardId = (0, uuid_1.v4)();
        this.code = 'ArrowPastedEvent';
        this.start = { x: 0, y: 0 };
        this.end = { x: 0, y: 0 };
        this.color = '';
        this.name = '';
    }
}
exports.ArrowPastedEvent = ArrowPastedEvent;
