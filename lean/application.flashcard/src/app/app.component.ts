import { Component } from '@angular/core';
import { Question } from '../backend.services/flashcard.entity';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { AppNavigationComponent } from '@cbto/nodepackages.utils/frontend-components/app-navigation/app-navigation.component';
import { ALAppNavigation } from '@cbto/nodepackages.utils/models/app-navigation.alportal.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FlashcardComponent, AppNavigationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'application.flashcard';
  currentQuestion: Question | null = null;
  private _appNavigationList: ALAppNavigation[] = [];

  constructor() {}

  get appNavigationList() {
    return this._appNavigationList;
  }

  ngOnInit(): void {
    this.fetchQuestion();
  }

  // Fetch question from the API
  fetchQuestion(): void {
    this.currentQuestion = null;
    fetch('/api/assistant/question')
      .then((data) => data.json())
      .then((data) => {
        this.currentQuestion = data;
      })
      .catch((error) => {
        console.error('Error fetching question:', error);
      });
    fetch('/api/portal/app-navigation').then((response) => response.json())
      .then((data) => {
        this._appNavigationList = data;
      });
  }

  // Listen to the reset event from FlashcardComponent and reload the question
  onQuestionReset(): void {
    this.fetchQuestion();
  }
}
