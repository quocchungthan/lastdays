import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetaService implements OnDestroy {
  private unsubscribe$ = new Subject<void>();
  constructor(private _translateService: TranslateService) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public setPageName(content: string) {
    document.title = content;

    // Set Open Graph title
    let ogTitle = this._appendMetaTagIfNotExisted("og:title");
    ogTitle.setAttribute('content', content);

    // Set Twitter Card title
    let twitterTitle = this._appendMetaTagIfNotExisted("twitter:title");
    twitterTitle.setAttribute('content', content);
  }

  public resetPageName() {
    this._translateService.get("SLOGAN")
      .pipe(takeUntil(this.unsubscribe$)).subscribe((translatedSlogan) => {
        this.setPageName("Agile Link - " + translatedSlogan);
      });
  }

  private _appendMetaTagIfNotExisted(name: string) {
    let twitterTitle = document.querySelector(`meta[name="${name}"]`);
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta');
      twitterTitle.setAttribute('name', name);
      document.head.appendChild(twitterTitle);
    }
    return twitterTitle;
  }
}
