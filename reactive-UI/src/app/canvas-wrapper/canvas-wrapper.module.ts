import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BoardDetailComponent } from './board-detail/board-detail.component';
import { TopbarComponent } from '../../utilities/layout/topbar/topbar.component';
import { ToolSelectorComponent } from '../../utilities/painting/tool-selector/tool-selector.component';
import { ChatboxComponent } from '../../utilities/chat/chatbox/chatbox.component';
import { ColorBoardComponent } from '../../utilities/painting/color-board/color-board.component';
import { BookmarkComponent } from '../../utilities/icons/bookmark/bookmark.component';
import { BookmarkedComponent } from '../../utilities/icons/bookmarked/bookmarked.component';

const routes: Routes = [
  {
    path: ':id',
    component: BoardDetailComponent,
  },
];


@NgModule({
  declarations: [
    BoardDetailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    TopbarComponent,
    ToolSelectorComponent,
    ChatboxComponent,
    ColorBoardComponent,
    BookmarkComponent,
    BookmarkedComponent,
    CommonModule
  ]
})
export class CanvasWrapperModule { }
