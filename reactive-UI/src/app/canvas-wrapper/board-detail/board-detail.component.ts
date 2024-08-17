import {
  AfterViewInit,
  Component,
  HostListener,
  ViewChild,
} from '@angular/core';
import { TopbarComponent } from '../../../utilities/layout/topbar/topbar.component';
import { KONVA_CONTAINER } from '../../../configs/html-ids.constants';
import { ChatboxComponent } from '../../../utilities/chat/chatbox/chatbox.component';
import { BookmarkComponent } from '../../../utilities/icons/bookmark/bookmark.component';
import { BookmarkedComponent } from '../../../utilities/icons/bookmarked/bookmarked.component';
import {
  UiDropdownComponent,
} from '../../../utilities/controls/ui-dropdown/ui-dropdown.component';
import { UrlExtractorService } from '../../services/browser/url-extractor.service';
import { ActivatedRoute } from '@angular/router';
import { KonvaObjectService } from '../services/3rds/konva-object.service';
import { ViewportSizeService } from '../../services/browser/viewport-size.service';
import { ToolCompositionService } from '../../services/states/tool-composition.service';
import { ColorBoardComponent } from '../../../utilities/painting/color-board/color-board.component';
import {
  Tool,
  ToolSelectorComponent,
} from '../../../utilities/painting/tool-selector/tool-selector.component';
import { TOOL_ICON_FOLDER } from '../../../configs/paths.constant';
import { EventsCompositionService } from '../../events/drawings/events-composition.service';
import { SyncingService } from '../../../dependencies/syncing.service';
import { SavedBoardsService } from '../../services/data-storages/saved-boards.service';
import { SavedBoard } from '../../services/data-storages/entities/SavedBoard';
import { PencilCommands } from '../commands/pencil.command';
import { StickyNoteCommands } from '../commands/sticky-notes.command';
import { TextInputCommands } from '../commands/text-input.command';
import { BackgroundLayerManager } from '../managers/BackgroundLayer.manager';
import { CanvasManager } from '../managers/Canvas.manager';
import { CursorManager } from '../managers/Cursor.manager';
import { UserDrawingLayerManager } from '../managers/UserDrawingLayer.manager';
import { ViewPortEventsManager } from '../managers/ViewPortEvents.manager';

@Component({
  selector: 'app-board-detail',
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
      // TODO: i18n
      label: 'Move',
      iconUrl: `${TOOL_ICON_FOLDER}grab.png`,
    },
    {
      id: StickyNoteCommands.CommandName,
      // TODO: i18n
      label: 'Sticky note',
      iconUrl: `${TOOL_ICON_FOLDER}${StickyNoteCommands.IconPng}`,
    },
    {
      id: PencilCommands.CommandName,
      // TODO: i18n
      label: 'Pencil',
      iconUrl: `${TOOL_ICON_FOLDER}${PencilCommands.IconPng}`,
    },
    {
      id: TextInputCommands.CommandName,
      // TODO: i18n
      label: 'Pencil',
      iconUrl: `${TOOL_ICON_FOLDER}${TextInputCommands.IconPng}`,
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
    // TODO: add flags to command class to specify if the command supports Color
    return ![PencilCommands.CommandName, TextInputCommands.CommandName].includes(toolId);
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
