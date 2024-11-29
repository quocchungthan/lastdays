"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PencilUpEvent = void 0;
const uuid_1 = require("uuid");
const theme_constants_1 = require("../constants/theme.constants");
class PencilUpEvent {
    constructor() {
        this.timestamp = new Date().toUTCString();
        this.eventId = (0, uuid_1.v4)();
        this.boardId = (0, uuid_1.v4)();
        this.code = 'PencilUpEvent';
        this.color = theme_constants_1.SUPPORTED_COLORS[0];
        this.points = [];
        this.name = '';
    }
}
exports.PencilUpEvent = PencilUpEvent;
