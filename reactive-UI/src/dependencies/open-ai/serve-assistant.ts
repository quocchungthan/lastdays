import { DEFAULT_FAKE_VALUE } from '@config/default-value.constants';
import express from 'express';
import { OPEN_AI_ENDPOINT_PREFIX } from '@config/routing.consants';
import { ConsoleLogger } from '@com/connection.manager';
import OpenAI from 'openai';

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

export const injectAssistantEndpoints = (server: express.Express) => {
    const logger = new ConsoleLogger();
    logger.log(openAI_OrganizationId + ' ; ' + openAI_ProjectId + ' ; ' + openAI_Key);
    const openai = newOpenAiClient();

    server.post(OPEN_AI_ENDPOINT_PREFIX + '/generate-drawing-event', () => {

    });

    server.get(OPEN_AI_ENDPOINT_PREFIX + '/availability', async (req, res) => {
        try {
            const stream = await openai.chat.completions.create({
                model: openAI_ModelName,
                messages: [{ role: "user", content: "Say this is a test" }],
                stream: true,
            });
    
            // Handle streaming data
            for await (const chunk of stream) {
                // Check if chunk has choices and delta with content
                res.write(chunk.choices[0]?.delta?.content || "");
            }
    
            // End response when streaming is complete
            res.end();
        } catch (error: any) {
            if (!error) {
                res.status(500).send("Unknown error thrown by openai");
            } else if (error.response && error.response.status === 429) {
                // Return a 429 status code to the client
                res.status(429).send('Rate limit exceeded. Please try again later.');
            } else {
                // Handle other errors
                console.error('Error during OpenAI request:', error);
                res.status(500).send('An internal server error occurred.');
            }
        } finally {
            res.end();
        }
    });
}