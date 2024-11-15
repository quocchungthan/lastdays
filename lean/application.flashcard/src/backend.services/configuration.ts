export const DEFAULT_FAKE_VALUE = '<fake config>';

export const loadSecretConfiguration = () => {
  const port = process.env['PORT'] || 4201;
  const openAI_Key = process.env['OPENAI_API_KEY'] ?? DEFAULT_FAKE_VALUE;
  const openAI_OrganizationId =
    process.env['OPENAI_ORGANIZATION_ID'] ?? DEFAULT_FAKE_VALUE;
  const openAI_ProjectId =
    process.env['OPENAI_PROJECT_ID'] ?? DEFAULT_FAKE_VALUE;
  const openAI_ModelName =
    process.env['OPENAI_MODEL_NAME'] ?? DEFAULT_FAKE_VALUE;
  const openAI_MaxToken = 1000;
  const assistantEnabled = [
    openAI_Key,
    openAI_ProjectId,
    openAI_OrganizationId,
    openAI_ModelName,
  ].every((x) => x !== DEFAULT_FAKE_VALUE);

  const notion_Token = process.env['NOTION_TOKEN'] ?? DEFAULT_FAKE_VALUE;

  const notion_PageId = process.env['NOTION_ENGLISH_PAGE_ID'] ?? DEFAULT_FAKE_VALUE;

  const notionEnabled = [
   notion_Token,
    notion_PageId,
  ].every((x) => x !== DEFAULT_FAKE_VALUE);

  return {
    port,
    openAI_Key,
    openAI_OrganizationId,
    openAI_ProjectId,
    openAI_ModelName,
    assistantEnabled,
    openAI_MaxToken,
    notion_Token,
    notion_PageId,
    notionEnabled,
  };
};
