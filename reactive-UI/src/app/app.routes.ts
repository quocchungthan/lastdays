import { Routes } from '@angular/router';
import { BoardCreationComponent } from './pages/board-creation/board-creation.component';
import { UserIdentityComponent } from './pages/user-identity/user-identity.component';
import { BoardDetailComponent } from './pages/board-detail/board-detail.component';
import { SEGMENT_TO_BOARD_DETAIL, SEGMENT_TO_IDENTITY_PAGE } from './configs/routing.consants';

export const routes: Routes = [
    {
        path: 'home',
        component: BoardCreationComponent,
        pathMatch: 'full'
    },
    {
        path: SEGMENT_TO_IDENTITY_PAGE + '/:id',
        component: UserIdentityComponent,
        pathMatch: 'full'
    },
    {
        path: SEGMENT_TO_BOARD_DETAIL + '/:id',
        component: BoardDetailComponent,
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
