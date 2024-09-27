import { Routes } from '@angular/router';
import { ComposedComponent } from './pages/composed/composed.component';

export const routes: Routes = [
   {
      path: '',
      component: ComposedComponent,
      pathMatch: 'full'
  },
  {
      path: '**',
      redirectTo: ''
  }
];
