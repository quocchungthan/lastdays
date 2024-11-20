import { Component } from '@angular/core';
import { AppNavigationComponent } from '@cbto/nodepackages.utils/frontend-components/app-navigation/app-navigation.component';
import { ALAppNavigation } from '@cbto/nodepackages.utils/models/app-navigation.alportal.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppNavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private _authUrl: string = '';
  title = 'AL Portal';

  private _registeredTables: any[] = [];
  private _appNavigationList: ALAppNavigation[] = [];

  constructor() {
    this.csrInit();
  }

  get authUrl() {
    return this._authUrl;
  }

  get registeredTables() {
    return this._registeredTables;
  }

  get appNavigationList() {
    return this._appNavigationList;
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
    this.loadAppNavigations()
      .then((data) => {
        this._appNavigationList = data;
      });
  }

  private loadRegisteredPage() {
    return fetch('/api/portal/registered').then((response) => response.json());
  }

  private loadAppNavigations() {
    return fetch('/api/portal/app-navigation').then((response) => response.json());
  }

  private loadConfiguration() {
    return fetch('/api/portal/configuration').then((response) => response.json());
  }
}
