import OpenAI from "openai";
import { Question, WordOption } from "./flashcard.entity";
import { loadSecretConfiguration } from "./configuration";

const secrets = loadSecretConfiguration();

const newOpenAiClient = () => {
   return new OpenAI({
       organization: secrets.openAI_OrganizationId,
       project: secrets.openAI_ProjectId,
       apiKey: secrets.openAI_Key
   });
}

export class FlashCardAssistantService {
   async generateRandomQuestion(words: string[], pureHtmlContent: string, optionCount: number = 2): Promise<Question> {
      if (optionCount < 2) {
         throw Error("Invalid input, there must be at least 2 options.");
      }

      const openAiClient = newOpenAiClient();

      // Prepare the prompt for OpenAI model
      const prompt = `Create a question based on the following words: ${words.join(", ")}. 
      The question should be relevant to the context provided and could be a vocabulary or general knowledge question. 
      The HTML content is: ${pureHtmlContent}. 
      
      Please generate **exactly** ${optionCount} options, including the correct answer. Do not generate more or fewer options. 
      Only provide the JSON object, no explanations or additional text.`;

      // Call the OpenAI API to generate a question based on the provided words and content
      const response = await openAiClient.chat.completions.create({
         model: secrets.openAI_ModelName, // e.g., "gpt-3.5-turbo" or "gpt-4"
         messages: [
            { 
               role: "system", 
               content: `You are an assistant that helps create flashcards. Return **ONLY** the JSON that matches this schema:
               \`\`\`
               export class WordOption {
                  word: string = '';
               }

               export class Question {
                  question: string = '';
                  options: WordOption[] = [];
                  correctAnswerIndex: number = -1;
               }
               \`\`\`
               Ensure that the response contains only this JSON and nothing else. Do not include any text, explanations, or markdown formatting.` 
            },
            { 
               role: "user", 
               content: prompt 
            }
         ],
      });

      // Parse the response content as JSON
      let generatedQuestion: Question;
      try {
         generatedQuestion = JSON.parse(response.choices?.[0].message.content?.trim() || "");
         
         // Validate the structure of the response
         if (!this.isValidQuestion(generatedQuestion)) {
            throw new Error("Invalid response structure from OpenAI.");
         }
         
         // Ensure the number of options matches the requested count
         if (generatedQuestion.options.length !== optionCount) {
            throw new Error(`Expected ${optionCount} options, but received ${generatedQuestion.options.length}.`);
         }
      } catch (error) {
         console.error("Error parsing the response:", error);
         throw new Error("Failed to generate valid flashcard JSON.");
      }

      // Return the constructed Question object
      return generatedQuestion;
   }

   // Helper function to validate if the generated object matches the Question structure
   private isValidQuestion(question: any): question is Question {
      if (!question || typeof question.question !== 'string' || !Array.isArray(question.options)) {
         return false;
      }

      // Check that all options are WordOption objects
      if (!question.options.every((opt: any) => typeof opt.word === 'string')) {
         return false;
      }

      // Check that the correctAnswerIndex is valid
      if (typeof question.correctAnswerIndex !== 'number' || question.correctAnswerIndex < 0) {
         return false;
      }

      return true;
   }
}
