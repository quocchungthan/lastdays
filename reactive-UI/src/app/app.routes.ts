import { Routes } from '@angular/router';
import { TestKonvaNg2Component } from '../ultilities/painting/test-konva-ng2/test-konva-ng2.component';

export const routes: Routes = [
    {
        path: 'konva',
        component: TestKonvaNg2Component,
        pathMatch: 'full'
    }
];
