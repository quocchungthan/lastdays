import { AfterViewInit, Component, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../ultilities/layout/sidebar/sidebar.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { BackendConfigurationService } from '../configurations/backend-configuration.service';
import { IStationsService, TOKEN } from './services/3rds/i-stations.service';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [],
  imports: [RouterOutlet, SidebarComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'reactive-ui';

  constructor(
    public translate: TranslateService,
    private _configurations: BackendConfigurationService,
    @Inject(TOKEN) private _stationsService: IStationsService
  ) {
    translate.addLangs(['en']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en/) ? browserLang : 'en');
  }

  ngAfterViewInit(): void {
    this._stationsService.fetchStationListAsync()
      .subscribe((stations) => {
        console.log(stations);
      });
    window.alert(this._configurations.preconfigMessage);
  }
}
