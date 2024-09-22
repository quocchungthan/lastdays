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
        let rowNumber = 1;
    
        data.forEach((record) => {
            // Add a new row with the row number
            const row = [rowNumber, record.masterGroup, record.ticketId, record.description, record.numberOfHours, record.date];
    
            // If the master group changes, merge the cell for the master group
            if (record.masterGroup !== currentMasterGroup) {
                if (currentMasterGroup) {
                    // Merge cells for the previous master group
                    worksheet.mergeCells(`B${rowNumber - 1}:${`B${rowNumber}`}`);
                }
                currentMasterGroup = record.masterGroup;
                rowNumber++;
            } else {
                // If it's the same master group, just increment the row number
                rowNumber++;
            }
    
            worksheet.addRow(row);
        });
    
        // Merge the last group if applicable
        if (currentMasterGroup) {
            worksheet.mergeCells(`B${rowNumber - 1}:${`B${rowNumber}`}`);
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
        let rowNumber = 1;
    
        data.forEach((record) => {
            // Add a new row with the row number
            const row = [rowNumber, record.masterGroup, record.ticketId, record.description, record.numberOfHours, record.date];
    
            // If the master group changes, merge the cell for the master group
            if (record.masterGroup !== currentMasterGroup) {
                if (currentMasterGroup) {
                    // Merge cells for the previous master group
                    worksheet.mergeCells(`B${rowNumber - 1}:${`B${rowNumber}`}`);
                }
                currentMasterGroup = record.masterGroup;
                rowNumber++;
            } else {
                // If it's the same master group, just increment the row number
                rowNumber++;
            }
    
            worksheet.addRow(row);
        });
    
        // Merge the last group if applicable
        if (currentMasterGroup) {
            worksheet.mergeCells(`B${rowNumber - 1}:${`B${rowNumber}`}`);
        }
    
        // Format date column
        worksheet.getColumn('F').numFmt = 'mm/dd/yyyy';

        return workbook.xlsx;
    }
}