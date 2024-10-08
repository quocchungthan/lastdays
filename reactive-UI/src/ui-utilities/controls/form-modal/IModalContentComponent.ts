import { EventEmitter } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

export class ModalContentComponent {
    dialogTitle = '';
    onPreviewCreated = new EventEmitter();

    constructor(translateService: TranslateService) {}
}