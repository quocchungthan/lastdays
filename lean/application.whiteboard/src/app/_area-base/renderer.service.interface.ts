import { IEventGeneral } from "../../syncing-models/EventGeneral.interface";

export interface IRendererService {
   recover(event: IEventGeneral): Promise<void>;
}