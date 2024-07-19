import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  constructor() { }

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
    // TODO: i18n
    this.setPageName("Agile Link - Simplicity is essential");
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
