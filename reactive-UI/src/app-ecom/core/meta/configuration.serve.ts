import { DEFAULT_FAKE_VALUE } from '@config/default-value.constants';
import path from 'path';

/**
 * For Windows OS: set the config in Env variable,
 * Against docker: set in the section environment of docker compose file, ex:
 *     environment:
        - PORT=3000  # Sets the PORT environment variable inside the container
 */
export const loadSecretConfiguration = () => {
  const port = process.env['PORT'] || 4201;
  const notion_Token = process.env['NOTION_TOKEN'] ?? DEFAULT_FAKE_VALUE;
  const notion_MetaTableId =
    process.env['NOTION_META_ID'] ?? DEFAULT_FAKE_VALUE;
  const notionEnabled = [notion_Token, notion_MetaTableId].every(
    (x) => x !== DEFAULT_FAKE_VALUE
  );

  return { port, notionEnabled, notion_Token, notion_MetaTableId };
};
