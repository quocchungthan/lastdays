import { Component } from '@angular/core';
import { Question } from '../backend.services/flashcard.entity';
import { FlashcardComponent } from './flashcard/flashcard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FlashcardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'application.flashcard';
  currentQuestion: Question | null = null;

  constructor() {}

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
  }

  // Listen to the reset event from FlashcardComponent and reload the question
  onQuestionReset(): void {
    this.fetchQuestion();
  }
}
