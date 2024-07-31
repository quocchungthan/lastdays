import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export const TOKEN = new InjectionToken<IStationsService>('StationsService');

export interface IStationsService {
    fetchStationListAsync(): Observable<[{belongsTo: string}]>;
}