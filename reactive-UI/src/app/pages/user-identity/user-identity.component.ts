import { Component } from '@angular/core';
import { TopbarComponent } from '../../../ultilities/layout/topbar/topbar.component';

@Component({
  selector: 'app-user-identity',
  standalone: true,
  imports: [TopbarComponent],
  templateUrl: './user-identity.component.html',
  styleUrl: './user-identity.component.scss'
})
export class UserIdentityComponent {

}
