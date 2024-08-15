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