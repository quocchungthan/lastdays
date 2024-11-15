export class WordOption {
   word: string = '';
}

export class Question {
   question: string = '';
   options: WordOption[] = [];
   correctAnswerIndex: number = -1;
}