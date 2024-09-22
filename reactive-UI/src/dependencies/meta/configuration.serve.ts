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
    const openAI_Key = process.env['OPENAI_API_KEY'] ?? DEFAULT_FAKE_VALUE;
    const openAI_OrganizationId = process.env['OPENAI_ORGANIZATION_ID'] ?? DEFAULT_FAKE_VALUE;
    const openAI_ProjectId = process.env['OPENAI_PROJECT_ID'] ?? DEFAULT_FAKE_VALUE;
    const openAI_ModelName = process.env['OPENAI_MODEL_NAME'] ?? DEFAULT_FAKE_VALUE;
    const notion_Token = process.env['NOTION_TOKEN'] ?? DEFAULT_FAKE_VALUE;
    const notion_TimesheetTableId = process.env['NOTION_TIMESHEET_TABLE_ID'] ?? DEFAULT_FAKE_VALUE;
    const openAI_MaxToken = 1000;
    const systemPromptUsed = ".v2";
    const userInstructionUsed = ".v1";
    const websocketEnabled = true;
    const assistantEnabled = [openAI_Key, openAI_ProjectId, openAI_OrganizationId, openAI_ModelName].every(x => x !== DEFAULT_FAKE_VALUE);
    const notionEnabled = [notion_Token, notion_TimesheetTableId].every(x => x !== DEFAULT_FAKE_VALUE);
    const useBackup = true;
    const jsonBackupPath = './cachedResponses.json';

    return { port,
        openAI_Key,
        openAI_OrganizationId,
        openAI_ProjectId, openAI_ModelName,
        systemPromptUsed, userInstructionUsed,
        websocketEnabled, assistantEnabled, notionEnabled,
        useBackup,
        jsonBackupPath,
        openAI_MaxToken,
        notion_Token,
        notion_TimesheetTableId
    };
}