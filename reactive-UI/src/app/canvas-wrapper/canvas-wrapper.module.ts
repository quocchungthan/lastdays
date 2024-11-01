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
import { StatusLayerComponent } from "../../debugging/uicomponents/status-layer/status-layer.component";
import { FullScreenComponent } from "../../ui-utilities/icons/full-screen/full-screen.component";

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
    CommonModule,
    StatusLayerComponent,
    FullScreenComponent
]
})
export class CanvasWrapperModule { }
