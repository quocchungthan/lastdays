import { Request } from 'express';
export class ClientIdentityService {
  constructor(private req: Request) {}

  getUserIdentity() {
    return (
      this.req.headers['x-forwarded-for'] as string || this.req.connection.remoteAddress || ''
    );
  }
}
