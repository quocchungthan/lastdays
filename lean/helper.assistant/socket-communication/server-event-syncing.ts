import WebSocket, { WebSocketServer } from 'ws';
import * as http from 'http';
import { ConnectionManager, ConsoleLogger } from './connection.manager';

export const SEGMENT_TO_BOARD_DETAIL = 'board';
export const SEGMENT_TO_IDENTITY_PAGE = 'identity';
export const WEB_SOCKET_PATH = '/ws';
export const OPEN_AI_ENDPOINT_PREFIX = '/api/open-ai';

export const GENERATE_DRAWING_EVENTS = '/generate-drawing-event';
export const DESCRIBE_DRAWING_EVENT = '/describe-event';

export const injectWebSocket = (server: http.Server) => {
    const logger = new ConsoleLogger();
    const connectionManager = new ConnectionManager(logger);
    const wss = new WebSocketServer({
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
  wss.on('listening', () => {
    logger.log('Start listening');
  });
  wss.on('error', (e) => {
    logger.log('Error ' + JSON.stringify(e));
  });
  wss.on('headers', (e) => {
    logger.log('Headers ' + JSON.stringify(e));
  });
  // WebSocket connection handling
  wss.on('connection', function connection(ws, req: http.IncomingMessage) {
    // Extract board_id from URL if applicable
    const boardId = extractBoardIdFromUrl(`http://${req.headers.host}` + (req.url || ''));
    if (!boardId) {
      logger.log('Ignore the connection without board id');
      return;
    }

    connectionManager.connect(boardId, ws);
    
    // Handle messages from clients
    ws.on('message', async (message: WebSocket.MessageEvent) => {
      await connectionManager.toBoardUsers(boardId, message.toString(), ws);
    });

    ws.on('close', async () => {
      connectionManager.disconnect(ws);
      await connectionManager.updateParticipationsCount(boardId);
    });
  });
  // logger.log("Injected");
}

// Extract board_id from URL (this is an example; adjust as needed)
function extractBoardIdFromUrl(url: string) {
  return new URL(url).searchParams.get(SEGMENT_TO_BOARD_DETAIL);
}
