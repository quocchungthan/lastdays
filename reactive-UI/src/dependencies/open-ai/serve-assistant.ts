import { DEFAULT_FAKE_VALUE } from '@config/default-value.constants';
import express from 'express';
import { OPEN_AI_ENDPOINT_PREFIX } from '@config/routing.consants';
import { ConsoleLogger } from '@com/connection.manager';
import OpenAI from 'openai';
import { HttpStatusCode } from '@angular/common/http';
import { readDrawingEventTypescriptSchemaAsync, setupChatContextAsync } from './assistant.setup';
import { GenerateDrawingEvent } from './model/GenerateDrawingEvent.req';

const openAI_Key = process.env['OPENAI_API_KEY'] ?? DEFAULT_FAKE_VALUE;
const openAI_OrganizationId = process.env['OPENAI_ORGANIZATION_ID'] ?? DEFAULT_FAKE_VALUE;
const openAI_ProjectId = process.env['OPENAI_PROJECT_ID'] ?? DEFAULT_FAKE_VALUE;
const openAI_ModelName = process.env['OPENAI_MODEL_NAME'] ?? DEFAULT_FAKE_VALUE;

const newOpenAiClient = () => {
    return new OpenAI({
        organization: openAI_OrganizationId,
        project: openAI_ProjectId,
        apiKey: openAI_Key
    });
}

// TODO: setup cors to block brute-forcing
export const injectAssistantEndpoints = (server: express.Express) => {
    const logger = new ConsoleLogger();
    logger.log(openAI_OrganizationId + ' ; ' + openAI_ProjectId + ' ; ' + openAI_Key);
    const openai = newOpenAiClient();
    const router = express.Router();
    server.use(express.json());
    router.post('/generate-drawing-event', async (req, res) => {
        try {
            const userMessage = (req.body as GenerateDrawingEvent).userMessage;
            logger.log("Received message: " + userMessage);
            /** With no history yet: TODO: one board one conversation history and the history */
            const chatCompleteAsync = await setupChatContextAsync(openai, openAI_ModelName);
            const response = await chatCompleteAsync(userMessage);

            res.status(HttpStatusCode.Ok)
                .setHeader('Content-Type', 'application/json')
                .send(response.choices[0].message)
                .end();
        } catch (e) {
            logger.log(JSON.stringify(e));
            res.status(HttpStatusCode.InternalServerError).end();
        }
    });

    router.get('/ts-schema', async (req, res) => {
        res.status(HttpStatusCode.Ok)
            .setHeader('Content-Type', 'text/typescript')
            .send(await readDrawingEventTypescriptSchemaAsync())
            .end();
    });

    server.use(OPEN_AI_ENDPOINT_PREFIX, router);
}