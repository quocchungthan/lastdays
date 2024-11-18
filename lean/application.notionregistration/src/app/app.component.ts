import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private _authUrl: string = '';
  title = 'AL Portal';

  private _registeredTables: any[] = [];

  constructor() {
    this.csrInit();
  }

  get authUrl() {
    return this._authUrl;
  }

  get registeredTables() {
    return this._registeredTables;
  }

  csrInit() {
    this.loadConfiguration()
    .then((data) => {
      this._authUrl = data.authUrl;
    });

    this.loadRegisteredPage()
      .then((data) => {
        this._registeredTables = data;
      });
  }

  private loadRegisteredPage() {
    return fetch('/api/portal/registered').then((response) => response.json());
  }

  private loadConfiguration() {
    return fetch('/api/portal/configuration').then((response) => response.json());
  }
}
