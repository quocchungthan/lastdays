import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { TopbarComponent } from '../../../ultilities/layout/topbar/topbar.component';
import { KONVA_CONTAINER } from '../../configs/html-ids.constants';
import { CanvasManager } from './managers/Canvas.manager';
import { ChatboxComponent } from '../../../ultilities/chat/chatbox/chatbox.component';
import { BookmarkComponent } from '../../../ultilities/icons/bookmark/bookmark.component';
import { BookmarkedComponent } from '../../../ultilities/icons/bookmarked/bookmarked.component';
import {
  DropDownItem,
  UiDropdownComponent,
} from '../../../ultilities/controls/ui-dropdown/ui-dropdown.component';
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
import { ViewportSizeService } from '../../services/browser/viewport-size.service';
import { ToolCompositionService } from '../../services/states/tool-composition.service';
import { ColorBoardComponent } from '../../../ultilities/painting/color-board/color-board.component';
import {
  Tool,
  ToolSelectorComponent,
} from '../../../ultilities/painting/tool-selector/tool-selector.component';
import { TOOL_ICON_FOLDER } from '../../configs/paths.constant';
import { EventsCompositionService } from '../../events/drawings/events-composition.service';
import { SyncingService } from '../../events/drawings/syncing.service';
import { SavedBoardsService } from '../../services/data-storages/saved-boards.service';
import { SavedBoard } from '../../services/data-storages/entities/SavedBoard';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    TopbarComponent,
    ChatboxComponent,
    BookmarkComponent,
    BookmarkedComponent,
    UiDropdownComponent,
    ColorBoardComponent,
    ToolSelectorComponent,
  ],
  providers: [
    ViewPortEventsManager,
    UserDrawingLayerManager,
    CursorManager,
    CanvasManager,
    BackgroundLayerManager,
    KonvaObjectService,
    ViewportSizeService,
    ToolCompositionService,
    EventsCompositionService,
    SyncingService,
  ],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss',
})
export class BoardDetailComponent implements AfterViewInit {
  KONVA_CONTAINER = KONVA_CONTAINER;

  @ViewChild('topBar')
  topBar: TopbarComponent | undefined;
  isSaved = false;
  supportedDrawingTools: Tool[] = [
    {
      id: '',
      label: 'Move',
      iconUrl: `${TOOL_ICON_FOLDER}grab.png`,
    },
    {
      id: StickyNoteCommands.CommandName,
      label: 'Sticky note',
      iconUrl: `${TOOL_ICON_FOLDER}sticky-note.png`,
    },
    {
      id: PencilCommands.CommandName,
      label: 'Pencil',
      iconUrl: `${TOOL_ICON_FOLDER}pencil.png`,
    },
  ];

  constructor(
    private _savedBoards: SavedBoardsService,
    private _urlExtractor: UrlExtractorService,
    private _activatedRoute: ActivatedRoute,
    private _konvaObjectService: KonvaObjectService,
    private _viewportSizeService: ViewportSizeService,
    private _canvasManager: CanvasManager,
    private _toolCompositionService: ToolCompositionService
  ) {
    this._activatedRoute.params.subscribe((x) => {
      this._urlExtractor.setBoardId(x['id']);
    });
  }

  get selectedToolId() {
    return this._canvasManager.tool;
  }

  get selectedColor() {
    return this._toolCompositionService.color;
  }

  setColor(value: string) {
    this._toolCompositionService.setColor(value);
  }

  @HostListener('window:resize')
  public onWindowResize(e: any) {
    this._konvaObjectService.setYOffset(this.topBar?.height ?? 0);
  }

  notSupportColor(toolId: string) {
    return toolId !== PencilCommands.CommandName;
  }

  onToolSelected(id: string) {
    if (id === this.selectedToolId) {
      return;
    }

    this._canvasManager?.setTool(id);
  }

  toggleSavedStatus() {
    this.isSaved = !this.isSaved;
    const subscription = this._urlExtractor.currentBoardIdChanges().subscribe((id) => {
      if (this.isSaved) {
        var newSavingAction = new SavedBoard();

        newSavingAction.boardId = id;
        this._savedBoards.create(newSavingAction).then(() => {
          // console.log('Saved the board ', id);

          subscription.unsubscribe();
        });
      } else {
        this._savedBoards.delete(id).then(() => {
          // console.log('Unsaved the board ', id);
          subscription.unsubscribe();
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this._resetTheViewPort();
    this._viewportSizeService.blockTheWheel();
    const subscription = this._urlExtractor.currentBoardIdChanges().subscribe((id) => {
      this._savedBoards.index().then(savedBoards => {
        this.isSaved = savedBoards.some(x => x.boardId === id);
        subscription.unsubscribe();
      });

    });
  }

  private _resetTheViewPort() {
    this._konvaObjectService.initKonvaObject();
    this._konvaObjectService.setYOffset(this.topBar?.height ?? 0);
    this._konvaObjectService.viewPortChanges.subscribe(() => {
      this._canvasManager.drawBackground();
    });
  }
}
