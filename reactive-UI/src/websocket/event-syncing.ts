import { WebSocket } from 'ws';
import * as http from 'http';
import { WEB_SOCKET_PATH } from '../app/configs/routing.consants';

export const injectWebSocket = (server: http.Server) => {
    const wss = new WebSocket.Server({
        server: server,
        path: WEB_SOCKET_PATH
        // perMessageDeflate: {
        //   zlibDeflateOptions: {
        //     // See zlib defaults.
        //     chunkSize: 1024,
        //     memLevel: 7,
        //     level: 3
        //   },
        //   zlibInflateOptions: {
        //     chunkSize: 10 * 1024
        //   },
        //   // Other options settable:
        //   clientNoContextTakeover: true, // Defaults to negotiated value.
        //   serverNoContextTakeover: true, // Defaults to negotiated value.
        //   serverMaxWindowBits: 10, // Defaults to negotiated value.
        //   // Below options specified as default values.
        //   concurrencyLimit: 10, // Limits zlib concurrency for perf.
        //   threshold: 1024 // Size (in bytes) below which messages
        //   // should not be compressed if context takeover is disabled.
        // }
      });

  // WebSocket connection handling
  wss.on('connection', function connection(ws) {
    console.log('New WebSocket connection');

    // Handle messages from clients
    ws.on('message', function incoming(message) {
      console.log('Received:', message);
    });

    // Send a message to the client
    ws.send('Hello, WebSocket client!');
  });
  console.log("Injected");
}