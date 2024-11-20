export const DEFAULT_FAKE_VALUE = '<fake config>';

export const loadSecretConfiguration = () => {
  const port = process.env['PORT'] || 4011;

  const NOTION_OAuth_Client_Secret = process.env['NOTION_OAuth_Client_Secret'] ?? DEFAULT_FAKE_VALUE;
  const NOTION_OAuthClient_ID = process.env['NOTION_OAuthClient_ID'] ?? DEFAULT_FAKE_VALUE;
  const NOTION_OAuth_Reidrect_Uri = process.env['NOTION_OAuth_Reidrect_Uri'] ?? DEFAULT_FAKE_VALUE;
  const SESSION_Secret_Key = process.env['SESSION_Secret_Key'] ?? DEFAULT_FAKE_VALUE;

  const notionEnabled = [
    NOTION_OAuth_Client_Secret,
    NOTION_OAuthClient_ID,
    NOTION_OAuth_Reidrect_Uri,
    SESSION_Secret_Key
  ].every((x) => x !== DEFAULT_FAKE_VALUE);

  return {
    port,
    NOTION_OAuth_Client_Secret,
    NOTION_OAuth_Reidrect_Uri,
    NOTION_OAuthClient_ID,
    notionEnabled,
    SESSION_Secret_Key
  };
};
