import { AfterViewInit, Component } from '@angular/core';
import { LastVisits } from '../../viewmodels/agile-domain/last-visits.viewmodel';
import { TopbarComponent } from '../../../ultilities/layout/topbar/topbar.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToasterService } from '../../services/ui-notifications/toaster.service';
import { BoardsService } from '../../services/data-storages/boards.service';
import { Board } from '../../services/data-storages/entities/Board';
import { Router } from '@angular/router';
import { SEGMENT_TO_BOARD_DETAIL } from '../../configs/routing.consants';
import { DEFAULT_BOARD_NAME } from '../../configs/default-value.constants';
import { BoardGridComponent } from '../../components/board-grid/board-grid.component';
import { EventsService } from '../../services/data-storages/events.service';
import { BoardedCreatedEvent } from '../../events/drawings/EventQueue';
import { IdentitiesService } from '../../services/data-storages/identities.service';
import { EventsCompositionService } from '../../events/drawings/events-composition.service';
import { MetaService } from '../../services/browser/meta.service';
import { WarningBoxComponent } from '../../../ultilities/static-component/warning-box/warning-box.component';

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

  constructor(
    private _formBuilder: FormBuilder, 
    private _toaster: ToasterService, 
    private _boards: BoardsService,
    private _router: Router,
    private _events: EventsService,
    private _metaService: MetaService,
    private _identities: IdentitiesService) {
    this.boardCreationForm = this._formBuilder.group({
      name: ['', Validators.required]
    });

    this._boards.recentUpdatedBoards()
      .then((lastVisits) => {
        this.lastVisits = lastVisits;
      });
  }

  ngAfterViewInit(): void {
    this._metaService.resetPageName();
  }

  onSubmit() {
    if (!this.boardCreationForm.valid) {
      this._toaster.error(JSON.stringify(this.boardCreationForm.errors));

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
