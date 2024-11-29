import express from 'express';
import cors from 'cors';
import { SM_ASSISTANT_ROUTE, SM_ASSISTANT_SUGGESTION_ROUTE } from '@cbto/nodepackages.utils/constants/routing.consants';
import { loadSecretConfiguration } from './configuration';
import { SuggestionRequestBody } from './suggestion.req';
import { OpenAIService } from './openai.service';

export function serveSMAssistant(server: express.Express) {
   const router = express.Router();
   server.use(express.json());
   router.use(cors({
      origin: loadSecretConfiguration().cors
   }));

   router.post(SM_ASSISTANT_SUGGESTION_ROUTE, async (req, res) => {
      const payload = req.body as SuggestionRequestBody;
      const service = new OpenAIService();
      const eventsGenerated = await service.suggestsEventAsync(payload.userPrompt, payload.area, payload.threadId);

      res.json(eventsGenerated)
         .status(200)
         .end();
   });

   server.use(SM_ASSISTANT_ROUTE, router);
}