import { afterNextRender, Component } from '@angular/core';
import { ALEventConstructionService } from '../../data-storage/construction-services/event-construction.service';
import { EventStorageService } from '../../data-storage/storage-services/event.storage.service';
import { Router } from '@angular/router';
import { DataStorageService } from '../../infrastructure.browser/datastorage.service';

@Component({
  selector: 'app-board-auto-creation',
  standalone: true,
  imports: [],
  providers: [ALEventConstructionService, EventStorageService, DataStorageService],
  templateUrl: './board-auto-creation.component.html',
  styleUrl: './board-auto-creation.component.scss'
})
export class BoardAutoCreationComponent {
  constructor(
    private eventConstruction: ALEventConstructionService,
    private eventStorage: EventStorageService,
    private router: Router) {
    afterNextRender(() => {
      this.csrInit();
    });
  }

  csrInit() {
    const autoCreatedBoard = this.eventConstruction.boardCreated();
    this.eventStorage.insert(autoCreatedBoard)
      .then(inserted => {
        this.router.navigate(['board', inserted.boardId]);
      })
      .catch(err => console.log(err));
  }
}
