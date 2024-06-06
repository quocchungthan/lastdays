import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface DropDownItem {
  id: string;
  name: string;
}

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './ui-dropdown.component.html',
  styleUrl: './ui-dropdown.component.scss'
})
export class UiDropdownComponent {
  @Input()
  selectedId: string = '';
  @Input()
  label: string = '';
  @Input()
  items: DropDownItem[] = [];
  @Output()
  itemSelected = new EventEmitter<string>();

  // TODO: can we close the dropdown once the item get selected
  select(event: MouseEvent, selectedId: string) {
    event.preventDefault();
    this.itemSelected.emit(selectedId);
  }

  get selectedName() {
    return this.items.find(x => x.id === this.selectedId)?.name;
  }
}
