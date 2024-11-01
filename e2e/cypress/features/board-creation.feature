Feature: Board can be created

Scenario: display the board immediately after created from home page
  When I open the home page
  And I input 'first board' the board name and click submit
  Then The snapshot of the board should remain the same

Scenario: boards I created should be saved automatically
  When I open the home page
  And I input 'first board' the board name and click submit
  Then The snapshot of the save icon should remain the same


Scenario: create multiple board in a short time
  When I open the home page
  And I input '1st board' the board name and click submit
  And I click at the logo
  And I input '2nd board' the board name and click submit
  And I click at the logo
  And I input '3rd board' the board name and click submit
  And I click at the logo
  And I input '4th board' the board name and click submit
  And I click at the logo
  And I input '5th board' the board name and click submit
  And I click at the logo
  And I input '6th board' the board name and click submit
  And I click at the logo
  And I input '7th board' the board name and click submit
  And I click at the logo
  And I input '8th board' the board name and click submit
  And I click at the logo
  And I input '9th board' the board name and click submit
  And I click at the logo
  And I input '10th board' the board name and click submit
  And I click at the logo
  And I input '11th board' the board name and click submit
  And I click at the logo
  And I input '12th board' the board name and click submit
  And I click at the logo
  And I input '13th board' the board name and click submit
  Then The snapshot of the board should remain the same
  And The title of document should be 'Board - 13th board'