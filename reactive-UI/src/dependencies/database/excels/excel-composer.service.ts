import { IExcelComposer } from '../../meta/excel-composer.interface';
import { TimesheetRecord } from '../model/Timesheet.entity';
import ExcelJS from 'exceljs';

export class ExcelTimesheetComposer implements IExcelComposer {
    composeHRSheet(data: TimesheetRecord[]) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Timesheet');

        // Set up the header row without the 'Project' field
        worksheet.addRow(['Row', 'Master Group', 'Ticket ID', 'Description', 'Number of Hours', 'Date']);

        let currentMasterGroup = '';
        let startRow = 2; // Start from the first data row (row 2)
        let rowNumber = startRow;

        data.forEach((record) => {
            // Create a new row with the row number
            const row = [rowNumber - 1, record.masterGroup, record.ticketId, record.description, record.numberOfHours, record.date];

            worksheet.addRow(row);

            // If the master group changes, merge the cell for the previous master group
            if (record.masterGroup !== currentMasterGroup) {
                if (currentMasterGroup) {
                    // Merge cells for the previous master group, which are in column B
                    worksheet.mergeCells(`B${startRow}:B${rowNumber - 1}`);
                }
                currentMasterGroup = record.masterGroup;
                startRow = rowNumber; // Update startRow for the new master group
            }

            rowNumber++; // Increment row number for the next iteration
        });

        // Merge the last group if applicable
        if (currentMasterGroup) {
            worksheet.mergeCells(`B${startRow}:B${rowNumber - 1}`);
        }

        // Format date column
        worksheet.getColumn('F').numFmt = 'mm/dd/yyyy';

        return workbook.xlsx;
    }

    composeRBSheets(data: TimesheetRecord[]) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Timesheet');

        // Set up the header row without the 'Project' field
        worksheet.addRow(['Row', 'Master Group', 'Ticket ID', 'Description', 'Number of Hours', 'Date']);

        let currentMasterGroup = '';
        let startRow = 2; // Start from the first data row (row 2)
        let rowNumber = startRow;

        data.forEach((record) => {
            // Create a new row with the row number
            const row = [rowNumber - 1, record.masterGroup, record.ticketId, record.description, record.numberOfHours, record.date];

            worksheet.addRow(row);

            // If the master group changes, merge the cell for the previous master group
            if (record.masterGroup !== currentMasterGroup) {
                if (currentMasterGroup) {
                    // Merge cells for the previous master group, which are in column B
                    worksheet.mergeCells(`B${startRow}:B${rowNumber - 1}`);
                }
                currentMasterGroup = record.masterGroup;
                startRow = rowNumber; // Update startRow for the new master group
            }

            rowNumber++; // Increment row number for the next iteration
        });

        // Merge the last group if applicable
        if (currentMasterGroup) {
            worksheet.mergeCells(`B${startRow}:B${rowNumber - 1}`);
        }

        // Format date column
        worksheet.getColumn('F').numFmt = 'mm/dd/yyyy';

        return workbook.xlsx;
    }
}