import { Routes } from '@angular/router';
import { BoardCreationComponent } from './pages/board-creation/board-creation.component';
import { UserIdentityComponent } from './pages/user-identity/user-identity.component';
import { BoardDetailComponent } from './pages/board-detail/board-detail.component';

export const routes: Routes = [
    {
        path: 'home',
        component: BoardCreationComponent,
        pathMatch: 'full'
    },
    {
        path: 'identity/:id',
        component: UserIdentityComponent,
        pathMatch: 'full'
    },
    {
        path: 'board/:id',
        component: BoardDetailComponent,
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
