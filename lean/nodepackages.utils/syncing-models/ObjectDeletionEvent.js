"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectDeltionEvent = void 0;
const uuid_1 = require("uuid");
class ObjectDeltionEvent {
    constructor() {
        this.timestamp = new Date().toUTCString();
        this.eventId = (0, uuid_1.v4)();
        this.boardId = (0, uuid_1.v4)();
        this.code = 'ObjectDeltionEvent';
        this.target = '';
    }
}
exports.ObjectDeltionEvent = ObjectDeltionEvent;
