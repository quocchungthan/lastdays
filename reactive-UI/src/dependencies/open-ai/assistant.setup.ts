import OpenAI from 'openai';
import { promises as fsPromises } from 'fs';

export const readDrawingEventTypescriptSchemaAsync = async () => {
    try {
        const drawingEventSchema = await fsPromises.readFile('./src/dependencies/open-ai/DrawingEvents.feedable.ts', 'utf8');
        const point = await fsPromises.readFile('./src/ui-utilities/types/Point.ts', 'utf8');
        const dimension = await fsPromises.readFile('./src/ui-utilities/types/Dimension.ts', 'utf8');
        const board = await fsPromises.readFile('./src/app/services/data-storages/entities/Board.ts', 'utf8');
        const eventCode = await fsPromises.readFile('./src/app/events/drawings/EventCode.ts', 'utf8');
        const baseEvent = await fsPromises.readFile('./src/app/events/drawings/BaseEvent.ts', 'utf8');

        return [drawingEventSchema, "/* Point.ts */", point, "/* Dimension.ts */", dimension, "/* Board.ts */", board, "/* EventCode.ts */", eventCode, "/* BaseEvent.ts */" ,baseEvent].join('\n');
      } catch (err) {
        console.error('Error reading or parsing the file:', err);

        return "Error";
      }
}

export const createAssistantAsync = async (client: OpenAI) => {
    const assistant = await client.beta.assistants.create({
        name: "SM Who Draws",
        instructions: "You are a personal math tutor. Write and run code to answer math questions.",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4o"
    });
}