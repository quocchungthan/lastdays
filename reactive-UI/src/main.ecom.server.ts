import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app-ecom/app.config.server';
import { AppEcomComponent } from './app-ecom/app-ecom.component';

const bootstrap = () => bootstrapApplication(AppEcomComponent, config);

export default bootstrap;
