import express from 'express';
import { injectWebSocket } from './socket-communication/server-event-syncing';
import { serveSMAssistant } from './sm-assistant';
const server = express();

const port = process.env['PORT'] || 4014;
serveSMAssistant(server);
const httpServer = server.listen(port, () => {
   console.log(`Node Express server listening on http://localhost:${port}`);
 });
 
injectWebSocket(httpServer);