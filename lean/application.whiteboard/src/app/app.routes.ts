import { Routes } from '@angular/router';
import { BoardDetailComponent } from './board-detail/board-detail.component';
import { BoardAutoCreationComponent } from './board-auto-creation/board-auto-creation.component';
export const routes: Routes = [
   {
       path: 'board/:id',
       component: BoardDetailComponent,
       data: {},
       pathMatch: 'prefix',
   },
   {
       path: '**',
       component: BoardAutoCreationComponent
   }
];
