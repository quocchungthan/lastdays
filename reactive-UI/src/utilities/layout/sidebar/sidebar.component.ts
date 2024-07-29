import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GoogleSwipeComponent } from '../../icons/google-swipe/google-swipe.component';

@Component({
  selector: 'sidebar',
  standalone: true,
  imports: [RouterModule, GoogleSwipeComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

}
