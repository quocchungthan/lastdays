// Import the Telegram Bot API package
import TelegramBot from "node-telegram-bot-api";

export function listen(apiKey: string) {
  // Replace with your bot's API token from BotFather
  const token = apiKey;

  // Create an instance of the Telegram Bot
  const bot = new TelegramBot(token, { polling: true });

  // Handle incoming messages
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!msg.from) {
      console.log('From is empty!');
      return;
    }
    const username = msg.from.first_name;

    // Send a welcome message
    bot.sendMessage(chatId, `Hello, ${username}! Welcome to the bot.`);
  });

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    // Send a help message
    bot.sendMessage(
      chatId,
      "Here are some commands you can use:\n/start - Start the bot\n/help - Get help"
    );
  });

  // Handle any text message
  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) {
      console.log('text is empty!');
      return;
    }
    // Echo the message back to the user
    if (text.toLowerCase() !== "/start" && text.toLowerCase() !== "/help") {
      bot.sendMessage(chatId, `You said: ${text}`);
    }
  });
}
