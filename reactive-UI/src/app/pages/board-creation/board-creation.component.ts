import { AfterViewInit, Component } from '@angular/core';
import { LastVisits } from '../../viewmodels/agile-domain/last-visits.viewmodel';
import { TopbarComponent } from '../../../ui-utilities/layout/topbar/topbar.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from '../../services/ui-notifications/toaster.service';
import { BoardsService } from '../../services/data-storages/boards.service';
import { Board } from '../../services/data-storages/entities/Board';
import { Router } from '@angular/router';
import { SEGMENT_TO_BOARD_DETAIL } from '../../../configs/routing.consants';
import { DEFAULT_BOARD_NAME } from '../../../configs/default-value.constants';
import { BoardGridComponent } from '../../components/board-grid/board-grid.component';
import { EventsService } from '../../services/data-storages/events.service';
import { BoardedCreatedEvent } from '../../events/drawings/EventQueue';
import { EventsCompositionService } from '../../events/drawings/events-composition.service';
import { MetaService } from '../../services/browser/meta.service';
import { WarningBoxComponent } from '../../../ui-utilities/static-component/warning-box/warning-box.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-board-creation',
  standalone: true,
  imports: [TopbarComponent, ReactiveFormsModule, BoardGridComponent, WarningBoxComponent],
  providers: [EventsCompositionService],
  templateUrl: './board-creation.component.html',
  styleUrl: './board-creation.component.scss'
})
export class BoardCreationComponent implements AfterViewInit {
  lastVisits: LastVisits = new LastVisits;
  boardCreationForm: FormGroup<{name: FormControl<string | null>}>;
  warningDataIsPublic: string = 'WARNING_DATA_IS_PUBLIC';
  createBoardText: string = 'CREATE_BOARD';

  constructor(
    private _formBuilder: FormBuilder, 
    private _toaster: ToasterService, 
    private _boards: BoardsService,
    private _router: Router,
    private _events: EventsService,
    private _metaService: MetaService,
    private _translationService: TranslateService,
    ) {
    this.boardCreationForm = this._formBuilder.group({
      name: ['', Validators.required]
    });

    this._boards.recentUpdatedBoards()
      .then((lastVisits) => {
        this.lastVisits = lastVisits;
      });
    this._translationService.get([this.warningDataIsPublic, this.createBoardText])
      .subscribe((translatedMessages) => {
        this.warningDataIsPublic = translatedMessages[this.warningDataIsPublic];
        this.createBoardText = translatedMessages[this.createBoardText];
      })
  }

  ngAfterViewInit(): void {
    this._metaService.resetPageName();
  }

  onSubmit() {
    if (!this.boardCreationForm.valid) {
      this._toaster.error("Board name can't be '" + this.boardCreationForm.controls.name.value + "'");

      return;
    }
    const newBoard = new Board();
    newBoard.name = this.boardCreationForm.value.name ?? DEFAULT_BOARD_NAME;
    this._boards.create(newBoard)
      .then((justCreated) => {
        const boardCreated = new BoardedCreatedEvent();
        boardCreated.boardId = boardCreated.targetId = justCreated.id;
        boardCreated.board = justCreated;
        return this._events.create(boardCreated);
      }).then((e) => {
        this._router.navigate([SEGMENT_TO_BOARD_DETAIL, e.boardId]);
      });
  }
}
