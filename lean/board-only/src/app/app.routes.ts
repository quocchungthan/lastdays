import { Routes } from '@angular/router';
import { BoardAutoCreationComponent } from './pages/board-auto-creation/board-auto-creation.component';
import { CanvasBoardComponent } from './pages/canvas-board/canvas-board.component';

export const routes: Routes = [
   {
      path: 'board',
      component: BoardAutoCreationComponent,
      pathMatch: 'full'
   },
   {
      path: 'board/:id',
      component: CanvasBoardComponent,
   },
   {
      path: '**',
      redirectTo: 'board'
   }
];
