import { Injectable } from '@angular/core';
import { CrudBaseService } from './crudbase.service';
import { Board } from './entities/Board';
import { BoardBasicData, LastVisits } from '../../viewmodels/agile-domain/last-visits.viewmodel';

@Injectable({
  providedIn: 'root'
})
export class BoardsService extends CrudBaseService<Board> {

  constructor() {
    super(Board);
  }

  override async index() {
    const all = await super.index();
    return all.map((x) => {
      if (typeof(x.modifiedTime) === 'string') {
        x.modifiedTime = new Date(Date.parse(x.modifiedTime));
      }
      return x;
    })
  }

  async recentUpdatedBoards(): Promise<LastVisits> {
    const all = await this.index();

    return all
      .sort((b, a) => a.modifiedTime.getTime() - b.modifiedTime.getTime())
      .slice(0, 3)
      .map(this.mapToBasicData);
  }

  mapToBasicData = (x: Board) => ({
    id: x.id,
    name: x.name,
    timeStamp: x.modifiedTime,
    // TODO: icon, place holder, default background. generate preview/thumbnail after.
    previewUrl: '/assets/default-preview-pic.jpg'
  }) as BoardBasicData
}
