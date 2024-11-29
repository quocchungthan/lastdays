
import { Environments } from '@cbto/nodepackages.utils/constants/environments';

export const DEFAULT_FAKE_VALUE = Environments.DEFAULT_FAKE_VALUE;

export const loadSecretConfiguration = () => {
   const port = process.env[Environments.PORT] || 4014;
   const openAI_Key = process.env[Environments.OPENAI_API_KEY] ?? DEFAULT_FAKE_VALUE;
   const openAI_OrganizationId =
     process.env[Environments.OPENAI_ORGANIZATION_ID] ?? DEFAULT_FAKE_VALUE;
   const openAI_ProjectId =
     process.env[Environments.OPENAI_PROJECT_ID] ?? DEFAULT_FAKE_VALUE;
   const openAI_ModelName =
     process.env[Environments.OPENAI_MODEL_NAME] ?? DEFAULT_FAKE_VALUE;
   const openAI_MaxToken = 1000;
   const assistantEnabled = [
     openAI_Key,
     openAI_ProjectId,
     openAI_OrganizationId,
     openAI_ModelName,
   ].every((x) => x !== DEFAULT_FAKE_VALUE);
 
   return {
     port,
     openAI_Key,
     openAI_OrganizationId,
     openAI_ProjectId,
     openAI_ModelName,
     assistantEnabled,
     openAI_MaxToken,
   };
}