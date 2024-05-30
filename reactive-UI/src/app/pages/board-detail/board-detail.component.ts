import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { TopbarComponent } from '../../../ultilities/layout/topbar/topbar.component';
import { KONVA_CONTAINER } from '../../configs/html-ids.constants';
import Konva from 'konva';
import { HORIZONTAL_SCROLL_BAR_SIZE } from '../../configs/html-native-size.constants';
import { CanvasManager } from './Canvas.manager';
import { ChatboxComponent } from '../../../ultilities/chat/chatbox/chatbox.component';
import { BookmarkComponent } from '../../../ultilities/icons/bookmark/bookmark.component';
import { BookmarkedComponent } from '../../../ultilities/icons/bookmarked/bookmarked.component';
import { DropDownItem, UiDropdownComponent } from '../../../ultilities/controls/ui-dropdown/ui-dropdown.component';
import { StickyNoteCommands } from './commands/sticky-notes.command';
import { PencilCommands } from './commands/pencil.command';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [TopbarComponent, ChatboxComponent, BookmarkComponent, BookmarkedComponent, UiDropdownComponent],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'
})
export class BoardDetailComponent implements AfterViewInit {
  KONVA_CONTAINER = KONVA_CONTAINER;

  @ViewChild('topBar')
  topBar: TopbarComponent | undefined;
  isSaved = false;
  selectedToolId = '';
  supportedDrawingTools: DropDownItem[] = [
    {
      id: StickyNoteCommands.CommandName,
      name: "Sticky note"
    },
    {
      id: PencilCommands.CommandName,
      name: "Pencil"
    }
  ];

  private _canvasManager: CanvasManager | undefined;

  constructor() {
  }

  onToolSelected(id: string) {
    this.selectedToolId = id;
  }

  toggleSavedStatus() {
    this.isSaved = !this.isSaved;
  }

  ngAfterViewInit(): void {
    this._resetTheViewPort();
  }

  private _resetTheViewPort() {
    const scrollBarHeight = HORIZONTAL_SCROLL_BAR_SIZE;
    const viewPort = new Konva.Stage({
      container: KONVA_CONTAINER,
      width: window.innerWidth,
      height: window.innerHeight - (this.topBar?.height ?? 0) - scrollBarHeight,
      draggable: true,
    });

    this._canvasManager = new CanvasManager(viewPort);
    this._canvasManager.drawBackground();
  }
}
