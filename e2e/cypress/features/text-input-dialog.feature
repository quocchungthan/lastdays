Feature: Text Input Dialog

Scenario: It can be open with toolbar option
   When I open the home page
   And I input 'first board' the board name and click submit
   And I click at the text input icon in the toolbar
   And I click on the board at position 300, 120
   Then The Text Input Dialog should be present

Scenario: It can attach text into the board after Submit
   When I open the home page
   And I input 'first board' the board name and click submit
   And I click at the text input icon in the toolbar
   And I click on the board at position 300, 120
   And I type 'Lengendary text' in the text area
   And I click the Submit button of form modal
   Then The snapshot of the board should remain the same

Scenario: It can attach text into a sticky note after Submit
   When I open the home page
   And I input 'first board' the board name and click submit
   And I click at the sticky note input icon in the toolbar
   And I click on the board at position 320, 140
   And I click at the text input icon in the toolbar
   And I click on the board at position 300, 120
   And I type 'Lengendary text' in the text area
   And I click the Submit button of form modal
   And I press on the board and move from 300, 120 to 600, 300
   Then The snapshot of the board should remain the same

Scenario: It can pick the color and size for text
   When I open the home page
   And I input 'first board' the board name and click submit
   And I click at the text input icon in the toolbar
   And I click on the board at position 300, 120
   And I type 'Lengendary text' in the text area
   And I choose 4th color in the color board
   And I choose 5th color in the color board
   And I choose 6th color in the color board
   And I choose 3th color in the color board
   And I click the Submit button of form modal
   Then The snapshot of the board should remain the same

Scenario: It can be cancelled
   When I open the home page
   And I input 'first board' the board name and click submit
   And I click at the text input icon in the toolbar
   And I click on the board at position 300, 120
   And I type 'Lengendary text' in the text area
   And I click the Cancel button of form modal
   Then The snapshot of the board should remain the same