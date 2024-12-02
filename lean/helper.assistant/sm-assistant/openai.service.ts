import { IEventGeneral } from "@cbto/nodepackages.utils/syncing-models/EventGeneral.interface";
import { loadSecretConfiguration } from "./configuration";
import { Dimension } from "@cbto/nodepackages.utils/dimention-models/Dimension";
import { Point } from "@cbto/nodepackages.utils/dimention-models/Point";
import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";
import fs from 'fs';
import path from 'path';

const secrets = loadSecretConfiguration();

const newOpenAiClient = () => {
   return new OpenAI({
       organization: secrets.openAI_OrganizationId,
       project: secrets.openAI_ProjectId,
       apiKey: secrets.openAI_Key
   });
};

async function getAssistant(openai: OpenAI, assistantName: string) {
   
   try {
       // Step 1: List all existing assistants
       const assistants = await openai.beta.assistants.list();
       
       // Step 2: Find the assistant by name
       const existingAssistant = assistants.data.find(assistant => assistant.name === assistantName);
       
       // Step 3: Return the existing assistant if found
       if (existingAssistant) {
         //   console.log("Existing assistant found: ", existingAssistant);
           return existingAssistant;
       } else {
           // If no assistant found, return null or handle as needed
           console.log("Assistant not found");
           return null;
       }
   } catch (error) {
       console.error("Error fetching assistants: ", error);
       throw error;
   }
}

async function createAssistant(openai: OpenAI) {
   const AssistantName = "JSON Event Generator 1.1";
   // Step 1: Read the instructions from the instructions.md file
   const instructionsFilePath = path.resolve(__dirname, 'instructions.md');
   const instructions = fs.readFileSync(instructionsFilePath, 'utf-8');
  // Step 1: Create an Assistant with detailed instructions about event types
  let myAssistant;
   try {
      myAssistant = await getAssistant(openai, AssistantName);
   } catch(e) {
      
   }
   if (myAssistant) return myAssistant;
   myAssistant = await openai.beta.assistants.create({
      model: secrets.openAI_ModelName,
      instructions: instructions,
      name: AssistantName,
      tools: [{ type: "code_interpreter" }] // You can add more tools if needed
   });

   // console.log("Assistant created: ", myAssistant);
   return myAssistant;
}

async function createReuseThread(openai: OpenAI, threadId?: string) {
   // Step 2: Create or reuse a Thread
  const myThread: Thread = threadId ? await openai.beta.threads.retrieve(threadId) : await openai.beta.threads.create();
//   console.log("Thread created or retrieved: ", myThread);
  return myThread;
}

export class OpenAIService {
   /**
    * Suggests events and places them on a visual whiteboard grid.
    */
   async suggestsEventAsync(userPrompt: string, area: Point & Dimension, previousEvents: IEventGeneral[], threadId?: string) {
         // Step 1: Read the instructions from the instructions.md file
      const systemPromptFilePath = path.resolve(__dirname, 'system-prompt.md');
      const systemPrompt = fs.readFileSync(systemPromptFilePath, 'utf-8');
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
      // console.log("User request sent: ", userRequest);
      // Step 4: Execute the Assistant's Run
      const myRun = await openAiClient.beta.threads.runs.create(
         thread.id,
         {
            assistant_id: assistant.id,
            instructions: systemPrompt.replace('{area}', JSON.stringify(area)).replace('{events}', JSON.stringify(previousEvents)),
         }
      );
      // console.log("Assistant run started: ", myRun);

      // Step 5: Periodically retrieve the Run to check on its status to see if it has moved to completed
      const retrieveRun = async () => {
         let keepRetrievingRun;

         while (myRun.status === "queued" || myRun.status === "in_progress") {
            keepRetrievingRun = await openAiClient.beta.threads.runs.retrieve(
               thread.id,
               myRun.id
            );
            // console.log(`Run status: ${keepRetrievingRun.status}`);

            if (keepRetrievingRun.status === "completed") {
               // console.log("\n");

               // Step 6: Retrieve the Messages added by the Assistant to the Thread
               const allMessages = await openAiClient.beta.threads.messages.list(
                  thread.id
               );

               // console.log(
               //    "------------------------------------------------------------ \n"
               // );

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
      // console.log(jsonString);

      // console.log('removing wrapper');
      jsonString = jsonString.split('```json').reverse()[0].split('```')[0].replace(/^```json|```$/g, '').trim();
      // console.log('after replacement: ');
      // console.log(jsonString);

      try {
         return JSON.parse(jsonString);
      } catch(e) {
         console.log(jsonString);
         console.error(e);

         return [];
      }
   }
}
