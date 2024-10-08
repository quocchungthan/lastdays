import { Then, When } from "cypress-cucumber-preprocessor/steps";

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