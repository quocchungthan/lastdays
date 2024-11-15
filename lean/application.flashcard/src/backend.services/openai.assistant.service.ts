import OpenAI from "openai";
import { Question } from "./flashcard.entity";
import { loadSecretConfiguration } from "./configuration";

const secrets = loadSecretConfiguration();

const newOpenAiClient = () => {
   return new OpenAI({
       organization: secrets.openAI_OrganizationId,
       project: secrets.openAI_ProjectId,
       apiKey: secrets.openAI_Key
   });
};

export class FlashCardAssistantService {
   private usedWords: Set<string> = new Set(); // Set to track previously used words

   // Option to reset the used words set if needed
   resetUsedWords() {
      this.usedWords.clear();
   }

   // Fisher-Yates shuffle to randomize the order of words
   private shuffleArray<T>(array: T[]): T[] {
      for (let i = array.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
      return array;
   }

   async generateRandomQuestion(words: string[], pureHtmlContent: string, optionCount: number = 2): Promise<Question> {
      if (optionCount < 2) {
          throw Error("Invalid input, there must be at least 2 options.");
      }
  
      // Filter out words that have already been asked
      let unusedWords = words.filter(word => !this.usedWords.has(word));
      if (unusedWords.length < 2) {
          this.usedWords = new Set(); // Reset used words if we run out
          unusedWords = words;
      }
      // Shuffle the unused words to introduce randomness
      const shuffledWords = this.shuffleArray([...unusedWords]);
  
      const openAiClient = newOpenAiClient();
  
      // Prepare the prompt for OpenAI model
      const prompt = `Create a question based on the following words: ${shuffledWords.join(", ")}. 
      The question should be relevant to the context provided and could be a vocabulary or general knowledge question. 
      The HTML content is: ${pureHtmlContent}. 
      
      Please generate **exactly** ${optionCount} options, including the correct answer. Do not generate more or fewer options. 
      Only provide the JSON object, no explanations or additional text.`;
  
      // Call the OpenAI API to generate a question based on the provided words and content
      const response = await openAiClient.chat.completions.create({
          model: secrets.openAI_ModelName,
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
              },
              { 
                 role: "user", 
                 content: "You can use both the main words and the words within HTML content, but the main words are more important. However, this is not absolute." 
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
      } catch (error) {
          console.error("Error parsing the response:", error);
          throw new Error("Failed to generate valid flashcard JSON.");
      }
      const correctWord = generatedQuestion.options[generatedQuestion.correctAnswerIndex].word;
      // Shuffle the options to make sure the correct answer isn't always at index 0
      this.shuffleArray(generatedQuestion.options);
  
      // After shuffling, we must update the correct answer index
      const correctAnswer = generatedQuestion.options.find(option => option.word === correctWord);
      generatedQuestion.correctAnswerIndex = generatedQuestion.options.indexOf(correctAnswer!);
  
      // Mark the words in the question as used
      generatedQuestion.options.forEach(option => {
          this.usedWords.add(option.word);
      });
  
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
