import { DEFAULT_FAKE_VALUE } from '@config/default-value.constants';
import express from 'express';
import { OPEN_AI_ENDPOINT_PREFIX } from '@config/routing.consants';
import { ConsoleLogger } from '@com/connection.manager';

const openAI_Key = process.env['OPENAI_API_KEY'] ?? DEFAULT_FAKE_VALUE;

export const injectAssistantEndpoints = (server: express.Express) => {
    const logger = new ConsoleLogger();
    logger.log(openAI_Key);
    server.post(OPEN_AI_ENDPOINT_PREFIX + '/generate-drawing-event', () => {

    });
}