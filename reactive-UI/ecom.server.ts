import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.ecom.server';
import { pool } from './src/app-ecom/core';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);
  
  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  serveAllRoutesUseTheAngularEngine(server, commonEngine, indexHtml, browserDistFolder);

  return server;
}

function serveAllRoutesUseTheAngularEngine(server: express.Express, commonEngine: CommonEngine, indexHtml: string, browserDistFolder: string) {
  server.get('*', async (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    try {
      const html = await commonEngine.render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      });

      pool.getMetaRepository().getAllAsync()
         .then((metas) => {
            const pageTitle = metas.filter(x => x.name === 'default title')[0].content;
            // Add meta tag for the /home route
            if (originalUrl === '/home') {
               const metaTag = '<meta name="modified-by-ssr" content="true">';
               // Inject the meta tag before the closing </head> tag
               const modifiedHtml = html.replace('</head>', `${metaTag}</head>`)
                  .replace('<title>Agile Link - Simplicity is essential</title>', `<title>${pageTitle}</title>`);
               res.send(modifiedHtml);
            } else {
               res.send(html);
            }
         });

    } catch (err) {
      next(err);
    }
  });
}

function run(): void {

  // Start up the Node server
  const server = app();
  const port = pool.getSecret().port;
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
