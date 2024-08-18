import OpenAI from 'openai';
import { promises as fsPromises } from 'fs';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { BaseEvent } from '@drawings/BaseEvent';
import { loadSecretConfiguration } from '../meta/configuration.serve';
import { dependenciesPool } from '../dependencies.pool';

const secrets = loadSecretConfiguration();

export const readDrawingEventTypescriptSchemaAsync = async () => {
    try {
        const drawingEventSchema = await fsPromises.readFile('./src/dependencies/open-ai/DrawingEvents.feedable.ts', 'utf8');
        const point = await fsPromises.readFile('./src/ui-utilities/types/Point.ts', 'utf8');
        const dimension = await fsPromises.readFile('./src/ui-utilities/types/Dimension.ts', 'utf8');
        const board = await fsPromises.readFile('./src/app/services/data-storages/entities/Board.ts', 'utf8');
        const eventCode = await fsPromises.readFile('./src/app/events/drawings/EventCode.ts', 'utf8');
        const baseEvent = await fsPromises.readFile('./src/app/events/drawings/BaseEvent.ts', 'utf8');
        const supportedColors = await fsPromises.readFile('./src/configs/theme.constants.ts', 'utf8');
        const size = await fsPromises.readFile('./src/configs/size.ts', 'utf8');

        return ["/* This is the schema of DrawingEvent you must follow accurately: */", drawingEventSchema, "/* Point.ts */", point, "/* Dimension.ts */", dimension, "/* Board.ts */", board, "/* EventCode.ts */", eventCode,
            "/* BaseEvent.ts */", baseEvent,
            "/* theme.constants.ts */", supportedColors,
            "/* size.ts */", size].join('\n');
    } catch (err) {
        console.error('Error reading or parsing the file:', err);

        return "Error";
    }
}

export const readFeedingMarkdownAsync = async (markdownFile: string) => {
    try {
        const systemPrompt = await fsPromises.readFile(`./src/dependencies/open-ai/feeding/${markdownFile}.md`, 'utf8');

        return systemPrompt;
    } catch (err) {
        console.error('Error reading or parsing the file:', err);

        return "Error";
    }
}


export const readSystemPromptAsync = async () => {
    const systemPromptSignature = secrets.systemPromptUsed;
    return readFeedingMarkdownAsync(`SystemPrompt${systemPromptSignature}`);
}

export const readUserInstructionAsync = async () => {
    const systemPromptSignature = secrets.userInstructionUsed;
    return readFeedingMarkdownAsync(`UserInstruction${systemPromptSignature}`);
}

// export const createAssistantAsync = async (client: OpenAI, modelName: string) => {
//     const assistant = await client.beta.assistants.create({
//         name: "SM Who Draws",
//         instructions: "You are a personal math tutor. Write and run code to answer math questions.",
//         tools: [{ type: "code_interpreter" }],
//         model: modelName
//     });
// }

export const setupChatContextAsync = async (client: OpenAI, modelName: string) => {
    const conversationHistory: ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: await readSystemPromptAsync()
        },
        {
            role: 'system',
            content: await readDrawingEventTypescriptSchemaAsync()
        },
        {
            role: 'user',
            content: await readUserInstructionAsync()
        },
    ];

    // Get response from the assistant


    return async (newMesage: string, existingEvents: BaseEvent[] = []) => {
        if (!!existingEvents.length) {
            conversationHistory.push({ role: 'user', content: `Existing drawing events: ${JSON.stringify(existingEvents)}` });
        }
        // TODO: add assistant message if it returns in the previous rounds?

        // Add user message to the conversation history
        conversationHistory.push({ role: 'user', content: newMesage });
        dependenciesPool.logger().log("Sending request to OpenAI");
        return await client.chat.completions.create({
            model: modelName,
            messages: conversationHistory,
            max_tokens: secrets.openAI_MaxToken,
            temperature: 0.7,
        });
    }
}