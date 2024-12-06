import { loadSecretConfiguration } from './configuration';
import { listen } from './event-listeners';

console.log('A sarcastic bot!');
listen(loadSecretConfiguration().telegram_ApiKey);