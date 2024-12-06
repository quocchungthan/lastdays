import express from 'express';
import { loadSecretConfiguration } from './configuration';
const server = express();

const port = loadSecretConfiguration().port;
const httpServer = server.listen(port, () => {
   console.log(`A sarcastic being! listening on http://localhost:${port}`);
});