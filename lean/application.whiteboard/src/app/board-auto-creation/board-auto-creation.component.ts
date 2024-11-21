import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-board-auto-creation',
  standalone: true,
  imports: [],
  templateUrl: './board-auto-creation.component.html',
  styleUrl: './board-auto-creation.component.scss'
})
export class BoardAutoCreationComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    // Simulate a loading delay (like waiting for an API or data to load)
    setTimeout(() => {
      // Here we can communicate with parent component to hide the loading screen
    }, 5000); // Adjust time as needed
  }
}
