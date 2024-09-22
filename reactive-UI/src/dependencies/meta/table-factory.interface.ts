import { TimesheetRecord } from '../database/model/Timesheet.entity';
import { ITableClient } from './table-client.interface';

export interface ITableFactory {
    getRBTimeSheetClient(): ITableClient<TimesheetRecord>;
    getHRTimeSheetClient(): ITableClient<TimesheetRecord>;
}