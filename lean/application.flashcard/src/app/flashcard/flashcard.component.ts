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

  selectedAnswerIndex: number | null = null;  // Track selected answer index
  isAnswerCorrect: boolean | null = null;  // Track whether the answer is correct

  ngOnInit(): void {
    if (!this.questionData) {
      console.error('No question data provided');
    }
  }

  // Method to check the selected answer
  checkAnswer(): void {
    if (this.selectedAnswerIndex !== null) {
      this.isAnswerCorrect = this.selectedAnswerIndex === this.questionData?.correctAnswerIndex;
    }
  }

  // Method to handle the selection of an answer
  selectAnswer(index: number): void {
    this.selectedAnswerIndex = index;
    this.checkAnswer();
  }

  // Optional method to reset the selected answer for the next question
  reset(): void {
    this.selectedAnswerIndex = null;
    this.isAnswerCorrect = null;
    this.onReset.emit();  // Emit the reset event to notify the parent to reload
  }
}
