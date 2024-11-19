export const DEFAULT_FAKE_VALUE = '<fake config>';

export const loadSecretConfiguration = () => {
  const port = process.env['PORT'] || 4011;

  const NOTION_Authorization_Url = process.env['NOTION_Authorization_Url'] ?? DEFAULT_FAKE_VALUE;
  const NOTION_OAuth_Client_Secret = process.env['NOTION_OAuth_Client_Secret'] ?? DEFAULT_FAKE_VALUE;
  const NOTION_OAuthClient_ID = process.env['NOTION_OAuthClient_ID'] ?? DEFAULT_FAKE_VALUE;
  const NOTION_OAuth_Reidrect_Uri = process.env['NOTION_OAuth_Reidrect_Uri'] ?? DEFAULT_FAKE_VALUE;
  const notion_registeredTableStorageId = process.env['NOTION_REGISTERED_LIST_PAGE_ID'] ?? DEFAULT_FAKE_VALUE;
  const SESSION_Secret_Key = process.env['SESSION_Secret_Key'] ?? DEFAULT_FAKE_VALUE;

  const notionEnabled = [
    NOTION_Authorization_Url,
    NOTION_OAuth_Client_Secret,
    NOTION_OAuthClient_ID,
    notion_registeredTableStorageId,
    NOTION_OAuth_Reidrect_Uri,
    SESSION_Secret_Key
  ].every((x) => x !== DEFAULT_FAKE_VALUE);

  return {
    port,
    NOTION_Authorization_Url,
    NOTION_OAuth_Client_Secret,
    NOTION_OAuth_Reidrect_Uri,
    NOTION_OAuthClient_ID,
    notionEnabled,
    SESSION_Secret_Key
  };
};
