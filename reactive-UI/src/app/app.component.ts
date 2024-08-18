import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../ui-utilities/layout/sidebar/sidebar.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { FormModalComponent } from '../ui-utilities/controls/form-modal/form-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [],
  imports: [RouterOutlet, SidebarComponent, TranslateModule, FormModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'reactive-ui';

  constructor(public translate: TranslateService) {
    translate.addLangs(['en']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en/) ? browserLang : 'en');
  }
}
