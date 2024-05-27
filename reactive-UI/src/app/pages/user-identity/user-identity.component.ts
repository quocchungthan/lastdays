import { Component } from '@angular/core';
import { TopbarComponent } from '../../../ultilities/layout/topbar/topbar.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IdentitiesService } from '../../services/data-storages/identities.service';
import { ToasterService } from '../../services/ui-notifications/toaster.service';
import { BoardsService } from '../../services/data-storages/boards.service';
import { Board } from '../../services/data-storages/entities/Board';
import { DEFAULT_USER_NAME } from '../../configs/default-value.constants';
import { UserIdentity } from '../../services/data-storages/entities/Identity';
import { cloneDeep } from 'lodash';
import { BoardBasicData } from '../../viewmodels/agile-domain/last-visits.viewmodel';
import { BoardGridComponent } from '../../components/board-grid/board-grid.component';

@Component({
  selector: 'app-user-identity',
  standalone: true,
  imports: [TopbarComponent, ReactiveFormsModule, BoardGridComponent],
  templateUrl: './user-identity.component.html',
  styleUrl: './user-identity.component.scss'
})
export class UserIdentityComponent {
  userForm: FormGroup<{displayName: FormControl<string | null>, id: FormControl<string | null>}>;
  allBoards: BoardBasicData[] = [];
  currentUser: UserIdentity | null | undefined;

  constructor(
    private _formBuilder: FormBuilder, 
    private _toaster: ToasterService, 
    private _identityService: IdentitiesService,
    private _boards: BoardsService) {
    this.userForm = this._formBuilder.group({
      id: ['', Validators.required],
      displayName: ['', Validators.required]
    });

    this._boards.getMyBoards()
      .then((all) => {
        this.allBoards = all.map(this._boards.mapToBasicData);
      });
    this._identityService
      .getCurrentIdentity()
      .then((currentUser) => {
        this.currentUser = currentUser;
        this.userForm.controls.displayName.setValue(currentUser?.displayName ?? '');
        this.userForm.controls.id.setValue(currentUser?.id ?? '');
      })
  }

  onSubmit() {
    if (!this.userForm.valid) {
      this._toaster.error(JSON.stringify(this.userForm.errors));

      return;
    }
    const updatedUser = cloneDeep(this.currentUser ?? new UserIdentity());
    updatedUser.displayName = this.userForm.value.displayName ?? DEFAULT_USER_NAME;
    this._identityService.update(updatedUser)
      .then(() => {
        this._toaster.info('User updated');
      });
  }
}
