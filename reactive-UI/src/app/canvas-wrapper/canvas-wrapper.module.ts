import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BoardDetailComponent } from './board-detail/board-detail.component';
import { TopbarComponent } from '../../ui-utilities/layout/topbar/topbar.component';
import { ToolSelectorComponent } from '../../ui-utilities/painting/tool-selector/tool-selector.component';
import { ChatboxComponent } from '../../ui-utilities/chat/chatbox/chatbox.component';
import { ColorBoardComponent } from '../../ui-utilities/painting/color-board/color-board.component';
import { BookmarkComponent } from '../../ui-utilities/icons/bookmark/bookmark.component';
import { BookmarkedComponent } from '../../ui-utilities/icons/bookmarked/bookmarked.component';

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
