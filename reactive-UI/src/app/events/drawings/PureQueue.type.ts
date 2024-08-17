import { EventCode } from './EventCode';

export type PureQueue = Array<AbstractEventQueueItem>;

export interface AbstractEventQueueItem {
    code: EventCode;
    targetId: string;
    id: string;
}
