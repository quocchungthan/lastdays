import { Client } from '@notionhq/client';
import { ITableClient } from '../../meta/table-client.interface';
import { Project, TimesheetRecord } from '../model/Timesheet.entity';
import { loadSecretConfiguration } from '../../meta/configuration.serve';
import { dependenciesPool } from '../../dependencies.pool';
import { ILogger } from '@com/connection.manager';
import { DatabaseObjectResponse, DatePropertyItemObjectResponse, MultiSelectPropertyItemObjectResponse, NumberPropertyItemObjectResponse, PageObjectResponse, PartialDatabaseObjectResponse, PartialPageObjectResponse, RichTextPropertyItemObjectResponse, SelectPropertyItemObjectResponse, TitlePropertyItemObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const secrets = loadSecretConfiguration();

export class NotionTimesheetService implements ITableClient<TimesheetRecord> {
    private static PropertyNameProject = "Project";
    private static PropertyNameCreatedAt = 'Created time';
    private _logger: ILogger;


    constructor(private _notionClient: Client, private _timesheetType: Project) {
        this._logger = dependenciesPool.logger();
    }

    async getAll(): Promise<TimesheetRecord[]> {
        const pagingRecords = await this._notionClient.databases.query({
            database_id: secrets.notion_TimesheetTableId,
            filter: {
              property: NotionTimesheetService.PropertyNameProject,
              multi_select: {
                contains: this._resolveProjectValue(),
              },
            },
            sorts: [
                {
                    property: NotionTimesheetService.PropertyNameCreatedAt,
                    direction: 'descending'
                }
            ],
          });
        
        this._logger.log("Has more? " + pagingRecords.has_more);
        
        return pagingRecords.results.map((x) => this._mapToBusinessModel(x));
    }

    private _mapToBusinessModel(x: PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse): TimesheetRecord {
        const ans = new TimesheetRecord();
        // @ts-ignore
        const properties = x.properties;

        ans.masterGroup = (properties['Master Group'] as SelectPropertyItemObjectResponse).select?.name ?? '';
        ans.numberOfHours = (properties['Hours'] as NumberPropertyItemObjectResponse).number ?? 1;
        // @ts-ignore
        ans.description = (properties['Description'] as RichTextPropertyItemObjectResponse).rich_text[0].plain_text ?? "";
        ans.date = new Date((properties['Date'] as DatePropertyItemObjectResponse).date?.start ?? new Date());
        ans.project = (properties[NotionTimesheetService.PropertyNameProject] as MultiSelectPropertyItemObjectResponse).multi_select[0]?.name ?? '';
        // @ts-ignore
        ans.ticketId = this._getTicketPrefix() + (properties['Ticket ID'] as TitlePropertyItemObjectResponse).title[0]?.plain_text ?? "";

        return ans;
    }

    private _getTicketPrefix(): string {
        return this._timesheetType === Project.CirrusPro ? "RB-" : "";
    }

    private _resolveProjectValue(): string {
        return this._timesheetType === Project.CirrusPro ? "RBCC" : "HikingReport";
    }
}