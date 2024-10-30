import { When } from "cypress-cucumber-preprocessor/steps";

When('I click at the logo', () => {
   cy.get('#topbar .main-logo ')
      .should('exist')
      .should('be.visible')
      .click();
});