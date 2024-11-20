import { Component, Input } from '@angular/core';
import { ALAppNavigation } from '../../models/app-navigation.alportal.model';

@Component({
  selector: 'al-app-navigation',
  standalone: true,
  imports: [],
  templateUrl: './app-navigation.component.html',
  styleUrl: './app-navigation.component.scss'
})
export class AppNavigationComponent {
  @Input()
  appNavigationList: ALAppNavigation[] = [];
}
