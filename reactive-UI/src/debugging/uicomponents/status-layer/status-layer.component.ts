import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MetaConfiguration } from '../../../dependencies/meta/model/configuration.interface';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'debug-status-layer',
  standalone: true,
  imports: [],
  templateUrl: './status-layer.component.html',
  styleUrl: './status-layer.component.scss'
})
export class StatusLayerComponent {
  debugEnabled: boolean;

  constructor(private _httpClient: HttpClient, private _activated: ActivatedRoute) {
    this.debugEnabled = false;
    _httpClient.get<MetaConfiguration>('/api/configuration')
      .pipe(catchError(() => {
        return of({debugMode: true});
      }))
      .subscribe((configuration) => {
        this.debugEnabled = configuration.debugMode;
      });
  }
}
