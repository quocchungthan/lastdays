import { Component } from '@angular/core';
import { LastVisits } from '../../viewmodels/agile-domain/last-visits.viewmodel';

@Component({
  selector: 'app-board-creation',
  standalone: true,
  imports: [],
  templateUrl: './board-creation.component.html',
  styleUrl: './board-creation.component.scss'
})
export class BoardCreationComponent {
  lastVisits: LastVisits = new LastVisits;
}
