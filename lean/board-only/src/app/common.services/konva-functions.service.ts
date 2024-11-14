import { BehaviorSubject, filter, map } from "rxjs";
import { KONVA_CONTAINER } from "../common.definitions/id.constants";
import { Injectable } from "@angular/core";

@Injectable()
export class KonvaFunctionService {
   private _viewPort: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() { 
  }

  public initKonvaObject() {
   import('konva').then((x: any) => {
      console.log(x);
      // this._viewPort.next(new Konva.Stage({
      //    container: KONVA_CONTAINER,
      //    width: window.innerWidth,
      //    height: window.innerHeight,
      //    draggable: true,
      //  }));
   });
  }

  public setYOffset() {
    this._viewPort.getValue()?.height(window.innerHeight);
    this._viewPort.getValue()?.width(window.innerWidth);
    this._viewPort.next(this._viewPort.getValue());
  }

  public get viewPortChanges () {
    return this._viewPort.pipe(filter(x => !!x), map(x => x as any));
  }
}