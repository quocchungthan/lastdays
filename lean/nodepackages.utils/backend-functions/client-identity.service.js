"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientIdentityService = void 0;
class ClientIdentityService {
    constructor(req) {
        this.req = req;
    }
    getUserIdentity() {
        return (this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress || '');
    }
}
exports.ClientIdentityService = ClientIdentityService;
