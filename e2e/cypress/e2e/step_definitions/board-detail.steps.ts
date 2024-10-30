import { Then, When } from "cypress-cucumber-preprocessor/steps";
import { BoardDetailPage } from "../po/board-detail.page.po";

const boardDetail = new BoardDetailPage()

Then('The snapshot of the board should remain the same', () => {
   boardDetail.screenshot();
});

Then('The snapshot of the save icon should remain the same', () => {
   boardDetail.getToolBar().snapshotTheSaveIcon();
});

Then('The title of document should be {string}', (titleExpected) => {
   cy.title().should('eq', titleExpected);
});

When('I click at the text input icon in the toolbar', () => {
   boardDetail.getToolBar()
      .clickTextInput();
});

When('I click at the sticky note input icon in the toolbar', () => {
   boardDetail.getToolBar()
      .clickStickyNote();
});


When('I click on the board at position {int}, {int}', (x: number, y: number) => {
   boardDetail.click({x, y});
});

When('I press on the board and move from {int}, {int} to {int}, {int}', (x: number, y: number, dx: number, dy: number) => {
   boardDetail.pressMouseToALineForm({x, y}, {x: dx, y: dy});
});

