import { When } from "cypress-cucumber-preprocessor/steps";
import { BoardDetailPage } from "../po/board-detail.page.po";

const boardDetail = new BoardDetailPage();

When('I type {string} in the text area', (text: string) => {
   cy.get('[data-cy=text-input-command-text-editor]')
      .should('exist')
      .find('textarea')
      .should('exist')
      .type(text);
});

When('I choose {int}th color in the color board', (index: number) => {
   cy.get('color-board')
      .should('exist')
      .find('.color-box')
      .eq(index)
      .should('exist')
      .click();
});

When('I rotate the text a bit from anchor {int}, {int}', (x, y) => {
   boardDetail.pressMouseToALineForm({x, y}, {x: x + 30, y: y});
});
