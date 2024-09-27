import { Content } from "./content.model";

export interface IContentRespository {
   getContentByDescriptiveKeyAsync(contentTableId: string, key: string): Promise<Content>;
}