import { IEventGeneral } from "@cbto/nodepackages.utils/syncing-models/EventGeneral.interface";
import { loadSecretConfiguration } from "./configuration";
import { Dimension } from "@cbto/nodepackages.utils/dimention-models/Dimension";
import { Point } from "@cbto/nodepackages.utils/dimention-models/Point";
import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";

const secrets = loadSecretConfiguration();

const newOpenAiClient = () => {
   return new OpenAI({
       organization: secrets.openAI_OrganizationId,
       project: secrets.openAI_ProjectId,
       apiKey: secrets.openAI_Key
   });
};

async function createAssistant(openai: OpenAI) {
  // Step 1: Create an Assistant with detailed instructions about event types
  const myAssistant = await openai.beta.assistants.create({
      model: secrets.openAI_ModelName,
      instructions: `
      You are a personal Scrum Master assistant. Given the area and the user prompt, you will suggest relevant scrum events and place them within the whiteboard area.
      The following event types are available:

      1. **ArrowPastedEvent**:
         Represents an arrow drawn on the board. It has a start and end point, a color, and a name.
         \`\`\`
         class ArrowPastedEvent implements IEventGeneral {
            timestamp: string | Date = new Date().toUTCString();
            eventId: string = uuidv4();
            boardId: string = uuidv4();
            code: string = 'ArrowPastedEvent';
            start: Point = { x: 0, y: 0 };
            end: Point = { x: 0, y: 0 };
            color: string | CanvasGradient = '';
            name: string = '';
         }
         \`\`\`

      2. **BoardCreationEvent**:
         Represents a board creation event. It includes a timestamp and event ID.
         \`\`\`
         class BoardCreationEvent implements IEventGeneral {
            timestamp: string | Date = new Date().toUTCString();
            eventId: string = uuidv4();
            boardId: string = uuidv4();
            code: string = 'BoardCreationEvent';
         }
         \`\`\`

      3. **ObjectDeletionEvent**:
         Represents an object deletion event. It includes a target object ID.
         \`\`\`
         class ObjectDeletionEvent implements IEventGeneral {
            timestamp: string | Date = new Date().toUTCString();
            eventId: string = uuidv4();
            boardId: string = uuidv4();
            code: string = 'ObjectDeletionEvent';
            target: string = '';
         }
         \`\`\`

      4. **PencilUpEvent**:
         Represents a pencil-up event where the user stops drawing. It includes the color used and an array of points (positions).
         \`\`\`
         class PencilUpEvent implements IEventGeneral {
            timestamp: string | Date = new Date().toUTCString();
            eventId: string = uuidv4();
            boardId: string = uuidv4();
            code: string = 'PencilUpEvent';
            color: string | CanvasGradient = SUPPORTED_COLORS[0];
            points: Point[] = [];
            name: string = '';
         }
         \`\`\`

      5. **TextPastedEvent**:
         Represents a text event. It includes text content, font size, rotation, and color.
         \`\`\`
         class TextPastedEvent implements IEventGeneral {
            timestamp: string | Date = new Date().toUTCString();
            eventId: string = uuidv4();
            boardId: string = uuidv4();
            code: string = 'TextPastedEvent';
            color: string | CanvasGradient = SUPPORTED_COLORS[0];
            name: string = '';
            text: string = '';
            rotation: number = 0;
            position: Point = { x: 0, y: 0 };
            fontSize: number = 18;
         }
         \`\`\`

      When given a prompt, suggest the relevant events based on the Scrum process (backlog, tasks, sprint events, etc.), and display them within the provided area on the whiteboard. For each event, ensure to place it within the defined boundaries, using the appropriate coordinates and attributes based on the event type.

      Your task is to generate events that can be placed in a Scrum board and mapped to the provided area dimensions (width, height). Each event should have a position and any necessary visual attributes.
      Suggest and display scrum tasks (e.g., sprint backlog, tasks, user stories) within the given area on the whiteboard. Each event should have a position based on the area dimensions.
      ONLY USE the Event type and Event code predefined in this instruction.
      `,
      name: "Scrum Master Assistant",
      tools: [{ type: "code_interpreter" }] // You can add more tools if needed
   });

   console.log("Assistant created: ", myAssistant);
   return myAssistant;
}

async function createReuseThread(openai: OpenAI, threadId?: string) {
   // Step 2: Create or reuse a Thread
  const myThread: Thread = threadId ? await openai.beta.threads.retrieve(threadId) : await openai.beta.threads.create();
  console.log("Thread created or retrieved: ", myThread);
  return myThread;
}

export class OpenAIService {
   /**
    * Suggests events and places them on a visual whiteboard grid.
    */
   async suggestsEventAsync(userPrompt: string, area: Point & Dimension, previousEvents: IEventGeneral[], threadId?: string) {
      const openAiClient = newOpenAiClient();
      const assistant = await createAssistant(openAiClient);
      const thread = await createReuseThread(openAiClient, threadId);

      // Step 3: Add User Request to Thread
      const userRequest = await openAiClient.beta.threads.messages.create(
         thread.id,
         {
            role: "user",
            content: userPrompt, // The user defines what kind of Scrum events they need
         }
      );
      console.log("User request sent: ", userRequest);

      // Step 4: Execute the Assistant's Run
      const myRun = await openAiClient.beta.threads.runs.create(
         thread.id,
         {
            assistant_id: assistant.id,
            instructions: `
            You provide the Events that help my Engine to render objects to my canvas that fits provided area: ${JSON.stringify(area)}
            Return json text accurately because after this user just need to parse the text reponse to typescript object with JSON.parse.
            you DO NOT return the json of structure of the configuration, you MUST provide the json match the type provided in the instructions, structure of Events.
            Reference to previous events: ${JSON.stringify(previousEvents)}
            `,
         }
      );
      console.log("Assistant run started: ", myRun);

      // Step 5: Periodically retrieve the Run to check on its status to see if it has moved to completed
      const retrieveRun = async () => {
         let keepRetrievingRun;

         while (myRun.status === "queued" || myRun.status === "in_progress") {
            keepRetrievingRun = await openAiClient.beta.threads.runs.retrieve(
               thread.id,
               myRun.id
            );
            console.log(`Run status: ${keepRetrievingRun.status}`);

            if (keepRetrievingRun.status === "completed") {
               console.log("\n");

               // Step 6: Retrieve the Messages added by the Assistant to the Thread
               const allMessages = await openAiClient.beta.threads.messages.list(
                  thread.id
               );

               console.log(
                  "------------------------------------------------------------ \n"
               );

               return allMessages.data[0].content[0].type === 'text' ? allMessages.data[0].content[0].text.value : 'Not a Text';

            } else if (
               keepRetrievingRun.status === "queued" ||
               keepRetrievingRun.status === "in_progress"
            ) {
               // pass
            } else {
               console.log(`Run status: ${keepRetrievingRun.status}`);
               break;
            }
         }
         return 'Cycle Broken';
      };

      // Assume the assistant return correct json array
      const jsonString = await retrieveRun();

      // Step 8: Return events with positions
      return { events: this.toArray(jsonString), threadId: thread.id};
   }

   private toArray(jsonString: string): Array<IEventGeneral> {
      console.log(jsonString);

      console.log('removing wrapper');
      jsonString = jsonString.replace(/^```json|```$/g, '').trim();
      console.log('after replacement: ');
      console.log(jsonString);

      try {
         return JSON.parse(jsonString);
      } catch(e) {
         console.error(e);

         return [];
      }
   }
}
