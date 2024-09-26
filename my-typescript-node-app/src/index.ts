import express from 'express';
import { loadSecretConfiguration } from '../../reactive-UI/src/dependencies/meta/configuration.serve';

const {port, useBackup, assistantEnabled, websocketEnabled, notionEnabled} = loadSecretConfiguration();

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();

  // Example Express Rest API endpoints
  // server.all('/api/**', (req, res) => { });
  server.get('/api/configuration', (req, res) => {
    res.status(200)
      .send({
        useBackup,
        port,
        assistantEnabled,
        websocketEnabled,
        notionEnabled
      } as MetaConfiguration)
  });

  if (assistantEnabled) {
    injectAssistantEndpoints(server);
  }

  if (notionEnabled) {
    injectTimesheetEndpoints(server);
  }

  return server;
}

function run(): void {

  // Start up the Node server
  const server = app();
  const httpServer = server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
  
  if (websocketEnabled) {
    injectWebSocket(httpServer);
  }
}

run();
