// src/index.ts
import * as readline from 'readline';
import { OpenAIService } from './sm-assistant/openai.service';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let lastAssistantWords = 'How the assistant can help? (Type "exit" to stop) ';
let threadId: string | undefined = undefined;
const service = new OpenAIService();
// Recursive function to keep asking the user a question
const askQuestion = () => {
  rl.question(`assistant: ${lastAssistantWords}\n>> `, async (answer: string) => {
    if (answer.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      rl.close();  // Close the interface if the user types "exit"
    } else {
      const eventsGenerated = await service.suggestsEventAsync(answer, { x: -200, y: -200, width: 1000, height: 650 }, [], threadId);
      lastAssistantWords = JSON.stringify(eventsGenerated.events);
      threadId = eventsGenerated.threadId;
      askQuestion();  // Recursively ask again
    }
  });
};

// Start asking questions
askQuestion();
