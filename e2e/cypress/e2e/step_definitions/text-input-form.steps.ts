import { Then, When } from "cypress-cucumber-preprocessor/steps";

When('I type {string} in the text area', (text: string) => {
   cy.get('[data-cy=text-input-command-text-editor]')
      .should('exist')
      .find('textarea')
      .should('exist')
      .type(text);
});