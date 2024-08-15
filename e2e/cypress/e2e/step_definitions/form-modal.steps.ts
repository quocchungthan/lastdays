import { Then, When } from "cypress-cucumber-preprocessor/steps";

Then('The Text Input Dialog should be present', () => {
   cy.get('[data-cy=form-modal]').matchImageSnapshot();
});

When('I click the Submit button of form modal', () => {
   cy.get('[data-cy=form-modal]')
      .should('exist')
      .find('[data-cy=submit-button]')
      .should('exist')
      .click();
});

When('I click the Cancel button of form modal', () => {
   cy.get('[data-cy=form-modal]')
      .should('exist')
      .find('[data-cy=cancel-button]')
      .should('exist')
      .click();
});