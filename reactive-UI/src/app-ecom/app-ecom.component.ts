import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChatGeneralComponent } from '@ui/chat/chat-general/chat-general.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatGeneralComponent],
  templateUrl: './app-ecom.component.html',
  styleUrl: './app-ecom.component.scss'
})
export class AppEcomComponent {
  constructor(public translate: TranslateService) {
    translate.addLangs(['en']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en/) ? browserLang : 'en');
  }
}
