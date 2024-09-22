import { Client } from '@notionhq/client';
import { loadSecretConfiguration } from '../../meta/configuration.serve';
import { ITableClient } from '../../meta/table-client.interface';
import { ITableFactory } from '../../meta/table-factory.interface';
import { Project, TimesheetRecord } from '../model/Timesheet.entity';
import { NotionTimesheetService } from './NotionTimesheet.service';

const secrets = loadSecretConfiguration();

export class NotionTableFactory implements ITableFactory {
    private _client: Client;
    /**
     *
     */
    constructor() {
        this._client = new Client({
            auth: secrets.notion_Token,
        });
    }

    getRBTimeSheetClient(): ITableClient<TimesheetRecord> {
        return new NotionTimesheetService(this._client, Project.CirrusPro);
    }

    getHRTimeSheetClient(): ITableClient<TimesheetRecord> {
        return new NotionTimesheetService(this._client, Project.HikingReport);
    }
}