import Konva from "konva";
import { Point } from "../../../../ultilities/types/Point";
import { ToolCompositionService } from "../../../services/states/tool-composition.service";
import { TextInputFinishedEvent } from "../../../events/drawings/EventQueue";

export class TextInputCommands {
    public static readonly CommandName = "text-input";
    public static readonly IconPng = 'input.png';
    public static CLASS_NAME = "TEXT_INPUT";
    private _currentObject?: Konva.Group;

    /**
     *
     */
    constructor(private _layer: Konva.Layer, private _toolComposition: ToolCompositionService) {
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
        
    }

    public parseFromJson(shape: Konva.Shape) {
        
    }

    public getNativeElementById(id: string) {
        
    }

    public parseFromEvent(event: TextInputFinishedEvent) {

    }
}