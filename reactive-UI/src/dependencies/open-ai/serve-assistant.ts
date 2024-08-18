import express from 'express';
import { GENERATE_DRAWING_EVENTS, OPEN_AI_ENDPOINT_PREFIX } from '@config/routing.consants';
import { ConsoleLogger } from '@com/connection.manager';
import OpenAI from 'openai';
import { HttpStatusCode } from '@angular/common/http';
import { readDrawingEventTypescriptSchemaAsync, setupChatContextAsync } from './assistant.setup';
import { GenerateDrawingEvent } from './model/GenerateDrawingEvent.req';
import { loadSecretConfiguration } from '../meta/configuration.serve';
import { dependenciesPool } from '../dependencies.pool';
import { Condition, IBackupService } from '../meta/backup-storage.inteface';
import { CachedResponse } from './model/CachedResponse.entity';
import { DEFAULT_FAKE_VALUE } from '@config/default-value.constants';
import BackupWithJsonFileService from './backup/backup-json-file';

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
    if ([secrets.openAI_OrganizationId, secrets.openAI_ProjectId, secrets.openAI_Key].some(x => x === DEFAULT_FAKE_VALUE)) {
        throw new Error("Please set up the environment variable for openAI_OrganizationId, openAI_ProjectId, openAI_Key and restart the application");
    }
    const openai = newOpenAiClient();
    const router = express.Router();
    server.use(express.json());
    router.post(GENERATE_DRAWING_EVENTS, async (req, res) => {
        try {
            const userMessage = (req.body as GenerateDrawingEvent).userMessage;
            logger.log("Received message: " + userMessage);
            const allMessageContent = await resolveReceivedMessageAsync(userMessage, openai, logger);

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

    router.get('/cached-user-messages', async (req, res) => {
        const cachedService = dependenciesPool.backup();
        res.status(HttpStatusCode.Ok)
            .setHeader('Content-Type', 'text/typescript')
            .send(cachedService && cachedService instanceof BackupWithJsonFileService ? (await cachedService.getAllAsync()).map(x => x.userMessage) : [])
            .end();
    });

    server.use(OPEN_AI_ENDPOINT_PREFIX, router);
}

async function resolveReceivedMessageAsync(userMessage: string, openai: OpenAI, logger: ConsoleLogger) {
    const cacheService = dependenciesPool.backup();
    const cachedResponse = await cacheService.getAsync([
        {
            // userMessage of entity CachedResponse
            fieldName: "userMessage",
            condition: Condition.EQUAL,
            value: userMessage
        }
    ]);
    /** With no history yet: TODO: one board one conversation history and the history */
    const chatCompleteAsync = await setupChatContextAsync(openai, secrets.openAI_ModelName);
    const rawResponse = cachedResponse?.assistantResponse || JSON.stringify((await chatCompleteAsync(userMessage)).choices.map(x => x.message.content));
    logger.log(rawResponse);
    const allMessageContent = (JSON.parse(rawResponse) as string[]).map((x => validateAndRemoveWrapper(x)))
        .filter(x => !!Object.keys(x).length);
    logger.log("Choices's length: " + JSON.parse(rawResponse).length);
    if (!cachedResponse) {
        await cacheResponse(rawResponse, userMessage, cacheService);
    }
    return allMessageContent;
}

async function cacheResponse(rawResponse: string, userMessage: string, cacheService: IBackupService<CachedResponse>) {
    const fetchVersionFromItself = await fetch(`http://localhost:${secrets.port}/assets/git-info.json`);
    const sourceVersion = (await (fetchVersionFromItself).json()).hash;
    const toStore = {
        assistantResponse: rawResponse,
        appVersion: sourceVersion,
        modelName: secrets.openAI_ModelName,
        systemPromptVersion: secrets.systemPromptUsed,
        userMessage: userMessage,
        createdTime: new Date()
    };
    await cacheService.storeAsync(toStore);
}

function validateAndRemoveWrapper(jsonString: string | null): object {
    if (!jsonString) {
        return {};
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
        return JSON.parse(jsonString);
    } catch (error) {
        return {};
    }
}