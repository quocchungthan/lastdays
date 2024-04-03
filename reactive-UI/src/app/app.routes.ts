import { Routes } from '@angular/router';
import { TestKonvaNg2Component } from '../ultilities/painting/test-konva-ng2/test-konva-ng2.component';
import { BreakDownComponent } from './pages/break-down/break-down.component';

export const routes: Routes = [
    {
        path: 'konva',
        component: TestKonvaNg2Component,
        pathMatch: 'full'
    },
    {
        path: 'expiriments/break-down',
        component: BreakDownComponent,
        pathMatch: 'full'
    }
];
