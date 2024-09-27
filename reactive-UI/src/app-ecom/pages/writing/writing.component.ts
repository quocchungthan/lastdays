import { Component } from '@angular/core';
import { NotionContentComponent } from "../../components/notion-content/notion-content.component";
import { HorizontalListComponent } from "../../components/horizontal-list/horizontal-list.component";

@Component({
  selector: 'app-writing',
  standalone: true,
  imports: [NotionContentComponent, HorizontalListComponent],
  templateUrl: './writing.component.html',
  styleUrl: './writing.component.scss'
})
export class WritingComponent {

}
