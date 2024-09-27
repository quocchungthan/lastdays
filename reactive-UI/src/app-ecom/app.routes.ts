import { Routes } from '@angular/router';
import { ComposedComponent } from './pages/composed/composed.component';
import { WritingComponent } from './pages/writing/writing.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: ComposedComponent,
    pathMatch: 'full',
  },
  {
    path: 'bai-viet/:descriptiveKey',
    component: WritingComponent,
    pathMatch: 'prefix',
  },
  {
    path: 'khong-tim-thay-trang',
    component: NotFoundComponent,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'khong-tim-thay-trang',
  },
];
