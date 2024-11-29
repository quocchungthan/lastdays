"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextPastedEvent = void 0;
const uuid_1 = require("uuid");
const theme_constants_1 = require("../constants/theme.constants");
class TextPastedEvent {
    constructor() {
        this.timestamp = new Date().toUTCString();
        this.eventId = (0, uuid_1.v4)();
        this.boardId = (0, uuid_1.v4)();
        this.code = 'TextPastedEvent';
        this.color = theme_constants_1.SUPPORTED_COLORS[0];
        this.name = '';
        this.text = '';
        this.rotation = 0;
        this.position = { x: 0, y: 0 };
        this.fontSize = 18;
    }
}
exports.TextPastedEvent = TextPastedEvent;
