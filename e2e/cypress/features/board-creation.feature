Feature: Board can be created

Scenario: display the board immediately after created from home page
  When I open the home page
  And I input 'first board' the board name and click submit
  Then The snapshot of the board should remain the same