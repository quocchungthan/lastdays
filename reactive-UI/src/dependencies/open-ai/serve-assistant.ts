import express from 'express';
import { OPEN_AI_ENDPOINT_PREFIX } from '@config/routing.consants';
import { ConsoleLogger } from '@com/connection.manager';
import OpenAI from 'openai';
import { HttpStatusCode } from '@angular/common/http';
import { readDrawingEventTypescriptSchemaAsync, setupChatContextAsync } from './assistant.setup';
import { GenerateDrawingEvent } from './model/GenerateDrawingEvent.req';
import { loadSecretConfiguration } from '../meta/configuration.serve';

const secrets = loadSecretConfiguration();

const newOpenAiClient = () => {
    return new OpenAI({
        organization: secrets.openAI_OrganizationId,
        project: secrets.openAI_ProjectId,
        apiKey: secrets.openAI_Key
    });
}

// TODO: setup cors to block brute-forcing
export const injectAssistantEndpoints = (server: express.Express) => {
    const logger = new ConsoleLogger();
    logger.log(secrets.openAI_OrganizationId + ' ; ' + secrets.openAI_ProjectId + ' ; ' + secrets.openAI_Key);
    const openai = newOpenAiClient();
    const router = express.Router();
    server.use(express.json());
    router.post('/generate-drawing-event', async (req, res) => {
        try {
            const userMessage = (req.body as GenerateDrawingEvent).userMessage;
            logger.log("Received message: " + userMessage);
            /** With no history yet: TODO: one board one conversation history and the history */
            const chatCompleteAsync = await setupChatContextAsync(openai, secrets.openAI_ModelName);
            const response = await chatCompleteAsync(userMessage);
            const rawResponse = JSON.stringify(response.choices.map(x => x.message.content));
            logger.log(rawResponse);
            const allMessageContent = 
                "[" + response.choices.map((x => validateAndRemoveWrapper(x.message.content)))
                    .filter(x => !!x)
                    .join(',\n') + "]";
            logger.log("Choices's length: " + response.choices.length + "\n" + allMessageContent);
            res.status(HttpStatusCode.Ok)
                .setHeader('Content-Type', 'application/json')
                .send(allMessageContent)
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

function validateAndRemoveWrapper(jsonString: string | null) {
    if (!jsonString) {
        return "";
    }
    // Define the pattern for the wrapper and backticks
    const wrapperPattern = /^```json([\s\S]*?)```$/;

    // Check if the input matches the expected pattern
    const match = jsonString.match(wrapperPattern);

    if (match) {
        // Extract the JSON content from the match
        jsonString = match[1].trim();
    }

    // Attempt to parse the JSON content
    try {
        JSON.parse(jsonString);
        return jsonString;
    } catch (error) {
        return "";
    }
}