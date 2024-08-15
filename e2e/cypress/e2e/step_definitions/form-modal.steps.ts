import { Then } from "cypress-cucumber-preprocessor/steps";

Then('The Text Input Dialog should be present', () => {
   cy.get('[data-cy=form-modal]').matchImageSnapshot();
});
