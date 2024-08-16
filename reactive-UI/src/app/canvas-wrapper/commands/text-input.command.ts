import Konva from "konva";
import { Observable } from "rxjs";
import { FormModalService } from "../../../utilities/controls/form-modal.service";
import { Point } from "../../../utilities/types/Point";
import { TextEnteredEvent } from "../../events/drawings/EventQueue";
import { ToolCompositionService } from "../../services/states/tool-composition.service";
import { TextInputCommandsFormComponent } from "../text-input-commands-form/text-input-commands-form.component";

export class TextInputCommands {
    public static readonly CommandName = "text-input";
    public static readonly IconPng = 'input.png';
    public static CLASS_NAME = "TEXT_INPUT";
    private _triggerTextInputFinishedCallback?: () => void;

    /**
     *
     */
    constructor(
        private _layer: Konva.Layer, 
        private _toolComposition: ToolCompositionService, 
        private _formModalService: FormModalService) {
            this._formModalService.onOk()
                .subscribe(() => this._triggerTextInputFinishedCallback?.());
    }

    extractId(nativeElement: Konva.Text) {
        return nativeElement.name().split(" ").find(x => x !== "" && x !== TextInputCommands.CLASS_NAME) ?? "";
    }

    // #start region - TODO: decide the size of text
    public penDown(position: Point) {
        
    }

    public penMove(position: Point) {

    }
    // #end region

    public renderComponentAndFocus() {
        return new Observable<Konva.Text>((observer) => {
            this._formModalService.open(TextInputCommandsFormComponent);
            this._triggerTextInputFinishedCallback = () => {
                const contentComponent = this._formModalService.getDialogContentComponent();
                if (contentComponent instanceof TextInputCommandsFormComponent) {
                    observer.next(contentComponent.builtComponent);
                    contentComponent.ngOnDestroy();
                } else {
                    throw new Error("The native component should be ready right now when user hit submit button on the dialog");
                }
            }
        });
    }

    public parseFromJson(shape: Konva.Shape) {
        
    }

    public getNativeElementById(id: string) {
        return this._layer.children.filter((o) => {
            return o instanceof Konva.Text && o.hasName(TextInputCommands.CLASS_NAME);
        })
        .map(s => s as Konva.Text)
        .find(x => x.hasName(id))!;
    }

    public parseFromEvent(event: TextEnteredEvent) {
        const konvaText = TextInputCommandsFormComponent.BuildTextComponent(
            event.text,
            event.color,
            event.position,
            {
              width: event.containerWidth,
              height: event.containerheight,
            }
          );
        konvaText.addName(event.targetId);
        konvaText.draggable(false);
        this._layer.add(konvaText);
    }
}