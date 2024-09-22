import { IExcelComposer } from '../../meta/excel-composer.interface';
import { TimesheetRecord } from '../model/Timesheet.entity';
import ExcelJS from 'exceljs';

export class ExcelTimesheetComposer implements IExcelComposer {
    composeHRSheet(data: TimesheetRecord[]) {
        const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Timesheet');

    // Add a row for the 'Sum' label above the header
    worksheet.addRow(['', '', '', 'Sum', '', '']); // 'Sum' label in column D

    // Set up the header row with new names
    worksheet.addRow(['STT', 'Sprint', 'PBI ID', 'Description', 'Hours', '', 'Date']); // Added a gap in the header

    // Start from the first data row
    let currentMasterGroup = '';
    let startRow = 3; // Data starts after the 'Sum' row and header row
    let rowNumber = startRow;

    data.forEach((record) => {
        // Create a new row with the row number
        const row = [rowNumber - 2, record.masterGroup, record.ticketId, record.description, record.numberOfHours, '', record.date];
        
        worksheet.addRow(row);

        // If the master group changes, merge the cell for the previous master group
        if (record.masterGroup !== currentMasterGroup) {
            if (currentMasterGroup) {
                // Merge cells for the previous master group, which are in column B
                worksheet.mergeCells(`B${startRow}:B${rowNumber - 1}`);
            }
            currentMasterGroup = record.masterGroup;
            startRow = rowNumber; // Update startRow for the new master group
            const mergedCell = worksheet.getCell(`B${startRow}`);
            mergedCell.alignment = { textRotation: 90, vertical: 'middle', horizontal: 'center' }; // Rotate text, center it
            mergedCell.font = { bold: true }; // Make text bold
        }

        rowNumber++; // Increment row number for the next iteration
    });

    // Merge the last group if applicable
    if (currentMasterGroup) {
        worksheet.mergeCells(`B${startRow}:B${rowNumber - 1}`);
    }

    // Insert the SUM formula for hours above the 'Hours' column
    worksheet.getCell(`E1`).value = { formula: `SUM(E3:E${rowNumber + 4})`, result: 0 };
    worksheet.getCell(`E1`).font = { bold: true };
    worksheet.getCell(`E1`).style = { alignment: { horizontal: 'right' } };

    // Format date column
    worksheet.getColumn('G').numFmt = 'mm/dd/yyyy';

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