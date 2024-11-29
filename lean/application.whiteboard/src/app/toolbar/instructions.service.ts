import { Injectable } from '@angular/core';
import { ShortcutInstruction } from '../_area-base/shortkeys-instruction.model';

@Injectable()
export class InstructionsService {
  pencilDefaultInstruction: ShortcutInstruction[] = [
    {
      key: 'Hold and move',
      explanation: 'To draw'
    },
    {
      key: 'Wheel',
      explanation: 'To zoom',
    },
    {
      key: 'Ctrl + Wheel',
      explanation: 'To zoom backward',
    },
  ];

  workflowBoardDefaultInstruction: ShortcutInstruction[] = [
    {
      key: 'Hold and move',
      explanation: 'To select and area then type in the prompt'
    },
    {
      key: 'Wheel',
      explanation: 'To zoom',
    },
    {
      key: 'Ctrl + Wheel',
      explanation: 'To zoom backward',
    },
  ];

  workflowBoardAskingForPromptInstruction: ShortcutInstruction[] = [
    {
      key: 'Esc',
      explanation: 'To Cancel'
    },
    {
      key: 'Wheel',
      explanation: 'To zoom',
    },
    {
      key: 'Ctrl + Wheel',
      explanation: 'To zoom backward',
    },
  ];

  arrowDefaultInstruction: ShortcutInstruction[] = [
    {
      key: 'Hold and move',
      explanation: 'To add the arrow'
    },
    {
      key: 'Wheel',
      explanation: 'To zoom',
    },
    {
      key: 'Ctrl + Wheel',
      explanation: 'To zoom backward',
    },
  ]
  
  eraserDefaultInstruction: ShortcutInstruction[] = [
    {
      key: 'Hold and move',
      explanation: 'To remove the whole object'
    },
    {
      key: 'Wheel',
      explanation: 'To zoom',
    },
    {
      key: 'Ctrl + Wheel',
      explanation: 'To zoom backward',
    },
  ]

  
  baseDefaultToolInstruction: ShortcutInstruction[] = [
    {
      key: 'Drag',
      explanation: 'To move',
    },
    {
      key: 'Right-click',
      explanation: 'To select existing text',
    },
    {
      key: 'Wheel',
      explanation: 'To zoom',
    },
    {
      key: 'Ctrl + Wheel',
      explanation: 'To zoom backward',
    },
  ];

  

  textDefaultInstrution = [
    {
      key: 'Click',
      explanation: 'Start writing text',
    },
    {
      key: 'Right-Click',
      explanation: 'Select existing text',
    },
    {
      key: 'Wheel',
      explanation: 'To zoom',
    },
    {
      key: 'Ctrl + Wheel',
      explanation: 'To zoom backward',
    },
  ];

  textSelectedInstrution = [
    {
      key: 'Esc',
      explanation: 'To cancel selection',
    },
    {
      key: 'Right-Click',
      explanation: 'Select existing text',
    },
    {
      key: 'Click outside',
      explanation: 'To cancel selection',
    },
    {
      key: 'Wheel',
      explanation: 'To zoom',
    },
    {
      key: 'Ctrl + Wheel',
      explanation: 'To zoom backward',
    },
  ];

  textInputPopupShownInstruction = [
    {
      key: 'Ctrl + Enter',
      explanation: 'To submit the text',
    },
    {
      key: 'Esc',
      explanation: 'To Cancel',
    },
    {
      key: 'Wheel',
      explanation: 'To zoom',
    },
    {
      key: 'Ctrl + Wheel',
      explanation: 'To zoom backward',
    },
  ];

  constructor() { }
}
