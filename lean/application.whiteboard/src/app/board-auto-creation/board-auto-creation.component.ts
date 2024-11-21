import { AfterViewInit, Component } from '@angular/core';
import { BoardsService } from '../business/boards.service';
import { Router } from '@angular/router';
import { retryCreatingNewBoard } from '../../utils/promises.helper';

@Component({
  selector: 'app-board-auto-creation',
  standalone: true,
  imports: [],
  templateUrl: './board-auto-creation.component.html',
  styleUrl: './board-auto-creation.component.scss'
})
export class BoardAutoCreationComponent implements AfterViewInit {
  /**
   *
   */
  constructor(private boardsService: BoardsService, private router: Router) {
    
  }
  ngAfterViewInit(): void {
    retryCreatingNewBoard(() => this.boardsService.createNewBoardAsync())
      .then((createdId) => {
          setTimeout(() => {
            this.router.navigate(['board', createdId]);
          }, 5000);
      });
  }
}
