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
        try {
            const timesheetRecords = await tableFactory.getHRTimeSheetClient().getAll();
            res.status(HttpStatusCode.Ok)
                .setHeader('Content-Type', 'application/json')
                .send(timesheetRecords)
                .end();
        } catch {
            logger.log("There was an error");
            res.status(HttpStatusCode.InternalServerError)
                .end();
        }
    });

    router.get(GENERATE_TIMESHEET_RB, async (req, res) => {
        try {
            const timesheetRecords = await tableFactory.getRBTimeSheetClient().getAll();
            res.status(HttpStatusCode.Ok)
                .setHeader('Content-Type', 'application/json')
                .send(timesheetRecords)
                .end();
        } catch {
            logger.log("There was an error");
            res.status(HttpStatusCode.InternalServerError)
                .end();
        }
    });

    server.use(DATABASE_ENDPOINT_PREFIX, router);
}