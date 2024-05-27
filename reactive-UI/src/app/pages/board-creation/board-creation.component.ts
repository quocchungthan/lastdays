import { Component } from '@angular/core';
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

@Component({
  selector: 'app-board-creation',
  standalone: true,
  imports: [TopbarComponent, ReactiveFormsModule, BoardGridComponent],
  templateUrl: './board-creation.component.html',
  styleUrl: './board-creation.component.scss'
})
export class BoardCreationComponent {
  lastVisits: LastVisits = new LastVisits;
  boardCreationForm: FormGroup<{name: FormControl<string | null>}>;

  constructor(
    private _formBuilder: FormBuilder, 
    private _toaster: ToasterService, 
    private _boards: BoardsService,
    private _router: Router) {
    this.boardCreationForm = this._formBuilder.group({
      name: ['', Validators.required]
    });

    this._boards.recentUpdatedBoards()
      .then((lastVisits) => {
        this.lastVisits = lastVisits;
      });
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
        this._router.navigate([SEGMENT_TO_BOARD_DETAIL, justCreated.id]);
      });
  }
}
