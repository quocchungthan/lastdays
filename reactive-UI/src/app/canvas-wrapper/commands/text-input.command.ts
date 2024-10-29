import Konva from "konva";
import { Observable } from "rxjs";
import { FormModalService } from "../../../ui-utilities/controls/form-modal.service";
import { Point } from "../../../ui-utilities/types/Point";
import { TextEnteredEvent } from "../../events/drawings/EventQueue";
import { ToolCompositionService } from "../../services/states/tool-composition.service";
import { TextInputCommandsFormComponent } from "../text-input-commands-form/text-input-commands-form.component";
import guid from 'guid';
import { STANDARD_STICKY_NOTE_SIZE } from '@config/size';

export class TextInputCommands {
    public static readonly CommandName = "text-input";
    public static readonly IconPng = 'input.png';
    public static CLASS_NAME = "TEXT_INPUT";
    private _triggerTextInputFinishedCallback?: () => void;
    private _triggerTextInputCanceledCallback?: () => void;

    /**
     *
     */
    constructor(
        private _layer: Konva.Layer, 
        private _toolComposition: ToolCompositionService, 
        private _formModalService: FormModalService) {
            this._formModalService.onOk()
                .subscribe(() => this._triggerTextInputFinishedCallback?.());           
            this._formModalService.onCancel()
                .subscribe(() => this._triggerTextInputCanceledCallback?.());
    }

    static buildEvent(brandNewDrawing: Konva.Text, boardId: string, targetId?: string) {
        const event = new TextEnteredEvent();
        TextInputCommands.fillEvent(event, boardId, targetId);
        event.text = brandNewDrawing.text();
        event.color = brandNewDrawing.fill();
        event.position = brandNewDrawing.position();
        event.containerWidth = brandNewDrawing.width();
        event.containerheight = brandNewDrawing.height();
        return event;
    }

    static fillEvent(event: TextEnteredEvent, boardId: string, targetId?: string) {
        event.targetId = targetId ?? guid.create().toString();
        event.boardId = boardId;
        event.containerWidth = event.containerWidth || STANDARD_STICKY_NOTE_SIZE;
        event.containerheight = event.containerheight || STANDARD_STICKY_NOTE_SIZE;
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

    public renderComponentAndFocus(p: Point) {
        return new Observable<Konva.Text>((observer) => {
            this._formModalService.onPreviewRendered().subscribe(() => {
                const contentComponent = this._formModalService.getDialogContentComponent();
                if (contentComponent instanceof TextInputCommandsFormComponent) {
                    contentComponent.preview.position({ x: p.x - contentComponent.preview.width(), y: p.y - contentComponent.preview.height()});
                    contentComponent.preview.children
                        .filter(x => x instanceof Konva.Text)
                        .map(x => x as Konva.Text)[0]?.fill(this._toolComposition.color);
                    this._layer.add(contentComponent.preview);
                } else {
                    throw new Error("The native component should be ready right now when user hit submit button on the dialog");
                }
            });
            this._formModalService.open(TextInputCommandsFormComponent);
            this._triggerTextInputFinishedCallback = () => {
                const contentComponent = this._formModalService.getDialogContentComponent();
                if (contentComponent instanceof TextInputCommandsFormComponent) {
                    contentComponent.builtComponent.x(contentComponent.preview.x() + contentComponent.builtComponent.x());
                    contentComponent.builtComponent.y(contentComponent.preview.y() + contentComponent.builtComponent.y());
                    contentComponent.builtComponent.width(contentComponent.builtComponent.textWidth);
                    contentComponent.builtComponent.height(contentComponent.builtComponent.textHeight);
                    contentComponent.builtComponent.fill(this._toolComposition.color);
                    observer.next(contentComponent.builtComponent);
                    contentComponent.ngOnDestroy();
                } else {
                    throw new Error("The native component should be ready right now when user hit submit button on the dialog");
                }
            }
            this._triggerTextInputCanceledCallback = () => {
                const contentComponent = this._formModalService.getDialogContentComponent();
                if (contentComponent instanceof TextInputCommandsFormComponent) {
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