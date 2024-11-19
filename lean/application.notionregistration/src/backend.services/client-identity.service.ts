export class ClientIdentityService {
   constructor(private req: Express.Request) {

   }

   getUserIdentity() {
      // @ts-ignore
      return this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress;
   }
}