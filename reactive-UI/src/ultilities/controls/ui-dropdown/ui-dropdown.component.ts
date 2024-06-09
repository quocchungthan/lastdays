import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { DropdownOptions, initDropdowns } from 'flowbite';
import { Dropdown } from 'flowbite';

export interface DropDownItem {
  id: string;
  name: string;
}

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './ui-dropdown.component.html',
  styleUrl: './ui-dropdown.component.scss',
})
export class UiDropdownComponent implements OnInit {
  @Input()
  selectedId: string = '';
  @Input()
  label: string = '';
  @Input()
  items: DropDownItem[] = [];
  @Output()
  itemSelected = new EventEmitter<string>();
  dropdownInstance: any;

  ngOnInit(): void {
    initDropdowns();
    this.initDropdownsInstance()
  }

  // TODO: can we close the dropdown once the item get selected
  select(event: MouseEvent, selectedId: string) {
    this.dropdownInstance.hide();
    event.preventDefault();
    this.itemSelected.emit(selectedId);
  }

  get selectedName() {
    return this.items.find((x) => x.id === this.selectedId)?.name;
  }

  private initDropdownsInstance() {
    const $targetEl = document.getElementById('dropdownNavbar');

    // set the element that trigger the dropdown menu on click
    const $triggerEl = document.getElementById('dropdownNavbarLink');

    // options with default values
    const options: DropdownOptions = {
      placement: 'bottom',
      triggerType: 'click',
      offsetSkidding: 0,
      offsetDistance: 10,
      delay: 300,
      ignoreClickOutsideClass: false,
      onHide: () => {
        console.log('dropdown has been hidden');
      },
      onShow: () => {
        console.log('dropdown has been shown');
      },
      onToggle: () => {
        console.log('dropdown has been toggled');
      },
    };

    // instance options object
    const instanceOptions = {
      id: 'dropdownMenu',
      override: true,
    };

    this.dropdownInstance = new Dropdown(
      $targetEl,
      $triggerEl,
      options,
      instanceOptions
    );
  }
}