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
         throw Error("Invalid input, there's at least 2 options");
      }

      const openAiClient = newOpenAiClient();

      // Prepare the prompt for OpenAI model
      const prompt = `Create a question based on the following words: ${words.join(", ")}.
      The question should be relevant to the context provided and could be a vocabulary or general knowledge question.
      The HTML content is: ${pureHtmlContent}`;

      // Call the OpenAI API to generate a question based on the provided words and content
      const response = await openAiClient.chat.completions.create({
         model: "gpt-4", // or "gpt-3.5-turbo"
         messages: [
            { role: "system", content: "You are an assistant that helps create flashcards." },
            { role: "user", content: prompt },
            { role: "user", content: "You can use both the main words and the words within html content, just beware that the main words are more importants, but it's not aboslute." },
         ],
      });

      // Extract the question from the response
      const generatedQuestion = response.choices?.[0].message.content?.trim();

      if (!generatedQuestion) {
         console.log(response, response.choices, response.choices[0], response.choices?.[0].message, response.choices?.[0].message.content);
         throw Error("Response is not valid");
      }

      // Generate options based on the provided words and content
      const options: WordOption[] = [];
      const correctAnswerIndex = Math.floor(Math.random() * optionCount); // Randomly choose correct answer index

      // Randomly shuffle words to create incorrect answers
      const shuffledWords = words.sort(() => 0.5 - Math.random()).slice(0, optionCount - 1);
      shuffledWords.splice(correctAnswerIndex, 0, words[0]); // Insert the correct answer

      // Create Option objects
      shuffledWords.forEach(word => {
         const option = new WordOption();
         option.word = word;
         options.push(option);
      });

      // Return the constructed Question object
      const question = new Question();
      question.question = generatedQuestion;
      question.options = options;
      question.correctAnswerIndex = correctAnswerIndex;

      return question;
   }
}