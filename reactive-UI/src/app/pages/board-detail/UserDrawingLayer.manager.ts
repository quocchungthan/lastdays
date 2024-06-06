import Konva from "konva";
import { PRIMARY_COLOR } from "../../configs/theme.constants";
import { IViewPortEventsManager } from "./ViewPortEvents.manager";
import { PencilCommands } from "./commands/pencil.command";

export class UserDrawingLayerManager {
    private _drawingLayer: Konva.Layer;
    // TODO: Theme and tool are duplicated where they're stored
    private _theme =  {
        primary: PRIMARY_COLOR
    }
    private _tool: string = '';
    private _pencil: PencilCommands;

    constructor(private _viewPort: Konva.Stage, private _events: IViewPortEventsManager) {
        this._drawingLayer = new Konva.Layer();
        this._viewPort.add(this._drawingLayer);
        this._pencil = new PencilCommands(this._drawingLayer);
        this._events.onTouchStart()
            .subscribe((p) => {
                if (this._tool === PencilCommands.CommandName) {
                 this._pencil.penDown(p);
                } 
             });
        this._events.onTouchMove()
             .subscribe((p) => {
                 if (this._tool === PencilCommands.CommandName) {
                  this._pencil.penMove(p);
                 } 
              });

        this._events.onTouchEnd()
             .subscribe((p) => {
                 if (this._tool === PencilCommands.CommandName) {
                  this._pencil.penUp();
                 } 
              });
        this._events.onMouseOut()
              .subscribe((p) => {
                  if (this._tool === PencilCommands.CommandName) {
                   // TODO: Store to local database as an event in case the site is refrehsed
                   // TODO: Flow
                   // TODO: Command via chat
                   this._pencil.penUp();
                  } 
               });
    }
    
    setTool(tool: string) {
        this._tool = tool;
    }
}