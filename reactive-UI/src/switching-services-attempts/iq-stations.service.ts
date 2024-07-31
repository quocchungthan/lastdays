import { Injectable } from '@angular/core';
import { IStationsService } from '../app/services/3rds/i-stations.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IqStationsService implements IStationsService {

  constructor() {
  }

  fetchStationListAsync(): Observable<[{ belongsTo: string; }]> {
    return of([{belongsTo: 'iq4'}]);
  }
}
