import { Component } from '@angular/core';
import { IdentitiesService } from '../../../app/services/data-storages/identities.service';
import { RouterModule } from '@angular/router';
import { SEGMENT_TO_IDENTITY_PAGE } from '../../../app/configs/routing.consants';

@Component({
  selector: 'topbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  currentUserId: string | undefined;
  segmentToUserIdentity = SEGMENT_TO_IDENTITY_PAGE;
  
  constructor(public userIdentityService: IdentitiesService) {
    userIdentityService.getCurrentIdentity()
      .then((user) => {
        this.currentUserId = user?.id;
      });
  }
}
