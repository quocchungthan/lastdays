import { Observable } from "rxjs";
import { IEventGeneral } from "../../syncing-models/EventGeneral.interface";
import { ShortcutInstruction } from "./shortkeys-instruction.model";

export interface IRendererService {
   recover(event: IEventGeneral): Promise<void>;
   getInstructions(): Observable<ShortcutInstruction[]>;
}