import { OtherMeta } from "./other-meta.model";

export interface IOtherMetaRespository {
   getAllAsync(): Promise<OtherMeta[]>;
}