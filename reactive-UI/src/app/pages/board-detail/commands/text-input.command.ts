import Konva from "konva";
import { Point } from "../../../../utilities/types/Point";
import { ToolCompositionService } from "../../../services/states/tool-composition.service";
import { TextInputFinishedEvent } from "../../../events/drawings/EventQueue";
import { Observable } from "rxjs";
import { FormModalService } from '../../../../utilities/controls/form-modal.service';

export class TextInputCommands {
    public static readonly CommandName = "text-input";
    public static readonly IconPng = 'input.png';
    public static CLASS_NAME = "TEXT_INPUT";
    private _currentObject?: Konva.Group;
    private _triggerTextInputFinishedCallback?: () => void;

    /**
     *
     */
    constructor(private _layer: Konva.Layer, private _toolComposition: ToolCompositionService, private _formModalService: FormModalService) {
    }

    extractId(nativeElement: Konva.Line) {
        return nativeElement.name().split(" ").find(x => x !== "" && x !== TextInputCommands.CLASS_NAME) ?? "";
    }

    // #start region - TODO: decide the size of text
    public penDown(position: Point) {
        
    }

    public penMove(position: Point) {

    }
    // #end region

    public renderComponentAndFocus() {
        return new Observable<Konva.Group>((observer) => {
            this._formModalService.open();
            this._triggerTextInputFinishedCallback = () => {
                observer.next(this._currentObject);
            }
        });
    }

    public parseFromJson(shape: Konva.Shape) {
        
    }

    public getNativeElementById(id: string) {
        
    }

    public parseFromEvent(event: TextInputFinishedEvent) {

    }
}