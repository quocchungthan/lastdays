import express from 'express';
import { OpenAIService } from '../sm-assistant/openai.service';
import { QuestionRequestPayload } from './question.req';

export const ENGLISH_ASSISTANT_ROUTE = '/api/english-assistant/';
export const ENGLISH_ASSISTANT_SUGGESTION_ROUTE = '/question';

export function serveEnglishAssistant(server: express.Express) {
   const router = express.Router();
   server.use(express.json());

   router.post(ENGLISH_ASSISTANT_SUGGESTION_ROUTE, async (req, res) => {
      const payload = req.body as QuestionRequestPayload;
      const service = new OpenAIService();
      const generatedQuestion = await service.askAboutEnglishAsync(payload.userPrompt, payload.threadId);

      res.json(generatedQuestion)
         .status(200)
         .end();
   });

   server.use(ENGLISH_ASSISTANT_ROUTE, router);
}