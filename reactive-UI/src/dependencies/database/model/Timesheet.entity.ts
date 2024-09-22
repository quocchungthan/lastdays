export class TimesheetRecord {
    /** Sprint name */
    masterGroup: string = '';
    /** Prefixed with RB or PBI */
    ticketId: string = '';
    project: string = '';
    description: string = '';
    numberOfHours: number = 1;
    date: Date = new Date();
}

export enum Project {
    CirrusPro,
    HikingReport,
}