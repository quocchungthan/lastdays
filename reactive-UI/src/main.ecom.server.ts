import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app-ssr/app.config.server';
import { AppSsrComponent } from './app-ssr/app-ssr.component';

const bootstrap = () => bootstrapApplication(AppSsrComponent, config);

export default bootstrap;
