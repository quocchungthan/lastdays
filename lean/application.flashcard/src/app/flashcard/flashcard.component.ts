import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Question } from '../../backend.services/flashcard.entity';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.scss'],
})
export class FlashcardComponent {
  @Input() questionData: Question | null = null;  // Input question data
  @Output() onReset: EventEmitter<void> = new EventEmitter<void>();  // EventEmitter for resetting

  selectedAnswerIndex: number | null = -1;  // Track selected answer index
  isAnswerCorrect: boolean | null = null;  // Track whether the answer is correct

  fetchNewQuestion(): void {
    this.onReset.emit();
  }

  checkAnswer(): void {
    if (this.selectedAnswerIndex !== -1) {
      this.isAnswerCorrect = this.selectedAnswerIndex === this.questionData?.correctAnswerIndex;
    }
  }

  selectAnswer(index: number): void {
    this.selectedAnswerIndex = index;
    this.checkAnswer();
    if (this.questionData && this.isAnswerCorrect) {
      this.selectedAnswerIndex = -1;
      this.isAnswerCorrect = null;
      this.fetchNewQuestion();
    }
  }
}
