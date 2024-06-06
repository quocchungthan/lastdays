import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { TopbarComponent } from '../../../ultilities/layout/topbar/topbar.component';
import { KONVA_CONTAINER } from '../../configs/html-ids.constants';
import { CanvasManager } from './managers/Canvas.manager';
import { ChatboxComponent } from '../../../ultilities/chat/chatbox/chatbox.component';
import { BookmarkComponent } from '../../../ultilities/icons/bookmark/bookmark.component';
import { BookmarkedComponent } from '../../../ultilities/icons/bookmarked/bookmarked.component';
import { DropDownItem, UiDropdownComponent } from '../../../ultilities/controls/ui-dropdown/ui-dropdown.component';
import { StickyNoteCommands } from './commands/sticky-notes.command';
import { PencilCommands } from './commands/pencil.command';
import { BoardsService } from '../../services/data-storages/boards.service';
import { UrlExtractorService } from '../../services/browser/url-extractor.service';
import { ActivatedRoute } from '@angular/router';
import { KonvaObjectService } from '../../services/3rds/konva-object.service';
import { UserDrawingLayerManager } from './managers/UserDrawingLayer.manager';
import { BackgroundLayerManager } from './managers/BackgroundLayer.manager';
import { ViewPortEventsManager } from './managers/ViewPortEvents.manager';
import { CursorManager } from './managers/Cursor.manager';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [TopbarComponent, ChatboxComponent, BookmarkComponent, BookmarkedComponent, UiDropdownComponent],
  providers: [ViewPortEventsManager, UserDrawingLayerManager, CursorManager, CanvasManager, BackgroundLayerManager, KonvaObjectService],
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
      id: '',
      name: "Move"
    },
    {
      id: StickyNoteCommands.CommandName,
      name: "Sticky note"
    },
    {
      id: PencilCommands.CommandName,
      name: "Pencil"
    }
  ];

  constructor(
    private _boards: BoardsService, 
    private _urlExtractor: UrlExtractorService, 
    private _activatedRoute: ActivatedRoute,
    private _konvaObjectService: KonvaObjectService,
    private _canvasManager: CanvasManager) {
    this._activatedRoute.params.subscribe(x => {
      this._urlExtractor.setBoardId(x['id']);
    });
  }

  onToolSelected(id: string) {
    this.selectedToolId = id;
    this._canvasManager?.setTool(id);
  }

  toggleSavedStatus() {
    this.isSaved = !this.isSaved;
  }

  ngAfterViewInit(): void {
    this._resetTheViewPort();
  }

  

  private _resetTheViewPort() {
    this._konvaObjectService.initKonvaObject();
    this._konvaObjectService.setYOffset(this.topBar?.height ?? 0);
    this._konvaObjectService.viewPortChanges
      .subscribe(() => {
        this._canvasManager.drawBackground();
      });
  }
}
