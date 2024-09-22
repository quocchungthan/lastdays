import { TimesheetRecord } from '../database/model/Timesheet.entity';
import ExcelJS from 'exceljs';

export interface IExcelComposer {
    composeHRSheet(data: TimesheetRecord[]): ExcelJS.Xlsx;
    composeRBSheets(data: TimesheetRecord[]): ExcelJS.Xlsx;
}