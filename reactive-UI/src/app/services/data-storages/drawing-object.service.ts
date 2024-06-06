import { Injectable } from '@angular/core';
import { CrudBaseService } from './crudbase.service';
import { DrawingObject } from './entities/DrawingObject';

@Injectable({
  providedIn: 'root'
})
export class DrawingObjectService extends CrudBaseService<DrawingObject> {
  constructor() {
    super(DrawingObject);
   }
}
