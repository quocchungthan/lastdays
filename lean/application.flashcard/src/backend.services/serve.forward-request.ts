import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { loadSecretConfiguration } from './configuration';

export function serve(server: express.Express) {
   server.use('/api/portal', createProxyMiddleware({
      target: loadSecretConfiguration().Storage_AlPortalBaseUrl + '/api/portal',
      changeOrigin: true,
      secure: false,
      logger: console,
    }));
}