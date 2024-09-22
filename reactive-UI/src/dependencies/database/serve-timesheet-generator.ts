import express from 'express';
import { loadSecretConfiguration } from '../meta/configuration.serve';
import { dependenciesPool } from '../dependencies.pool';
import { DATABASE_ENDPOINT_PREFIX, GENERATE_TIMESHEET_HR, GENERATE_TIMESHEET_RB } from '@config/routing.consants';
import { HttpStatusCode } from '@angular/common/http';

const secrets = loadSecretConfiguration();

// TODO: setup cors to block brute-forcing
export const injectTimesheetEndpoints = (server: express.Express) => {
    const logger = dependenciesPool.logger();
    if (!secrets.notionEnabled) {
        throw new Error("Please set up the environment variable for notion_Token, NOTION_TIMESHEET_TABLE_ID and restart the application");
    }
    const tableFactory = dependenciesPool.tableFactory();
    const router = express.Router();
    server.use(express.json());

    router.get(GENERATE_TIMESHEET_HR, async (req, res) => {
        // Get the 'sprints' query parameter
        const sprintsParam = req.query['sprints'] as string;

        // Split the sprints into an array, handling the case where there might not be any
        const sprints = sprintsParam ? sprintsParam.split(',').map(s => s.trim()) : [];
        try {
            // TODO: emebed the filter within the query filter to reduce the payload return
            const timesheetRecords = (await tableFactory.getHRTimeSheetClient().getAll())
                .filter(x => sprints.includes(x.masterGroup));
            const file = dependenciesPool.excelCpmposer().composeHRSheet(timesheetRecords);
            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=timesheet.xlsx');
            await file.write(res);
            res.status(HttpStatusCode.Ok)
                .end();

        } catch {
            logger.log("There was an error");
            res.status(HttpStatusCode.InternalServerError)
                .end();
        }
    });

    router.get(GENERATE_TIMESHEET_RB, async (req, res) => {
        // Get the 'sprints' query parameter
        const sprintsParam = req.query['sprints'] as string;

        // Split the sprints into an array, handling the case where there might not be any
        const sprints = sprintsParam ? sprintsParam.split(',').map(s => s.trim()) : [];
    
        try {
            const timesheetRecords = (await tableFactory.getRBTimeSheetClient().getAll())
                .filter(x => sprints.includes(x.masterGroup));
            const file = dependenciesPool.excelCpmposer().composeRBSheets(timesheetRecords);
            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=timesheet.xlsx');
            await file.write(res);
            res.status(HttpStatusCode.Ok)
                .end();
        } catch {
            logger.log("There was an error");
            res.status(HttpStatusCode.InternalServerError)
                .end();
        }
    });

    server.use(DATABASE_ENDPOINT_PREFIX, router);
}