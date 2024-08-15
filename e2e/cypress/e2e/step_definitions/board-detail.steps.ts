import { Then, When } from "cypress-cucumber-preprocessor/steps";
import { BoardDetailPage } from "../po/board-detail.page.po";

const boardDetail = new BoardDetailPage()

Then('The snapshot of the board should remain the same', () => {
   boardDetail.screenshot();
});

When('I click at the text input icon in the toolbar', () => {
   boardDetail.getToolBar()
      .clickTextInput();
});

When('I click on the board at position {int}, {int}', (x: number, y: number) => {
   boardDetail.click({x, y});
});
