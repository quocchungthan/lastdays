import express from 'express';
import cors from 'cors';
import { SM_ASSISTANT_ROUTE, SM_ASSISTANT_SUGGESTION_ROUTE } from '@cbto/nodepackages.utils/constants/routing.consants';
import { loadSecretConfiguration } from './configuration';
import { SuggestionRequestBody } from './suggestion.req';

export function serveSMAssistant(server: express.Express) {
   const router = express.Router();
   server.use(express.json());
   router.use(cors({
      origin: loadSecretConfiguration().cors
   }));

   router.post(SM_ASSISTANT_SUGGESTION_ROUTE, (req, res) => {
      const payload = req.body as SuggestionRequestBody;
   });

   server.use(SM_ASSISTANT_ROUTE, router);
}