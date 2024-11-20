import express from 'express';
import { FlashCardAssistantService } from "./openai.assistant.service";
import { EnglishWordStorageService } from "./notion.storage.service";
import { CacheService } from './cache.service';
import { serve as serveForwarding } from './serve.forward-request';

export function serve(server: express.Express) {
   const router = express.Router();
   server.use(express.json());
   const assistant = new FlashCardAssistantService();
   const cache = new CacheService();
   serveForwarding(server);
   router.get('/question', async (req, res) => {
      const storage = new EnglishWordStorageService(req, cache);

      const data = await storage.fetchAsync();
      res.json(await assistant.generateRandomQuestion(data.primitiveItems, data.pureHtmlContent, 3))
         .status(200)
         .end();
   });

   server.use('/api/assistant', router);
}