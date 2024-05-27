import { Component } from '@angular/core';
import { IdentitiesService } from '../../../app/services/data-storages/identities.service';
import { RouterModule } from '@angular/router';
import { SEGMENT_TO_IDENTITY_PAGE } from '../../../app/configs/routing.consants';
import { TOP_BAR } from '../../../app/configs/html-ids.constants';
import { UserComponent } from '../../icons/user/user.component';

@Component({
  selector: 'topbar',
  standalone: true,
  imports: [RouterModule, UserComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  currentUserId: string | undefined;
  segmentToUserIdentity = SEGMENT_TO_IDENTITY_PAGE;
  TOP_BAR = TOP_BAR;
  
  constructor(public userIdentityService: IdentitiesService) {
    userIdentityService.getCurrentIdentity()
      .then((user) => {
        this.currentUserId = user?.id;
      });
  }

  get height() {
    const element = document.getElementById(TOP_BAR);
    if (!element) {
      return 0;
    }
    const computed = getComputedStyle(element);
    return parseFloat(computed.height) + parseFloat(computed.marginTop) + parseFloat(computed.marginBottom);
  }
}
