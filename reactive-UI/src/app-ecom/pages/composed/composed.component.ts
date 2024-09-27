import { Component } from '@angular/core';
import { FilteredResultComponent } from "../../components/filtered-result/filtered-result.component";
import { HorizontalListComponent } from "../../components/horizontal-list/horizontal-list.component";

@Component({
  selector: 'app-composed',
  standalone: true,
  imports: [FilteredResultComponent, HorizontalListComponent],
  templateUrl: './composed.component.html',
  styleUrl: './composed.component.scss'
})
export class ComposedComponent {

}
