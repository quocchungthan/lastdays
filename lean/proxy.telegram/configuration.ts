
import { Environments } from '@cbto/nodepackages.utils/constants/environments';

export const DEFAULT_FAKE_VALUE = Environments.DEFAULT_FAKE_VALUE;

export const loadSecretConfiguration = () => {
   const port = process.env[Environments.PORT] || 4015;
   const telegram_ApiKey = process.env["TELEGRAM_BOT_API_KEY"] ?? DEFAULT_FAKE_VALUE;
   const telegramEnabled = [
      telegram_ApiKey,
   ].every((x) => x !== DEFAULT_FAKE_VALUE);
 
   return {
     port,
     telegramEnabled,
     telegram_ApiKey
   };
}