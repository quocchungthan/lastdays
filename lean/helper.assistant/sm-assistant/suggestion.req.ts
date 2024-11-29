import { Point } from '@cbto/nodepackages.utils/dimention-models/Point';
import { Dimension } from '@cbto/nodepackages.utils/dimention-models/Dimension';
import { IEventGeneral } from '@cbto/nodepackages.utils/syncing-models/EventGeneral.interface';

export interface SuggestionRequestBody {
   userPrompt: string;
   area: Point & Dimension;
   existingEvents: IEventGeneral[];
   threadId?: string;
}