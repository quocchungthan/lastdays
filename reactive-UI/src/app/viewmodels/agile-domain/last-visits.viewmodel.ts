class BoardBasicData {
    id: string = '';
    name: string = '';
    previewUrl: string = '';
    timeStamp: Date = new Date();
}

export class LastVisits extends Array<BoardBasicData> {

}