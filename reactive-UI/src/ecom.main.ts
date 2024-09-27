import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app-ecom/app.config';
import { AppEcomComponent } from './app-ecom/app-ecom.component';

bootstrapApplication(AppEcomComponent, appConfig)
  .catch((err) => console.error(err));
